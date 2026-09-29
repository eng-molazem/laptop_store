const router = require('express').Router();
const Coupon = require('../../models/Coupon');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageCoupons'));

router.get('/', async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

router.post('/', async (req, res) => {
  const { code, type, value, minOrder = 0, maxUses = null, expiresAt = null } = req.body;
  if (!code || !type || value == null) return res.status(400).json({ message: 'الكود والنوع والقيمة مطلوبة' });
  try {
    const coupon = await Coupon.create({ code: code.toUpperCase().trim(), type, value, minOrder, maxUses, expiresAt });
    await logAction(req.admin, 'create_coupon', { targetType: 'Coupon', targetId: coupon._id, details: coupon.code });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'هذا الكود مستخدم مسبقاً' });
    res.status(400).json({ message: 'حدث خطأ أثناء إضافة الكود' });
  }
});

router.put('/:id', async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'الكود غير موجود' });
  const { code, type, value, minOrder, maxUses, expiresAt, isActive } = req.body;
  if (code !== undefined) coupon.code = String(code).toUpperCase().trim();
  if (type !== undefined) coupon.type = type;
  if (value !== undefined) coupon.value = value;
  if (minOrder !== undefined) coupon.minOrder = minOrder;
  if (maxUses !== undefined) coupon.maxUses = maxUses;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
  if (isActive !== undefined) coupon.isActive = isActive;
  await coupon.save();
  await logAction(req.admin, 'update_coupon', { targetType: 'Coupon', targetId: coupon._id, details: coupon.code });
  res.json(coupon);
});

router.delete('/:id', async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'الكود غير موجود' });
  await logAction(req.admin, 'delete_coupon', { targetType: 'Coupon', targetId: coupon._id, details: coupon.code });
  res.json({ ok: true });
});

module.exports = router;
