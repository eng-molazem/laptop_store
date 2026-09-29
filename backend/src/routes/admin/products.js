const router = require('express').Router();
const slugify = require('slugify');
const Product = require('../../models/Product');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { uploadProductImages } = require('../../middleware/upload');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageProducts'));

function parseBody(body) {
  const attributes = body.attributes
    ? (typeof body.attributes === 'string' ? JSON.parse(body.attributes) : body.attributes).filter(
        (a) => a.key && a.value
      )
    : [];
  const relatedProducts = body.relatedProducts
    ? typeof body.relatedProducts === 'string'
      ? JSON.parse(body.relatedProducts)
      : body.relatedProducts
    : [];
  const frequentlyBoughtWith = body.frequentlyBoughtWith
    ? typeof body.frequentlyBoughtWith === 'string'
      ? JSON.parse(body.frequentlyBoughtWith)
      : body.frequentlyBoughtWith
    : [];

  return {
    name_ar: body.name_ar,
    name_en: body.name_en,
    category: body.category,
    price: Number(body.price),
    discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
    stock: Number(body.stock) || 0,
    lowStockThreshold: Number(body.lowStockThreshold) || 3,
    attributes,
    description_ar: body.description_ar || '',
    description_en: body.description_en || '',
    isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
    isWeeklyDeal: body.isWeeklyDeal === 'true' || body.isWeeklyDeal === true,
    dealEndsAt: body.dealEndsAt || null,
    reservationAllowed: body.reservationAllowed !== 'false' && body.reservationAllowed !== false,
    reservationPercent: body.reservationPercent ? Number(body.reservationPercent) : null,
    relatedProducts,
    frequentlyBoughtWith,
    isActive: body.isActive !== 'false' && body.isActive !== false,
  };
}

router.get('/', async (req, res) => {
  const products = await Product.find().populate('category', 'name_ar name_en slug').sort({ createdAt: -1 });
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name_ar name_en slug');
  if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
  res.json(product);
});

router.post('/', uploadProductImages.array('images', 8), async (req, res) => {
  try {
    const data = parseBody(req.body);
    const uploadedImages = (req.files || []).map((f) => `/uploads/products/${f.filename}`);
    let baseSlug = slugify(data.name_en || data.name_ar, { lower: true, strict: true });
    let slug = baseSlug;
    let i = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${i++}`;
    }
    const product = await Product.create({ ...data, slug, images: uploadedImages });
    await logAction(req.admin, 'create_product', { targetType: 'Product', targetId: product._id, details: product.name_ar });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'حدث خطأ أثناء إضافة المنتج' });
  }
});

router.put('/:id', uploadProductImages.array('images', 8), async (req, res) => {
  try {
    const data = parseBody(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

    const newImages = (req.files || []).map((f) => `/uploads/products/${f.filename}`);
    const keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : product.images;

    Object.assign(product, data);
    product.images = [...keepImages, ...newImages];
    await product.save();
    await logAction(req.admin, 'update_product', { targetType: 'Product', targetId: product._id, details: product.name_ar });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'حدث خطأ أثناء تعديل المنتج' });
  }
});

router.delete('/:id', async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
  await logAction(req.admin, 'delete_product', { targetType: 'Product', targetId: product._id, details: product.name_ar });
  res.json({ ok: true });
});

module.exports = router;
