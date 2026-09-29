const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');
const { requireAdmin, requireOwner } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requireOwner);

router.get('/', async (req, res) => {
  const admins = await Admin.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(admins);
});

router.post('/', async (req, res) => {
  const { name, email, password, permissions = {} } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'الاسم والبريد وكلمة المرور مطلوبة' });

  const exists = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) return res.status(400).json({ message: 'هذا البريد مستخدم مسبقاً' });

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({
    name,
    email: String(email).toLowerCase().trim(),
    passwordHash,
    role: 'staff',
    permissions,
  });
  await logAction(req.admin, 'create_admin', { targetType: 'Admin', targetId: admin._id, details: admin.email });
  res.status(201).json(admin.toSafeJSON());
});

router.put('/:id', async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: 'الحساب غير موجود' });
  if (admin.role === 'owner') return res.status(400).json({ message: 'لا يمكن تعديل حساب المالك من هنا' });

  const { name, permissions, isActive, password } = req.body;
  if (name !== undefined) admin.name = name;
  if (permissions !== undefined) admin.permissions = permissions;
  if (isActive !== undefined) admin.isActive = isActive;
  if (password) admin.passwordHash = await bcrypt.hash(password, 10);

  await admin.save();
  await logAction(req.admin, 'update_admin', { targetType: 'Admin', targetId: admin._id, details: admin.email });
  res.json(admin.toSafeJSON());
});

router.delete('/:id', async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: 'الحساب غير موجود' });
  if (admin.role === 'owner') return res.status(400).json({ message: 'لا يمكن حذف حساب المالك' });

  await Admin.findByIdAndDelete(req.params.id);
  await logAction(req.admin, 'delete_admin', { targetType: 'Admin', targetId: admin._id, details: admin.email });
  res.json({ ok: true });
});

module.exports = router;
