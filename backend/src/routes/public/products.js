const router = require('express').Router();
const Product = require('../../models/Product');
const Review = require('../../models/Review');
const Category = require('../../models/Category');
const CategoryAttribute = require('../../models/CategoryAttribute');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/products
// Attribute filters arrive as attr[key]=value1,value2 (e.g. attr[cpu]=Intel+Core+i7)
// so each category's own attribute set (brand, cpu, capacity, ...) works generically.
router.get('/', async (req, res) => {
  const { category, attr, priceMin, priceMax, search, sort, page = 1, limit = 12, featured, weeklyDeal } = req.query;

  const filter = { isActive: true };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else filter.category = null; // no matching category -> empty result
  }

  if (attr && typeof attr === 'object') {
    const attrConditions = Object.entries(attr)
      .filter(([, values]) => values)
      .map(([key, values]) => ({
        attributes: { $elemMatch: { key, value: { $in: String(values).split(',') } } },
      }));
    if (attrConditions.length) filter.$and = attrConditions;
  }

  if (priceMin || priceMax) {
    filter.price = {};
    if (priceMin) filter.price.$gte = Number(priceMin);
    if (priceMax) filter.price.$lte = Number(priceMax);
  }
  if (search) {
    const re = new RegExp(escapeRegex(String(search).trim()), 'i');
    filter.$or = [{ name_ar: re }, { name_en: re }, { attributes: { $elemMatch: { value: re } } }];
  }
  if (featured) filter.isFeatured = true;
  if (weeklyDeal) filter.isWeeklyDeal = true;

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratingAvg: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name_ar name_en slug')
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// GET /api/products/filters/options?category=slug
// Returns the admin-curated attribute definitions (with their value lists) for the
// category, so the filter sidebar always matches what that category is actually about.
router.get('/filters/options', async (req, res) => {
  if (!req.query.category) return res.json([]);
  const cat = await Category.findOne({ slug: req.query.category });
  if (!cat) return res.json([]);
  const attrs = await CategoryAttribute.find({ category: cat._id }).sort({ sortOrder: 1, createdAt: 1 });
  res.json(attrs);
});

// GET /api/products/compare?ids=a,b,c
router.get('/compare', async (req, res) => {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length) return res.json([]);
  const products = await Product.find({ _id: { $in: ids }, isActive: true }).populate('category', 'name_ar name_en slug');
  res.json(products);
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name_ar name_en slug')
    .populate('relatedProducts', 'name_ar name_en slug price discountPrice images ratingAvg ratingCount stock')
    .populate('frequentlyBoughtWith', 'name_ar name_en slug price discountPrice images ratingAvg ratingCount stock');

  if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

  const [reviews, attributeDefs] = await Promise.all([
    Review.find({ product: product._id, status: 'visible' }).sort({ createdAt: -1 }),
    CategoryAttribute.find({ category: product.category._id }).sort({ sortOrder: 1, createdAt: 1 }),
  ]);

  res.json({ product, reviews, attributeDefs });
});

module.exports = router;
