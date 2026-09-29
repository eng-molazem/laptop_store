const router = require('express').Router();
const Newsletter = require('../../models/Newsletter');

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
  try {
    await Newsletter.updateOne(
      { email: String(email).toLowerCase().trim() },
      { $setOnInsert: { subscribedAt: new Date() } },
      { upsert: true }
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ، حاول لاحقاً' });
  }
});

module.exports = router;
