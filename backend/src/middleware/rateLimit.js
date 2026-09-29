const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'محاولات كثيرة جداً، حاول مرة أخرى بعد قليل' },
});

const reviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'محاولات كثيرة جداً، حاول لاحقاً' },
});

module.exports = { loginLimiter, reviewLimiter };
