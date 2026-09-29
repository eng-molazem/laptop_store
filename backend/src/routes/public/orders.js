const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../../models/Order');
const PaymentRequest = require('../../models/PaymentRequest');
const Product = require('../../models/Product');
const Coupon = require('../../models/Coupon');
const StoreSettings = require('../../models/StoreSettings');
const Cart = require('../../models/Cart');
const { uploadPaymentProof } = require('../../middleware/upload');
const { emitAdminEvent } = require('../../sockets');

// POST /api/orders
// body: { items: [{product, qty}], buyerName, buyerPhone, buyerEmail?, city, address, couponCode?, type, guestId }
router.post('/', async (req, res) => {
  try {
    const { items = [], buyerName, buyerPhone, buyerEmail = '', city, address, couponCode, type = 'purchase', guestId } = req.body;

    if (!items.length) return res.status(400).json({ message: 'السلة فارغة' });
    if (!buyerName || !buyerPhone || !city || !address) {
      return res.status(400).json({ message: 'يرجى تعبئة الاسم والهاتف والمدينة والعنوان' });
    }

    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const p = productMap.get(String(it.product));
      if (!p) return res.status(400).json({ message: 'أحد المنتجات لم يعد متوفراً' });
      const qty = Math.max(1, Number(it.qty) || 1);
      if (p.stock < qty) return res.status(400).json({ message: `الكمية المتوفرة من "${p.name_ar}" غير كافية` });
      const price = p.effectivePrice;
      subtotal += price * qty;
      orderItems.push({ product: p._id, name: p.name_ar, image: p.images[0] || '', qty, price });
    }

    const settings = await StoreSettings.getSingleton();
    const rate = settings.shippingRates.find((r) => r.city === city);
    const shippingCost = rate ? rate.cost : 0;

    let discountAmount = 0;
    let appliedCouponCode = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim() });
      if (coupon) {
        const check = coupon.isValidNow(subtotal);
        if (check.ok) {
          discountAmount = coupon.computeDiscount(subtotal);
          appliedCouponCode = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    let reservationPercent = null;
    let amountDue = total;
    if (type === 'reservation') {
      // use per-product override if a single product carries one, else store default
      const overridePercents = products.map((p) => p.reservationPercent).filter((v) => v != null);
      reservationPercent = overridePercents.length ? overridePercents[0] : settings.reservationPercentDefault;
      amountDue = Math.round((total * reservationPercent) / 100);
    }

    const order = new Order({
      items: orderItems,
      buyerName,
      buyerPhone,
      buyerEmail,
      city,
      address,
      shippingCost,
      subtotal,
      discountAmount,
      couponCode: appliedCouponCode,
      total,
      type,
      reservationPercent,
      amountDue,
      guestId: guestId || 'unknown',
    });
    order.pushStatus('awaiting_payment', 'تم إنشاء الطلب');
    await order.save();

    // decrement stock
    for (const it of orderItems) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
    }

    if (guestId) {
      await Cart.findOneAndUpdate({ guestId }, { $set: { convertedToOrder: true, items: [] } });
    }

    emitAdminEvent('order:new', { orderId: order._id, buyerName: order.buyerName, total: order.total });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الطلب' });
  }
});

// POST /api/orders/:id/payment-requests (multipart)
router.post('/:id/payment-requests', uploadPaymentProof.single('proofImage'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    const { amount, paymentMethod, note = '' } = req.body;
    if (!amount || !paymentMethod) return res.status(400).json({ message: 'المبلغ وطريقة الدفع مطلوبان' });

    const proofImageUrl = req.file ? `/uploads/payment-proofs/${req.file.filename}` : '';

    const paymentRequest = await PaymentRequest.create({
      order: order._id,
      amount: Number(amount),
      paymentMethod,
      buyerName: order.buyerName,
      note,
      proofImageUrl,
    });

    if (order.status === 'awaiting_payment' || order.status === 'rejected') {
      order.pushStatus('payment_review', 'تم تقديم طلب دفع للمراجعة');
      await order.save();
    }

    emitAdminEvent('paymentRequest:new', { paymentRequestId: paymentRequest._id, orderId: order._id, buyerName: order.buyerName, amount: paymentRequest.amount });

    res.status(201).json(paymentRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال طلب الدفع' });
  }
});

// GET /api/orders/:id/track?phone=
router.get('/:id/track', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'رقم طلب غير صحيح' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

  const { phone } = req.query;
  if (!phone || String(phone).trim() !== order.buyerPhone) {
    return res.status(403).json({ message: 'رقم الهاتف غير مطابق لهذا الطلب' });
  }

  const paymentRequests = await PaymentRequest.find({ order: order._id })
    .populate('paymentMethod', 'name')
    .sort({ createdAt: -1 });

  res.json({ order, paymentRequests });
});

module.exports = router;
