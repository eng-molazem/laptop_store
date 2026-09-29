const router = require('express').Router();
const AuditLog = require('../../models/AuditLog');
const { requireAdmin, requireOwner } = require('../../middleware/auth');

router.use(requireAdmin, requireOwner);

router.get('/', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(200, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    AuditLog.countDocuments(),
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

module.exports = router;
