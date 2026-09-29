const router = require('express').Router();
const Category = require('../../models/Category');
const CategoryAttribute = require('../../models/CategoryAttribute');

router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1, name_ar: 1 });
  res.json(categories);
});

// GET /api/categories/:slug/attributes — the attribute definitions (with admin-curated
// value lists) for one category, used to render product specs, filters and compare rows.
router.get('/:slug/attributes', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.json([]);
  const attrs = await CategoryAttribute.find({ category: category._id }).sort({ sortOrder: 1, createdAt: 1 });
  res.json(attrs);
});

module.exports = router;
