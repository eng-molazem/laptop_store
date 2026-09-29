const mongoose = require('mongoose');

const PERMISSION_KEYS = [
  'manageProducts',
  'manageOrders',
  'managePaymentRequests',
  'manageCoupons',
  'manageSettings',
  'manageAdmins',
];

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
    permissions: {
      manageProducts: { type: Boolean, default: false },
      manageOrders: { type: Boolean, default: false },
      managePaymentRequests: { type: Boolean, default: false },
      manageCoupons: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
      manageAdmins: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.methods.hasPermission = function hasPermission(key) {
  if (this.role === 'owner') return true;
  return Boolean(this.permissions && this.permissions[key]);
};

adminSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
module.exports.PERMISSION_KEYS = PERMISSION_KEYS;
