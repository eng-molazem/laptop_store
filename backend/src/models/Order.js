const mongoose = require('mongoose');

const STATUS_FLOW = [
  'awaiting_payment',
  'payment_review',
  'paid',
  'processing',
  'shipped',
  'delivered',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], required: true },
    buyerName: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerEmail: { type: String, default: '' },
    city: { type: String, required: true },
    address: { type: String, required: true },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true },
    type: { type: String, enum: ['purchase', 'reservation'], default: 'purchase' },
    reservationPercent: { type: Number, default: null },
    amountDue: { type: Number, required: true }, // amount the buyer must transfer now (full total, or reservation portion)
    status: {
      type: String,
      enum: [...STATUS_FLOW, 'rejected', 'cancelled'],
      default: 'awaiting_payment',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    guestId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

orderSchema.methods.pushStatus = function pushStatus(status, note = '') {
  this.status = status;
  this.statusHistory.push({ status, at: new Date(), note });
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUS_FLOW = STATUS_FLOW;
