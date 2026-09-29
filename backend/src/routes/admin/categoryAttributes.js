const router = require('express').Router();
const CategoryAttribute = require('../../models/CategoryAttribute');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageProducts'));

// GET /api/admin/category-attributes?category=<categoryId>
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const attrs = await CategoryAttribute.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  res.json(attrs);
});

// POST /api/admin/category-attributes  { category, key, label_ar, label_en, icon }
router.post('/', async (req, res) => {
  const { category, key, label_ar, label_en, icon = 'info' } = req.body;
  if (!category || !key || !label_ar || !label_en) {
    return res.status(400).json({ message: 'الفئة والمفتاح والتسميتان مطلوبة' });
  }
  try {
    const attr = await CategoryAttribute.create({
      category,
      key: String(key).trim().toLowerCase().replace(/\s+/g, '_'),
      label_ar,
      label_en,
      icon,
      values: [],
    });
    await logAction(req.admin, 'create_category_attribute', { targetType: 'CategoryAttribute', targetId: attr._id, details: `${label_ar}` });
    res.status(201).json(attr);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'هذه الخاصية موجودة مسبقاً لهذه الفئة' });
    res.status(400).json({ message: 'حدث خطأ أثناء إضافة الخاصية' });
  }
});

// PUT /api/admin/category-attributes/:id  { label_ar?, label_en?, icon?, values? }
router.put('/:id', async (req, res) => {
  const attr = await CategoryAttribute.findById(req.params.id);
  if (!attr) return res.status(404).json({ message: 'الخاصية غير موجودة' });

  const { label_ar, label_en, icon, values, sortOrder } = req.body;
  if (label_ar !== undefined) attr.label_ar = label_ar;
  if (label_en !== undefined) attr.label_en = label_en;
  if (icon !== undefined) attr.icon = icon;
  if (sortOrder !== undefined) attr.sortOrder = sortOrder;
  if (values !== undefined) {
    attr.values = [...new Set(values.map((v) => String(v).trim()).filter(Boolean))];
  }
  await attr.save();
  await logAction(req.admin, 'update_category_attribute', { targetType: 'CategoryAttribute', targetId: attr._id });
  res.json(attr);
});

router.delete('/:id', async (req, res) => {
  const attr = await CategoryAttribute.findByIdAndDelete(req.params.id);
  if (!attr) return res.status(404).json({ message: 'الخاصية غير موجودة' });
  await logAction(req.admin, 'delete_category_attribute', { targetType: 'CategoryAttribute', targetId: attr._id, details: attr.label_ar });
  res.json({ ok: true });
});

module.exports = router;
