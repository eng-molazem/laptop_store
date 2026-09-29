const AuditLog = require('../models/AuditLog');

async function logAction(admin, action, { targetType = '', targetId = '', details = '' } = {}) {
  try {
    await AuditLog.create({
      admin: admin._id,
      adminName: admin.name,
      action,
      targetType,
      targetId: String(targetId || ''),
      details,
    });
  } catch (err) {
    console.error('[audit] failed to write log:', err.message);
  }
}

module.exports = { logAction };
