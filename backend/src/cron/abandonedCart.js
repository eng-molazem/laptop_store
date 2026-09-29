const cron = require('node-cron');
const Cart = require('../models/Cart');
const { sendMail } = require('../utils/mailer');

function startAbandonedCartJob() {
  // every hour
  cron.schedule('0 * * * *', async () => {
    const threshold = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const carts = await Cart.find({
      lastUpdatedAt: { $lt: threshold },
      reminderSent: false,
      convertedToOrder: false,
      contactEmail: { $ne: '' },
      'items.0': { $exists: true },
    }).populate('items.product', 'name_ar');

    for (const cart of carts) {
      const productNames = cart.items.map((i) => i.product?.name_ar).filter(Boolean).join('، ');
      await sendMail({
        to: cart.contactEmail,
        subject: 'نسيت شيئاً في سلتك؟',
        html: `<p>مرحباً،</p><p>لاحظنا أنك أضفت (${productNames}) إلى سلتك ولم تكمل الطلب. عد الآن لإتمام عملية الشراء!</p>`,
      });
      cart.reminderSent = true;
      await cart.save();
    }

    if (carts.length) console.log(`[cron] sent ${carts.length} abandoned-cart reminder(s)`);
  });
}

module.exports = { startAbandonedCartJob };
