const mongoose = require('mongoose');

// Defines one filterable/displayable attribute (e.g. "cpu", "capacity", "brand")
// scoped to a single category, with an admin-curated list of allowed values.
const categoryAttributeSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    key: { type: String, required: true, trim: true }, // e.g. 'brand', 'cpu', 'capacity'
    label_ar: { type: String, required: true },
    label_en: { type: String, required: true },
    icon: { type: String, default: 'info' },
    values: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categoryAttributeSchema.index({ category: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('CategoryAttribute', categoryAttributeSchema);
