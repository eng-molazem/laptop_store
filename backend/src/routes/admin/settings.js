const router = require('express').Router();
const StoreSettings = require('../../models/StoreSettings');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageSettings'));

router.get('/', async (req, res) => {
  const settings = await StoreSettings.getSingleton();
  res.json(settings);
});

router.put('/', async (req, res) => {
  const settings = await StoreSettings.getSingleton();
  const allowedFields = [
    'storeName',
    'storeNameEn',
    'logoUrl',
    'aboutText_ar',
    'aboutText_en',
    'branches',
    'socialLinks',
    'contactPhone',
    'contactEmail',
    'reviewSlaHours',
    'reservationPercentDefault',
    'shippingRates',
  ];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  }
  await settings.save();
  await logAction(req.admin, 'update_settings', { targetType: 'StoreSettings', targetId: settings._id });
  res.json(settings);
});

module.exports = router;
