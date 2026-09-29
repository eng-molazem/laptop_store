const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValidNow = function isValidNow(subtotal) {
  if (!this.isActive) return { ok: false, reason: 'coupon_inactive' };
  if (this.expiresAt && this.expiresAt < new Date()) return { ok: false, reason: 'coupon_expired' };
  if (this.maxUses != null && this.usedCount >= this.maxUses) return { ok: false, reason: 'coupon_exhausted' };
  if (subtotal < this.minOrder) return { ok: false, reason: 'coupon_min_order' };
  return { ok: true };
};

couponSchema.methods.computeDiscount = function computeDiscount(subtotal) {
  if (this.type === 'percent') return Math.min(subtotal, (subtotal * this.value) / 100);
  return Math.min(subtotal, this.value);
};

module.exports = mongoose.model('Coupon', couponSchema);
