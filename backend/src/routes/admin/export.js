const router = require('express').Router();
const Order = require('../../models/Order');
const PaymentRequest = require('../../models/PaymentRequest');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { toCSV } = require('../../utils/csv');

router.use(requireAdmin, requirePermission('manageOrders'));

router.get('/orders.csv', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  const csv = toCSV(orders, [
    { label: 'رقم الطلب', value: (o) => o._id },
    { label: 'الاسم', value: (o) => o.buyerName },
    { label: 'الهاتف', value: (o) => o.buyerPhone },
    { label: 'المدينة', value: (o) => o.city },
    { label: 'النوع', value: (o) => (o.type === 'reservation' ? 'حجز' : 'شراء') },
    { label: 'الإجمالي', value: (o) => o.total },
    { label: 'المطلوب دفعه', value: (o) => o.amountDue },
    { label: 'الحالة', value: (o) => o.status },
    { label: 'التاريخ', value: (o) => o.createdAt.toISOString() },
  ]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
  res.send(csv);
});

router.get('/payment-requests.csv', async (req, res) => {
  const prs = await PaymentRequest.find().populate('order', 'buyerName buyerPhone').populate('paymentMethod', 'name').sort({ createdAt: -1 });
  const csv = toCSV(prs, [
    { label: 'رقم الطلب', value: (p) => p.order?._id || '' },
    { label: 'الاسم', value: (p) => p.buyerName },
    { label: 'طريقة الدفع', value: (p) => p.paymentMethod?.name || '' },
    { label: 'المبلغ', value: (p) => p.amount },
    { label: 'الحالة', value: (p) => p.status },
    { label: 'التاريخ', value: (p) => p.createdAt.toISOString() },
  ]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="payment-requests.csv"');
  res.send(csv);
});

module.exports = router;
