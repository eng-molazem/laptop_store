require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets');
const { startAbandonedCartJob } = require('./src/cron/abandonedCart');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes
app.use('/api/settings', require('./src/routes/public/settings'));
app.use('/api/categories', require('./src/routes/public/categories'));
app.use('/api/products', require('./src/routes/public/products'));
app.use('/api', require('./src/routes/public/reviews')); // /api/products/:id/reviews, /api/reviews/:id/report
app.use('/api/payment-methods', require('./src/routes/public/paymentMethods'));
app.use('/api/coupons', require('./src/routes/public/coupons'));
app.use('/api/cart', require('./src/routes/public/cart'));
app.use('/api/orders', require('./src/routes/public/orders'));
app.use('/api/newsletter', require('./src/routes/public/newsletter'));

// Admin routes
app.use('/api/admin', require('./src/routes/admin/auth'));
app.use('/api/admin/stats', require('./src/routes/admin/stats'));
app.use('/api/admin/products', require('./src/routes/admin/products'));
app.use('/api/admin/categories', require('./src/routes/admin/categories'));
app.use('/api/admin/category-attributes', require('./src/routes/admin/categoryAttributes'));
app.use('/api/admin/orders', require('./src/routes/admin/orders'));
app.use('/api/admin/payment-requests', require('./src/routes/admin/paymentRequests'));
app.use('/api/admin/payment-methods', require('./src/routes/admin/paymentMethods'));
app.use('/api/admin/coupons', require('./src/routes/admin/coupons'));
app.use('/api/admin/reviews', require('./src/routes/admin/reviews'));
app.use('/api/admin/settings', require('./src/routes/admin/settings'));
app.use('/api/admin/admins', require('./src/routes/admin/admins'));
app.use('/api/admin/audit-log', require('./src/routes/admin/auditLog'));
app.use('/api/admin/export', require('./src/routes/admin/export'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'حدث خطأ في الخادم' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

connectDB()
  .then(() => {
    startAbandonedCartJob();
    server.listen(PORT, () => console.log(`[server] running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[server] failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
