const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name_ar: { type: String, required: true },
    name_en: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: 'laptop' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
