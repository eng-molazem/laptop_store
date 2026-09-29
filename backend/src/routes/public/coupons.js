const router = require('express').Router();
const Coupon = require('../../models/Coupon');

// POST /api/coupons/validate { code, subtotal }
router.post('/validate', async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) return res.status(400).json({ message: 'أدخل كود الخصم' });

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  if (!coupon) return res.status(404).json({ message: 'كود الخصم غير صحيح' });

  const check = coupon.isValidNow(Number(subtotal));
  if (!check.ok) {
    const messages = {
      coupon_inactive: 'كود الخصم غير مفعّل',
      coupon_expired: 'كود الخصم منتهي الصلاحية',
      coupon_exhausted: 'تم استنفاد عدد مرات استخدام هذا الكود',
      coupon_min_order: `الحد الأدنى للطلب لاستخدام هذا الكود هو ${coupon.minOrder} ل.س`,
    };
    return res.status(400).json({ message: messages[check.reason] || 'كود الخصم غير صالح' });
  }

  const discountAmount = coupon.computeDiscount(Number(subtotal));
  res.json({ code: coupon.code, type: coupon.type, value: coupon.value, discountAmount });
});

module.exports = router;
