# Laptop Store — E-Commerce Platform (React + Node.js + MongoDB)

**🇬🇧 [English](#-english) | 🇸🇦 [العربية](#-العربية)**

---

## 🇬🇧 English

### Overview

A complete e-commerce platform for selling laptops and accessories priced in Syrian Pounds (SYP), with a **fully manual payment system** (no electronic payment gateway), **no login required for customers** (browse, buy, and reserve as a guest), and a full-featured, multi-user admin dashboard.

### Tech Stack

```
laptop-store/
  backend/   Node.js + Express + MongoDB (Mongoose) + Socket.io + JWT + Multer
  frontend/  React + Vite + React Router + react-i18next + Framer Motion
```

Further details for each part live in its own README: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)

### Key Features

**For customers:**
- Browsing, instant autocomplete search, and advanced filtering — each product category (laptops, desktops, accessories, cameras, storage devices, batteries) has **its own specifications** (processor/RAM for laptops, capacity/type for batteries...), not generic shared filters.
- Side-by-side product comparison (restricted to products from the **same category**).
- Ratings and reviews, with the ability to report a comment.
- Reserve a product by paying a down payment percentage (set by the admin) instead of the full price.
- Cart, discount coupons, and shipping cost calculated by city.
- Manual payment: choose a transfer method, upload proof, then track the order status through a live timeline via Socket.io with no page refresh.
- Full Arabic/English support (RTL/LTR) and light/dark mode, switchable instantly.

**For admins:**
- A dashboard with statistics (sales, orders, low stock, best sellers).
- Full management of: products, categories, **each category's attributes and their values**, orders, payment requests (approve/reject), payment methods, coupons, reviews, and general store settings.
- Multi-level permissions: an Owner role plus fine-grained permissions per staff member.
- An audit log for every sensitive action.
- CSV export for orders and payment requests.
- Rate limiting on admin login.

### Getting Started

#### Prerequisites
- Node.js 18+
- MongoDB running locally (or an Atlas connection string)

#### 1) Backend

```bash
cd backend
npm install
cp .env.example .env   # edit values as needed (especially OWNER_EMAIL/OWNER_PASSWORD and JWT_SECRET)
npm run seed            # seeds: owner account + categories + their default attributes + demo products + 2 payment methods + a demo coupon
npm run dev              # runs on http://localhost:5050 (or the port set in PORT)
```

#### 2) Frontend

```bash
cd frontend
npm install
npm run dev               # runs on http://localhost:5173 (Vite auto-selects another port if busy)
```

If the frontend runs on a port other than 5173/5174, update `CLIENT_URL` in `backend/.env` to match (for CORS), then restart the backend.

#### Admin Login

After running `npm run seed`, use the values you set for `OWNER_EMAIL` / `OWNER_PASSWORD` in `backend/.env` to sign in at `/admin/login` (a 🔒 link appears at the top of the site). **Change the default password before any real use.**

#### Email (optional)

To enable email notifications when payment requests are approved/rejected and for abandoned carts, fill in the `SMTP_*` settings in `backend/.env`. Without them, the site works normally and relies only on in-app real-time notifications (Socket.io).

### Important Notes

- All images (products, payment method QR codes, transfer proofs) are stored locally in `backend/uploads/` and served as static files — when deploying to a host that wipes files on every deploy (such as free tiers of Render/Railway), switching to cloud storage is recommended.
- All site colors are CSS variables in `frontend/src/styles/variables.css` — edit them to change the entire visual identity without touching any component.
- The store name, social media links, branches, shipping prices, and default reservation percentage are all editable from the admin panel (`/admin/settings`).
- Each category's attributes (processor, RAM, capacity...) and their available values are managed from `/admin/category-attributes` — no code changes are needed to add a new attribute or value.

### License

Private project — no public license has been specified yet.

### Author

**Mohammad Molazem** — [GitHub](https://github.com/eng-molazem) · [LinkedIn](https://www.linkedin.com/in/mohammad-molazem/)

---

## 🇸🇦 العربية

### نظرة عامة

منصة تجارة إلكترونية كاملة لبيع اللابتوبات وملحقاتها بالليرة السورية (SYP)، بنظام **دفع يدوي بالكامل** (بدون أي بوابة دفع إلكترونية)، **بدون تسجيل دخول للمستخدمين** (تصفح وشراء وحجز كزائر)، مع لوحة تحكم أدمن كاملة الصلاحيات ومتعددة المستخدمين.

### البنية التقنية

```
laptop-store/
  backend/   Node.js + Express + MongoDB (Mongoose) + Socket.io + JWT + Multer
  frontend/  React + Vite + React Router + react-i18next + Framer Motion
```

تفاصيل كل جزء في README الخاص به: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)

### أبرز المزايا

