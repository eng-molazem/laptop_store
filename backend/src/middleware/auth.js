const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'غير مصرح' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.id);
    if (!admin || !admin.isActive) return res.status(401).json({ message: 'غير مصرح' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'جلسة غير صالحة' });
  }
}

function requirePermission(key) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ message: 'غير مصرح' });
    if (!req.admin.hasPermission(key)) {
      return res.status(403).json({ message: 'لا تملك صلاحية كافية لهذا الإجراء' });
    }
    next();
  };
}

function requireOwner(req, res, next) {
  if (!req.admin || req.admin.role !== 'owner') {
    return res.status(403).json({ message: 'هذا الإجراء متاح للمالك فقط' });
  }
  next();
}

module.exports = { requireAdmin, requirePermission, requireOwner };
