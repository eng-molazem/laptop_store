const router = require('express').Router();
const PaymentRequest = require('../../models/PaymentRequest');
const Order = require('../../models/Order');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');
const { emitOrderUpdate } = require('../../sockets');
const { sendMail } = require('../../utils/mailer');

router.use(requireAdmin, requirePermission('managePaymentRequests'));

router.get('/', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    PaymentRequest.find(filter)
      .populate('order', 'buyerName buyerPhone total amountDue type status')
      .populate('paymentMethod', 'name')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    PaymentRequest.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.patch('/:id/approve', async (req, res) => {
  const pr = await PaymentRequest.findById(req.params.id).populate('order');
  if (!pr) return res.status(404).json({ message: 'طلب الدفع غير موجود' });
  if (pr.status !== 'pending') return res.status(400).json({ message: 'تمت مراجعة هذا الطلب مسبقاً' });

  pr.status = 'approved';
  pr.reviewedBy = req.admin._id;
  pr.reviewedAt = new Date();
  await pr.save();

  const order = pr.order;
  if (order) {
    order.pushStatus('paid', 'تمت الموافقة على الدفع');
    await order.save();
  }

  await logAction(req.admin, 'approve_payment_request', { targetType: 'PaymentRequest', targetId: pr._id, details: `الطلب ${order?._id}` });

  emitOrderUpdate(order?._id, 'paymentRequest:approved', { orderId: order?._id, paymentRequestId: pr._id });

  if (order?.buyerEmail) {
    sendMail({
      to: order.buyerEmail,
      subject: 'تمت الموافقة على طلب الدفع الخاص بك',
      html: `<p>مرحباً ${order.buyerName}،</p><p>تمت الموافقة على طلب الدفع الخاص بطلبك رقم ${order._id}. سيتم البدء بتجهيز طلبك.</p>`,
    }).catch(() => {});
  }

  res.json(pr);
});

router.patch('/:id/reject', async (req, res) => {
  const { rejectionReason = '' } = req.body;
  const pr = await PaymentRequest.findById(req.params.id).populate('order');
  if (!pr) return res.status(404).json({ message: 'طلب الدفع غير موجود' });
  if (pr.status !== 'pending') return res.status(400).json({ message: 'تمت مراجعة هذا الطلب مسبقاً' });

  pr.status = 'rejected';
  pr.reviewedBy = req.admin._id;
  pr.reviewedAt = new Date();
  pr.rejectionReason = rejectionReason;
  await pr.save();

  const order = pr.order;
  if (order) {
    order.pushStatus('rejected', rejectionReason || 'تم رفض طلب الدفع');
    await order.save();
  }

  await logAction(req.admin, 'reject_payment_request', { targetType: 'PaymentRequest', targetId: pr._id, details: rejectionReason });

  emitOrderUpdate(order?._id, 'paymentRequest:rejected', { orderId: order?._id, paymentRequestId: pr._id, rejectionReason });

  if (order?.buyerEmail) {
    sendMail({
      to: order.buyerEmail,
      subject: 'تم رفض طلب الدفع الخاص بك',
      html: `<p>مرحباً ${order.buyerName}،</p><p>تم رفض طلب الدفع الخاص بطلبك رقم ${order._id}.</p><p>السبب: ${rejectionReason || 'غير محدد'}</p><p>يمكنك إعادة تقديم طلب دفع جديد من صفحة تتبع طلبك.</p>`,
    }).catch(() => {});
  }

  res.json(pr);
});

module.exports = router;
