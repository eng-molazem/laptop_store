const router = require('express').Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const PaymentRequest = require('../../models/PaymentRequest');

router.get('/', async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [ordersToday, totalSalesAgg, pendingPaymentRequests, lowStockProducts, topProductsAgg, ordersTotalCount] =
    await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      PaymentRequest.countDocuments({ status: 'pending' }),
      Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true })
        .select('name_ar name_en stock lowStockThreshold slug')
        .limit(20),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, qty: { $sum: '$items.qty' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
      Order.countDocuments({}),
    ]);

  res.json({
    ordersToday,
    ordersTotalCount,
    totalSales: totalSalesAgg[0]?.total || 0,
    pendingPaymentRequests,
    lowStockProducts,
    topProducts: topProductsAgg,
  });
});

module.exports = router;
