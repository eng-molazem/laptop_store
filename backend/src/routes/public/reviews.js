const router = require('express').Router();
const Review = require('../../models/Review');
const Product = require('../../models/Product');
const { reviewLimiter } = require('../../middleware/rateLimit');

async function recalcRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'visible' } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
}

// POST /api/products/:id/reviews
router.post('/products/:id/reviews', reviewLimiter, async (req, res) => {
  const { buyerName, rating, comment } = req.body;
  if (!buyerName || !rating || !comment) {
    return res.status(400).json({ message: 'الاسم والتقييم والتعليق مطلوبة' });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

  const review = await Review.create({
    product: product._id,
    buyerName: String(buyerName).trim().slice(0, 80),
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: String(comment).trim().slice(0, 1000),
  });
  await recalcRating(product._id);
  res.status(201).json(review);
});

// POST /api/reviews/:id/report
router.post('/reviews/:id/report', reviewLimiter, async (req, res) => {
  const { reason = '' } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'التعليق غير موجود' });
  review.reportCount += 1;
  review.reports.push({ reason: String(reason).slice(0, 300) });
  await review.save();
  res.json({ ok: true });
});

module.exports = router;
