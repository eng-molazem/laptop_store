const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');
const { loginLimiter } = require('../../middleware/rateLimit');
const { requireAdmin } = require('../../middleware/auth');

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin || !admin.isActive) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, admin: admin.toSafeJSON() });
});

router.get('/me', requireAdmin, async (req, res) => {
  res.json({ admin: req.admin.toSafeJSON() });
});

module.exports = router;
