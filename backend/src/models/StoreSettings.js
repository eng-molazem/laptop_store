const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: true }
);

const shippingRateSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    etaDays: { type: Number, default: 2 },
  },
  { _id: true }
);

const storeSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    storeName: { type: String, default: 'متجر اللابتوبات' },
    storeNameEn: { type: String, default: 'Laptop Store' },
    logoUrl: { type: String, default: '' },
    currency: { type: String, default: 'SYP' },
    aboutText_ar: { type: String, default: '' },
    aboutText_en: { type: String, default: '' },
    branches: { type: [branchSchema], default: [] },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    reviewSlaHours: { type: Number, default: 24 },
    reservationPercentDefault: { type: Number, default: 20 },
    shippingRates: { type: [shippingRateSchema], default: [] },
  },
  { timestamps: true }
);

storeSettingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ singleton: 'main' });
  if (!doc) {
    doc = await this.create({ singleton: 'main' });
  }
  return doc;
};

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
