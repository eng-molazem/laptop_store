# Backend — متجر اللابتوبات

Node.js + Express + MongoDB (Mongoose) + Socket.io.

## التقنيات

- **Express** — REST API
- **MongoDB / Mongoose** — قاعدة البيانات
- **Socket.io** — إشعارات فورية (موافقة/رفض طلب الدفع، تحديث حالة الطلب) بدون تحديث الصفحة
- **JWT + bcryptjs** — مصادقة الأدمن (لا تسجيل دخول للمستخدمين إطلاقاً)
- **Multer** — رفع صور المنتجات، رموز QR لطرق الدفع، إثباتات التحويل (تُخزَّن محلياً في `uploads/`)
- **node-cron** — تذكير السلة المتروكة تلقائياً
- **Nodemailer** — بريد إلكتروني اختياري عند موافقة/رفض الدفع (يتطلب إعداد SMTP)
- **express-rate-limit** — حماية تسجيل دخول الأدمن من محاولات القوة الغاشمة

## التشغيل

```bash
npm install
cp .env.example .env
npm run seed     # يزرع بيانات أولية (راجع القسم أدناه)
npm run dev       # nodemon — يعيد التشغيل تلقائياً عند أي تعديل
# أو
npm start          # تشغيل عادي بدون إعادة تشغيل تلقائي
```

## متغيرات البيئة (`.env`)

| المتغير | الوصف |
|---|---|
| `PORT` | منفذ الخادم (افتراضي 5050) |
| `MONGO_URI` | رابط الاتصال بـ MongoDB |
| `JWT_SECRET` | مفتاح توقيع الجلسات — **غيّره قبل أي استخدام حقيقي** |
| `CLIENT_URL` | رابط الفرونت اند (لإعدادات CORS و Socket.io) |
| `OWNER_NAME` / `OWNER_EMAIL` / `OWNER_PASSWORD` | حساب المالك الذي يُنشأ عند أول `npm run seed` |
| `SMTP_*` | إعدادات بريد اختيارية — بدونها يعمل الموقع طبيعياً بالإشعار الفوري فقط |

## ماذا يفعل `npm run seed`

- ينشئ حساب المالك (owner) إن لم يكن موجوداً
- يزرع الفئات الست الافتراضية (لابتوبات، كمبيوتر، اكسسوارات، كاميرات، وحدات تخزين، بطاريات)
- يزرع **خصائص كل فئة** الافتراضية (مثال: لابتوبات → معالج/رام/تخزين/شاشة، بطاريات → سعة/نوع) — راجع `src/seed.js` لتعديلها
- يزرع إعدادات متجر أولية (شحن، فروع، تواصل)، طريقتي دفع تجريبيتين، كوبون تجريبي، ومنتجات تجريبية لكل فئة
- كل خطوة **idempotent** — تشغيله مرة أخرى لا يكرر البيانات الموجودة

## البنية

```
src/
  config/db.js              الاتصال بقاعدة البيانات
  models/                   مخططات Mongoose (Product, Order, PaymentRequest, CategoryAttribute...)
  middleware/               auth (JWT + صلاحيات), upload (Multer), rateLimit
  routes/
    public/                 نقاط مفتوحة (منتجات، سلة، طلبات، دفع، تقييمات...)
    admin/                  نقاط محمية بـ JWT وصلاحيات (منتجات، طلبات دفع، إعدادات، موظفون...)
  sockets/                  إعداد Socket.io وبثّ الأحداث
  cron/                     مهمة السلة المتروكة الدورية
  utils/                    بريد إلكتروني، سجل تدقيق، تصدير CSV
  seed.js                   سكربت زرع البيانات الأولية
```

## نظام خصائص المنتجات (Category Attributes)

بدل حقول ثابتة (معالج/رام/ماركة...) لكل منتج، كل **فئة** تملك مجموعة خصائصها الخاصة عبر نموذج `CategoryAttribute` (مفتاح، تسمية عربي/إنكليزي، أيقونة، وقائمة قيم يديرها الأدمن). المنتج يخزّن قيمه ضمن مصفوفة `attributes: [{ key, value }]` بدل حقول منفصلة. هذا يعني:
- كل فئة تُدار من `/admin/category-attributes` دون لمس الكود
- الفلاتر في المتجر تُبنى ديناميكياً حسب خصائص الفئة المختارة فقط
- المقارنة بين منتجين تعرض فقط خصائص فئتهما المشتركة

## نقاط API الرئيسية

راجع ملفات `src/routes/` مباشرة للتفاصيل الكاملة؛ أبرز المجموعات:

- `GET /api/products`, `/api/products/:slug`, `/api/products/filters/options?category=`
- `GET /api/categories`, `/api/categories/:slug/attributes`
- `POST /api/orders`, `POST /api/orders/:id/payment-requests`, `GET /api/orders/:id/track`
- `POST /api/admin/login` (rate-limited), ثم كل `/api/admin/*` محمية بـ JWT
- `PATCH /api/admin/payment-requests/:id/approve|reject` — يبثّ حدث Socket.io فوري للعميل
