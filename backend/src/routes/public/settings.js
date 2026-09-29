const router = require('express').Router();
const StoreSettings = require('../../models/StoreSettings');

router.get('/', async (req, res) => {
  const settings = await StoreSettings.getSingleton();
  res.json(settings);
});

module.exports = router;
