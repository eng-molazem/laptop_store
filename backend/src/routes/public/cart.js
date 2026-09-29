const router = require('express').Router();
const Cart = require('../../models/Cart');

const PRODUCT_POPULATE = {
  path: 'items.product',
  select: 'name_ar name_en slug price discountPrice images stock category',
  populate: { path: 'category', select: 'slug' },
};

// GET /api/cart/:guestId
router.get('/:guestId', async (req, res) => {
  const cart = await Cart.findOne({ guestId: req.params.guestId }).populate(PRODUCT_POPULATE);
  res.json(cart || { guestId: req.params.guestId, items: [] });
});

// PUT /api/cart/:guestId  { items: [{product, qty}], contactEmail? }
router.put('/:guestId', async (req, res) => {
  const { items = [], contactEmail } = req.body;
  const update = {
    items: items.map((i) => ({ product: i.product, qty: Math.max(1, Number(i.qty) || 1) })),
    lastUpdatedAt: new Date(),
    reminderSent: false,
  };
  if (contactEmail !== undefined) update.contactEmail = contactEmail;

  const cart = await Cart.findOneAndUpdate(
    { guestId: req.params.guestId },
    { $set: update, $setOnInsert: { guestId: req.params.guestId } },
    { upsert: true, new: true }
  ).populate(PRODUCT_POPULATE);

  res.json(cart);
});

module.exports = router;
