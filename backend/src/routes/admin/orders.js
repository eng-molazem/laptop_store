const router = require('express').Router();
const Order = require('../../models/Order');
const { STATUS_FLOW } = require('../../models/Order');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');
const { emitOrderUpdate } = require('../../sockets');

router.use(requireAdmin, requirePermission('manageOrders'));

router.get('/', async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { buyerName: new RegExp(search, 'i') },
      { buyerPhone: new RegExp(search, 'i') },
    ];
  }
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
  res.json(order);
});

// advance order status manually (processing -> shipped -> delivered), or cancel
router.patch('/:id/status', async (req, res) => {
  const { status, note = '' } = req.body;
  const allowed = [...STATUS_FLOW, 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'حالة غير صحيحة' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

  order.pushStatus(status, note);
  await order.save();
  await logAction(req.admin, 'update_order_status', { targetType: 'Order', targetId: order._id, details: status });
  emitOrderUpdate(order._id, 'order:statusChanged', { orderId: order._id, status });

  res.json(order);
});

module.exports = router;
