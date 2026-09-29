const mongoose = require('mongoose');

// A product's attribute values (e.g. { key: 'cpu', value: 'Intel Core i7' }).
// The set of allowed keys/values per category is defined in CategoryAttribute,
// so a laptop's attributes (brand, cpu, ram...) look nothing like a battery's
// (brand, capacity, batteryType...).
const attributeValueSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name_ar: { type: String, required: true },
    name_en: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null },
    currency: { type: String, default: 'SYP' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 3 },
    images: { type: [String], default: [] },
    attributes: { type: [attributeValueSchema], default: [] },
    description_ar: { type: String, default: '' },
    description_en: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isWeeklyDeal: { type: Boolean, default: false },
    dealEndsAt: { type: Date, default: null },
    reservationAllowed: { type: Boolean, default: true },
    reservationPercent: { type: Number, default: null },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    frequentlyBoughtWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name_ar: 'text', name_en: 'text' });
productSchema.index({ category: 1, 'attributes.key': 1, 'attributes.value': 1 });

productSchema.virtual('effectivePrice').get(function effectivePrice() {
  return this.discountPrice != null && this.discountPrice < this.price ? this.discountPrice : this.price;
});

// convenience accessor — brand is just another category attribute under the hood
productSchema.virtual('brand').get(function brand() {
  return this.attributes?.find((a) => a.key === 'brand')?.value || '';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