**للمستخدم:**
- تصفح، بحث فوري (autocomplete)، وفلترة متقدمة — كل فئة منتجات (لابتوبات، كمبيوتر، اكسسوارات، كاميرات، وحدات تخزين، بطاريات) لها **مواصفاتها الخاصة** (معالج/رام للابتوبات، سعة/نوع للبطاريات...)، وليست فلاتر عامة موحّدة.
- مقارنة منتجات جنباً إلى جنب (مقيّدة بمنتجات من **نفس الفئة** فقط).
- تقييمات ومراجعات مع إمكانية الإبلاغ عن تعليق.
- حجز منتج بدفع نسبة مقدّمة (يحددها الأدمن) بدل السعر الكامل.
- سلة، كوبونات خصم، شحن محسوب حسب المدينة.
- دفع يدوي: اختيار طريقة تحويل، رفع إثبات، ثم متابعة حالة الطلب بخط زمني (Timeline) حي عبر Socket.io بدون تحديث الصفحة.
- عربي/إنكليزي (RTL/LTR كامل) ووضع ليلي/نهاري، قابلة للتبديل الفوري.

**للأدمن:**
- لوحة معلومات بإحصائيات (مبيعات، طلبات، مخزون منخفض، الأكثر مبيعاً).
- إدارة كاملة: المنتجات، الفئات، **خصائص كل فئة وقيمها**، الطلبات، طلبات الدفع (موافقة/رفض)، طرق الدفع، الكوبونات، التقييمات، الإعدادات العامة للمتجر.
- صلاحيات متعددة المستويات: مالك (Owner) وصلاحيات دقيقة لكل موظف.
- سجل تدقيق (Audit Log) لكل إجراء حسّاس.
- تصدير CSV للطلبات وطلبات الدفع.
- Rate limiting على تسجيل دخول الأدمن.

### التشغيل المحلي

#### المتطلبات
- Node.js 18+
- MongoDB يعمل محلياً (أو رابط Atlas)

#### 1) الباك اند

```bash
cd backend
npm install
cp .env.example .env   # عدّل القيم حسب الحاجة (خصوصاً OWNER_EMAIL/OWNER_PASSWORD و JWT_SECRET)
npm run seed            # يزرع: حساب المالك + الفئات + خصائصها الافتراضية + منتجات تجريبية + طريقتي دفع + كوبون تجريبي
npm run dev              # يشغّل على http://localhost:5050 (أو المنفذ في PORT)
```

#### 2) الفرونت اند

```bash
cd frontend
npm install
npm run dev               # يشغّل على http://localhost:5173 (Vite يختار منفذاً آخر تلقائياً لو كان مشغولاً)
```

إن كان الفرونت يعمل على منفذ غير 5173/5174، حدّث `CLIENT_URL` في `backend/.env` ليطابقه (لإعدادات CORS)، وأعد تشغيل الباك اند.

#### تسجيل دخول الأدمن

بعد `npm run seed`، استخدم القيم التي وضعتها في `OWNER_EMAIL` / `OWNER_PASSWORD` بملف `backend/.env` لتسجيل الدخول من `/admin/login` (رابط 🔒 ظاهر في أعلى الموقع). **غيّر كلمة المرور الافتراضية قبل أي استخدام حقيقي.**

#### البريد الإلكتروني (اختياري)

لتفعيل إرسال البريد عند موافقة/رفض طلبات الدفع والسلة المتروكة، عبّئ إعدادات `SMTP_*` في `backend/.env`. بدونها، الموقع يعمل بشكل طبيعي ويعتمد فقط على الإشعار الفوري داخل الموقع (Socket.io).

### ملاحظات مهمة

- كل الصور (منتجات، QR لطرق الدفع، إثباتات التحويل) تُخزَّن محلياً في `backend/uploads/` وتُقدَّم كملفات ثابتة — عند النشر على استضافة تمسح الملفات بعد كل نشر (مثل Render/Railway المجانية)، يُفضّل الانتقال لتخزين سحابي.
- ألوان الموقع بالكامل متغيرات CSS في `frontend/src/styles/variables.css` — عدّلها لتغيير الهوية البصرية للموقع بالكامل دون لمس أي مكوّن.
- اسم المتجر، السوشال ميديا، الفروع، أسعار الشحن، ونسبة الحجز الافتراضية — كلها قابلة للتعديل من لوحة الأدمن (`/admin/settings`).
- خصائص كل فئة (المعالج، الرام، السعة...) وقيمها المتاحة تُدار من `/admin/category-attributes` — لا حاجة لتعديل الكود لإضافة خاصية أو قيمة جديدة.

### الترخيص

مشروع خاص — لا يوجد ترخيص عام محدد بعد.

### المطوّر

**محمد ملازم** — [GitHub](https://github.com/eng-molazem) · [LinkedIn](https://www.linkedin.com/in/mohammad-molazem/)
