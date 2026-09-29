const router = require('express').Router();
const PaymentMethod = require('../../models/PaymentMethod');

router.get('/', async (req, res) => {
  const methods = await PaymentMethod.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json(methods);
});

module.exports = router;
