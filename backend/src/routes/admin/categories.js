const router = require('express').Router();
const slugify = require('slugify');
const Category = require('../../models/Category');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageProducts'));

router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 });
  res.json(categories);
});

router.post('/', async (req, res) => {
  const { name_ar, name_en, icon = 'laptop', sortOrder = 0 } = req.body;
  if (!name_ar || !name_en) return res.status(400).json({ message: 'الاسم بالعربي والإنكليزي مطلوب' });
  const slug = slugify(name_en, { lower: true, strict: true });
  const category = await Category.create({ name_ar, name_en, slug, icon, sortOrder });
  await logAction(req.admin, 'create_category', { targetType: 'Category', targetId: category._id, details: name_ar });
  res.status(201).json(category);
});

router.put('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'الصنف غير موجود' });
  Object.assign(category, req.body);
  await category.save();
  await logAction(req.admin, 'update_category', { targetType: 'Category', targetId: category._id, details: category.name_ar });
  res.json(category);
});

router.delete('/:id', async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'الصنف غير موجود' });
  await logAction(req.admin, 'delete_category', { targetType: 'Category', targetId: category._id, details: category.name_ar });
  res.json({ ok: true });
});

module.exports = router;
