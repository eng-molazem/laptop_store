require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Category = require('./models/Category');
const Product = require('./models/Product');
const StoreSettings = require('./models/StoreSettings');
const PaymentMethod = require('./models/PaymentMethod');
const Coupon = require('./models/Coupon');
const CategoryAttribute = require('./models/CategoryAttribute');

const DEFAULT_CATEGORIES = [
  { name_ar: 'لابتوبات', name_en: 'Laptops', slug: 'laptops', icon: 'laptop', sortOrder: 1 },
  { name_ar: 'كمبيوتر', name_en: 'Desktops', slug: 'desktops', icon: 'desktop', sortOrder: 2 },
  { name_ar: 'اكسسوارات', name_en: 'Accessories', slug: 'accessories', icon: 'mouse', sortOrder: 3 },
  { name_ar: 'كاميرات', name_en: 'Cameras', slug: 'cameras', icon: 'camera', sortOrder: 4 },
  { name_ar: 'وحدات تخزين', name_en: 'Storage', slug: 'storage', icon: 'hdd', sortOrder: 5 },
  { name_ar: 'بطاريات', name_en: 'Batteries', slug: 'batteries', icon: 'battery', sortOrder: 6 },
];

// Each category has its own attribute set — a laptop's spec sheet has nothing to do
// with a battery's, and even "brand" holds different values per category.
const CATEGORY_ATTRIBUTE_DEFS = {
  laptops: [
    { key: 'brand', label_ar: 'الماركة', label_en: 'Brand', icon: 'info', values: ['Dell', 'Lenovo', 'HP', 'Asus', 'Acer'] },
    {
      key: 'cpu',
      label_ar: 'المعالج',
      label_en: 'Processor',
      icon: 'cpu',
      values: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7'],
    },
    { key: 'ram', label_ar: 'الرام', label_en: 'RAM', icon: 'ram', values: ['8GB', '16GB', '32GB'] },
    { key: 'storage', label_ar: 'التخزين', label_en: 'Storage', icon: 'storage', values: ['256GB SSD', '512GB SSD', '1TB SSD'] },
    { key: 'screen', label_ar: 'حجم الشاشة', label_en: 'Screen Size', icon: 'screen', values: ['14"', '15.6"', '17.3"'] },
    { key: 'gpu', label_ar: 'كرت الشاشة', label_en: 'GPU', icon: 'gpu', values: ['متكامل (Integrated)', 'NVIDIA RTX 4050', 'NVIDIA RTX 4080'] },
  ],
  desktops: [
    { key: 'brand', label_ar: 'الماركة', label_en: 'Brand', icon: 'info', values: ['HP', 'Dell', 'تجميع خاص (Custom Build)'] },
    { key: 'cpu', label_ar: 'المعالج', label_en: 'Processor', icon: 'cpu', values: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9'] },
    { key: 'ram', label_ar: 'الرام', label_en: 'RAM', icon: 'ram', values: ['8GB', '16GB', '32GB'] },
    { key: 'storage', label_ar: 'التخزين', label_en: 'Storage', icon: 'storage', values: ['512GB SSD', '1TB SSD', '2TB HDD'] },
    { key: 'gpu', label_ar: 'كرت الشاشة', label_en: 'GPU', icon: 'gpu', values: ['NVIDIA RTX 4060', 'NVIDIA RTX 4080'] },
  ],
  accessories: [
    { key: 'brand', label_ar: 'الماركة', label_en: 'Brand', icon: 'info', values: ['Logitech', 'Generic', 'Razer'] },
    { key: 'type', label_ar: 'النوع', label_en: 'Type', icon: 'info', values: ['ماوس', 'لوحة مفاتيح', 'حقيبة', 'سماعة'] },
    { key: 'connection', label_ar: 'الاتصال', label_en: 'Connection', icon: 'wifi', values: ['سلكي', 'لاسلكي', 'بلوتوث'] },
  ],
  cameras: [
    { key: 'brand', label_ar: 'الماركة', label_en: 'Brand', icon: 'info', values: ['Canon', 'Sony', 'Nikon'] },
    { key: 'resolution', label_ar: 'الدقة', label_en: 'Resolution', icon: 'camera', values: ['12MP', '24MP', '48MP'] },
    { key: 'type', label_ar: 'النوع', label_en: 'Type', icon: 'info', values: ['DSLR', 'Mirrorless', 'كاميرا حركة'] },
  ],
  storage: [
    { key: 'brand', label_ar: 'الماركة', label_en: 'Brand', icon: 'info', values: ['Samsung', 'Western Digital', 'Seagate', 'Kingston'] },
    { key: 'storageType', label_ar: 'النوع', label_en: 'Type', icon: 'storage', values: ['SSD', 'HDD', 'تخزين خارجي'] },
    { key: 'capacity', label_ar: 'السعة', label_en: 'Capacity', icon: 'storage', values: ['256GB', '512GB', '1TB', '2TB'] },
  ],
  batteries: [
    { key: 'brand', label_ar: 'الماركة', label_en: 'Brand', icon: 'info', values: ['Anker', 'Generic', 'Xiaomi'] },
    { key: 'capacity', label_ar: 'السعة (mAh)', label_en: 'Capacity (mAh)', icon: 'battery', values: ['5000mAh', '10000mAh', '20000mAh'] },
    { key: 'batteryType', label_ar: 'نوع البطارية', label_en: 'Battery Type', icon: 'battery', values: ['Li-ion', 'Li-Po'] },
  ],
};

const SAMPLE_PRODUCTS = [
  {
    name_ar: 'لابتوب ديل XPS 15',
    name_en: 'Dell XPS 15',
    category_slug: 'laptops',
    price: 8500000,
    discountPrice: 7900000,
    stock: 5,
    isFeatured: true,
    isWeeklyDeal: true,
    dealEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description_ar: 'لابتوب قوي بشاشة عالية الدقة مناسب للتصميم والبرمجة.',
    description_en: 'Powerful laptop with a high-resolution display, great for design and development.',
    attributes: [
      { key: 'brand', value: 'Dell' },
      { key: 'cpu', value: 'Intel Core i7' },
      { key: 'ram', value: '16GB' },
      { key: 'storage', value: '512GB SSD' },
      { key: 'screen', value: '15.6"' },
      { key: 'gpu', value: 'NVIDIA RTX 4050' },
    ],
  },
  {
    name_ar: 'لابتوب لينوفو ThinkPad X1',
    name_en: 'Lenovo ThinkPad X1',
    category_slug: 'laptops',
    price: 6200000,
    stock: 8,
    isFeatured: true,
    description_ar: 'لابتوب مكتبي خفيف الوزن وبطارية تدوم طويلاً.',
    description_en: 'Lightweight business laptop with long battery life.',
    attributes: [
      { key: 'brand', value: 'Lenovo' },
      { key: 'cpu', value: 'Intel Core i5' },
      { key: 'ram', value: '8GB' },
      { key: 'storage', value: '256GB SSD' },
      { key: 'screen', value: '14"' },
    ],
  },
  {
    name_ar: 'لابتوب اتش بي بافيليون',
    name_en: 'HP Pavilion',
    category_slug: 'laptops',
    price: 4800000,
    stock: 2,
    lowStockThreshold: 3,
    description_ar: 'خيار اقتصادي ممتاز للاستخدام اليومي.',
    description_en: 'Great budget option for everyday use.',
    attributes: [
      { key: 'brand', value: 'HP' },
      { key: 'cpu', value: 'AMD Ryzen 5' },
      { key: 'ram', value: '8GB' },
      { key: 'storage', value: '512GB SSD' },
      { key: 'screen', value: '15.6"' },
    ],
  },
  {
    name_ar: 'لابتوب أسوس ROG Strix',
    name_en: 'Asus ROG Strix',
    category_slug: 'laptops',
    price: 11500000,
    stock: 4,
    isFeatured: true,
    reservationAllowed: true,
    reservationPercent: 30,
    description_ar: 'لابتوب ألعاب بمواصفات عالية جداً.',
    description_en: 'High-end gaming laptop.',
    attributes: [
      { key: 'brand', value: 'Asus' },
      { key: 'cpu', value: 'Intel Core i9' },
      { key: 'ram', value: '32GB' },
      { key: 'storage', value: '1TB SSD' },
      { key: 'screen', value: '17.3"' },
      { key: 'gpu', value: 'NVIDIA RTX 4080' },
    ],
  },
  {
    name_ar: 'ماوس لاسلكي احترافي',
    name_en: 'Pro Wireless Mouse',
    category_slug: 'accessories',
    price: 250000,
    stock: 30,
    description_ar: 'ماوس لاسلكي مريح ودقيق للاستخدام اليومي والألعاب.',
    description_en: 'Comfortable and precise wireless mouse for daily use and gaming.',
    attributes: [
      { key: 'brand', value: 'Logitech' },
      { key: 'type', value: 'ماوس' },
      { key: 'connection', value: 'لاسلكي' },
    ],
  },
  {
    name_ar: 'حقيبة لابتوب مبطنة 15.6 بوصة',
    name_en: 'Padded Laptop Bag 15.6"',
    category_slug: 'accessories',
    price: 180000,
    stock: 40,
    description_ar: 'حقيبة متينة تحمي لابتوبك أثناء التنقل.',
    description_en: 'Durable bag to protect your laptop on the go.',
    attributes: [
      { key: 'brand', value: 'Generic' },
      { key: 'type', value: 'حقيبة' },
    ],
  },
  {
    name_ar: 'كاميرا كانون Mirrorless',
    name_en: 'Canon Mirrorless Camera',
    category_slug: 'cameras',
    price: 3200000,
    stock: 6,
    description_ar: 'كاميرا احترافية بدقة عالية مناسبة للتصوير الفوتوغرافي والفيديو.',
    description_en: 'Professional high-resolution camera great for photo and video.',
    attributes: [
      { key: 'brand', value: 'Canon' },
      { key: 'resolution', value: '24MP' },
      { key: 'type', value: 'Mirrorless' },
    ],
  },
  {
    name_ar: 'قرص SSD خارجي 1TB',
    name_en: 'External SSD 1TB',
    category_slug: 'storage',
    price: 420000,
    stock: 15,
    description_ar: 'قرص تخزين خارجي سريع بسعة تيرابايت واحد.',
    description_en: 'Fast 1TB external storage drive.',
    attributes: [
      { key: 'brand', value: 'Samsung' },
      { key: 'storageType', value: 'تخزين خارجي' },
      { key: 'capacity', value: '1TB' },
    ],
  },
  {
    name_ar: 'باور بانك 20000 مللي أمبير',
    name_en: 'Power Bank 20000mAh',
    category_slug: 'batteries',
    price: 150000,
    stock: 25,
    description_ar: 'بطارية محمولة بسعة كبيرة لشحن الأجهزة أثناء التنقل.',
    description_en: 'High-capacity portable battery for charging on the go.',
    attributes: [
      { key: 'brand', value: 'Anker' },
      { key: 'capacity', value: '20000mAh' },
      { key: 'batteryType', value: 'Li-Po' },
    ],
  },
];

async function run() {
  await connectDB();

  // Owner admin
  const ownerEmail = (process.env.OWNER_EMAIL || 'owner@example.com').toLowerCase();
  let owner = await Admin.findOne({ email: ownerEmail });
  if (!owner) {
    const passwordHash = await bcrypt.hash(process.env.OWNER_PASSWORD || 'change-me', 10);
    owner = await Admin.create({
      name: process.env.OWNER_NAME || 'Owner',
      email: ownerEmail,
      passwordHash,
      role: 'owner',
    });
    console.log(`[seed] created owner admin: ${ownerEmail}`);
  } else {
    console.log(`[seed] owner admin already exists: ${ownerEmail}`);
  }

  // Categories
  const categoryBySlug = {};
  for (const cat of DEFAULT_CATEGORIES) {
    let doc = await Category.findOne({ slug: cat.slug });
    if (!doc) doc = await Category.create(cat);
    categoryBySlug[cat.slug] = doc;
  }
  console.log('[seed] categories ready');

  // Store settings
  const settings = await StoreSettings.getSingleton();
  if (!settings.shippingRates.length) {
    settings.shippingRates = [
      { city: 'دمشق', cost: 30000, etaDays: 1 },
      { city: 'حلب', cost: 60000, etaDays: 3 },
      { city: 'حمص', cost: 45000, etaDays: 2 },
      { city: 'اللاذقية', cost: 50000, etaDays: 2 },
    ];
  }
  if (!settings.contactPhone) settings.contactPhone = '0999888777';
  if (!settings.socialLinks.whatsapp) settings.socialLinks.whatsapp = '963999888777';
  if (!settings.aboutText_ar) {
    settings.aboutText_ar =
      'متجر اللابتوبات هو متجر إلكتروني سوري متخصص في بيع أجهزة اللابتوب بأسعار مدروسة، مع نظام دفع يدوي آمن وموثوق.';
  }
  if (!settings.branches.length) {
    settings.branches = [{ name: 'الفرع الرئيسي - دمشق', address: 'شارع بغداد، دمشق', phone: '0999888777' }];
  }
  await settings.save();
  console.log('[seed] store settings ready');

  // Sample payment methods
  const pmCount = await PaymentMethod.countDocuments();
  if (pmCount === 0) {
    await PaymentMethod.create([
      {
        name: 'تحويل عبر الأسواق المالية (Sham Cash)',
        transferLink: '',
        accountDetailsText: 'اسم المستفيد: متجر اللابتوبات — رقم الحساب: 000000000',
        sortOrder: 1,
      },
      {
        name: 'تسليم يدوي / حوالة',
        transferLink: '',
        accountDetailsText: 'يرجى التواصل معنا عبر واتساب لتفاصيل التسليم اليدوي',
        sortOrder: 2,
      },
    ]);
    console.log('[seed] sample payment methods created');
  }

  // Sample coupon
  const couponCount = await Coupon.countDocuments();
  if (couponCount === 0) {
    await Coupon.create({ code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0 });
    console.log('[seed] sample coupon WELCOME10 created');
  }

  // Category attribute definitions — each category gets its own spec sheet
  // (a laptop's cpu/ram/screen has nothing to do with a battery's capacity/type).
  const attrDefCount = await CategoryAttribute.countDocuments();
  if (attrDefCount === 0) {
    for (const [slug, defs] of Object.entries(CATEGORY_ATTRIBUTE_DEFS)) {
      const category = categoryBySlug[slug];
      if (!category) continue;
      for (const [i, def] of defs.entries()) {
        await CategoryAttribute.create({ ...def, category: category._id, sortOrder: i });
      }
    }
    console.log('[seed] category attribute definitions created');
  }

  // Sample products
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const slugify = require('slugify');
    for (const p of SAMPLE_PRODUCTS) {
      const { category_slug, ...rest } = p;
      const category = categoryBySlug[category_slug || 'laptops'];
      const slug = slugify(p.name_en, { lower: true, strict: true });
      await Product.create({ ...rest, category: category._id, slug, currency: 'SYP' });
    }
    console.log(`[seed] created ${SAMPLE_PRODUCTS.length} sample products`);
  }

  console.log('[seed] done');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
