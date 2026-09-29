const router = require('express').Router();
const PaymentMethod = require('../../models/PaymentMethod');
const { requireAdmin, requirePermission } = require('../../middleware/auth');
const { uploadPaymentMethodImage } = require('../../middleware/upload');
const { logAction } = require('../../utils/audit');

router.use(requireAdmin, requirePermission('manageSettings'));

router.get('/', async (req, res) => {
  const methods = await PaymentMethod.find().sort({ sortOrder: 1 });
  res.json(methods);
});

router.post('/', uploadPaymentMethodImage.single('qrImage'), async (req, res) => {
  const { name, transferLink = '', accountDetailsText = '', sortOrder = 0 } = req.body;
  if (!name) return res.status(400).json({ message: 'اسم طريقة الدفع مطلوب' });
  const qrImageUrl = req.file ? `/uploads/payment-methods/${req.file.filename}` : '';
  const method = await PaymentMethod.create({ name, transferLink, accountDetailsText, sortOrder, qrImageUrl });
  await logAction(req.admin, 'create_payment_method', { targetType: 'PaymentMethod', targetId: method._id, details: name });
  res.status(201).json(method);
});

router.put('/:id', uploadPaymentMethodImage.single('qrImage'), async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) return res.status(404).json({ message: 'طريقة الدفع غير موجودة' });

  const { name, transferLink, accountDetailsText, sortOrder, isActive } = req.body;
  if (name !== undefined) method.name = name;
  if (transferLink !== undefined) method.transferLink = transferLink;
  if (accountDetailsText !== undefined) method.accountDetailsText = accountDetailsText;
  if (sortOrder !== undefined) method.sortOrder = Number(sortOrder);
  if (isActive !== undefined) method.isActive = isActive === 'true' || isActive === true;
  if (req.file) method.qrImageUrl = `/uploads/payment-methods/${req.file.filename}`;

  await method.save();
  await logAction(req.admin, 'update_payment_method', { targetType: 'PaymentMethod', targetId: method._id, details: method.name });
  res.json(method);
});

router.delete('/:id', async (req, res) => {
  const method = await PaymentMethod.findByIdAndDelete(req.params.id);
  if (!method) return res.status(404).json({ message: 'طريقة الدفع غير موجودة' });
  await logAction(req.admin, 'delete_payment_method', { targetType: 'PaymentMethod', targetId: method._id, details: method.name });
  res.json({ ok: true });
});

module.exports = router;
