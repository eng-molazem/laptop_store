const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    guestId: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    contactEmail: { type: String, default: '' },
    lastUpdatedAt: { type: Date, default: Date.now },
    reminderSent: { type: Boolean, default: false },
    convertedToOrder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
