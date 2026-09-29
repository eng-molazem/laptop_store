const router = require('express').Router();
const Review = require('../../models/Review');
const Product = require('../../models/Product');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageProducts'));

async function recalcRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'visible' } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
}

router.get('/', async (req, res) => {
  const { reported } = req.query;
  const filter = reported ? { reportCount: { $gt: 0 } } : {};
  const reviews = await Review.find(filter).populate('product', 'name_ar slug').sort({ reportCount: -1, createdAt: -1 });
  res.json(reviews);
});

router.patch('/:id/hide', async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'التعليق غير موجود' });
  review.status = 'hidden';
  await review.save();
  await recalcRating(review.product);
  await logAction(req.admin, 'hide_review', { targetType: 'Review', targetId: review._id });
  res.json(review);
});

router.patch('/:id/unhide', async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'التعليق غير موجود' });
  review.status = 'visible';
  await review.save();
  await recalcRating(review.product);
  await logAction(req.admin, 'unhide_review', { targetType: 'Review', targetId: review._id });
  res.json(review);
});

router.delete('/:id', async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: 'التعليق غير موجود' });
  await recalcRating(review.product);
  await logAction(req.admin, 'delete_review', { targetType: 'Review', targetId: review._id });
  res.json({ ok: true });
});

module.exports = router;
