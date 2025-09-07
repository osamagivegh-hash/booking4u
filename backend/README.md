a# Booking4U Backend API

نظام حجز المواعيد - الخادم الخلفي

## 🚀 المميزات

- **نظام مصادقة كامل** مع JWT
- **إدارة المستخدمين** (أصحاب الأعمال والعملاء)
- **إدارة الأعمال التجارية** مع الإعدادات المتقدمة
- **إدارة الخدمات** مع الفئات والأسعار
- **نظام الحجوزات** مع التحقق من الأوقات المتاحة
- **الإحصائيات والتقارير** للأعمال التجارية
- **البحث والتصفية** المتقدم
- **التحقق من صحة البيانات** مع express-validator
- **معالجة الأخطاء** الشاملة
- **نظام تسجيل متقدم** مع Winston
- **معالجة أخطاء محسنة** مع تصنيف الأخطاء
- **استجابة API موحدة** مع تنسيق ثابت
- **أمان محسن** مع Helmet و sanitization
- **مراقبة صحة النظام** مع health checks
- **إغلاق آمن** مع graceful shutdown

## 📋 المتطلبات

- Node.js (v14 أو أحدث)
- MongoDB (v4.4 أو أحدث)
- npm أو yarn

## 🛠️ التثبيت

1. **تثبيت التبعيات:**
```bash
npm install
```

2. **إعداد المتغيرات البيئية:**
```bash
cp env.example .env
```

3. **تعديل ملف .env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/booking4u
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
ENABLE_SWAGGER=true
ENABLE_LOGGING=true
LOG_LEVEL=info
```

4. **إنشاء مجلد السجلات:**
```bash
mkdir -p logs
```

5. **تشغيل الخادم:**
```bash
# للتطوير
npm run dev

# للإنتاج
npm start

# للاختبار
npm test
```

## 📚 API Endpoints

### المصادقة (Authentication)
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - جلب بيانات المستخدم الحالي
- `PUT /api/auth/profile` - تحديث الملف الشخصي
- `PUT /api/auth/change-password` - تغيير كلمة المرور

### الأعمال التجارية (Businesses)
- `GET /api/businesses` - جلب جميع الأعمال التجارية
- `GET /api/businesses/:id` - جلب عمل تجاري محدد
- `POST /api/businesses` - إنشاء عمل تجاري جديد
- `PUT /api/businesses/:id` - تحديث عمل تجاري
- `GET /api/businesses/my-business` - جلب عملي التجاري
- `GET /api/businesses/search` - البحث في الأعمال التجارية
- `GET /api/businesses/:id/stats` - إحصائيات العمل التجاري

### الخدمات (Services)
- `GET /api/services/:businessId` - جلب خدمات عمل تجاري
- `GET /api/services/:businessId/:serviceId` - جلب خدمة محددة
- `POST /api/services` - إنشاء خدمة جديدة
- `PUT /api/services/:id` - تحديث خدمة
- `DELETE /api/services/:id` - حذف خدمة
- `GET /api/services/category/:category` - جلب خدمات حسب الفئة
- `GET /api/services/search` - البحث في الخدمات

### الحجوزات (Bookings)
- `POST /api/bookings` - إنشاء حجز جديد
- `GET /api/bookings/business/:businessId` - حجوزات عمل تجاري
- `GET /api/bookings/my-bookings` - حجوزاتي
- `GET /api/bookings/:id` - جلب حجز محدد
- `PUT /api/bookings/:id/status` - تحديث حالة الحجز
- `PUT /api/bookings/:id/cancel` - إلغاء حجز
- `GET /api/bookings/available-slots/:businessId/:serviceId` - الأوقات المتاحة

### المستخدمين (Users)
- `GET /api/users` - جلب جميع المستخدمين (لأصحاب الأعمال)
- `GET /api/users/:id` - جلب مستخدم محدد
- `PUT /api/users/:id` - تحديث مستخدم
- `DELETE /api/users/:id` - حذف مستخدم
- `GET /api/users/stats` - إحصائيات المستخدمين
- `GET /api/users/search` - البحث في المستخدمين

## 🔐 الأمان

- **JWT Authentication** - مصادقة آمنة
- **Password Hashing** - تشفير كلمات المرور
- **Input Validation** - التحقق من صحة المدخلات
- **Role-based Access Control** - التحكم في الصلاحيات
- **CORS Protection** - حماية من الطلبات المتقاطعة
- **Helmet Security Headers** - رؤوس أمان HTTP
- **NoSQL Injection Protection** - حماية من حقن NoSQL
- **XSS Protection** - حماية من هجمات XSS
- **HTTP Parameter Pollution Protection** - حماية من تلويث المعاملات
- **Rate Limiting** - تحديد معدل الطلبات
- **Request Sanitization** - تنظيف الطلبات

## 📊 قاعدة البيانات

### النماذج (Models)

#### User
- `name` - الاسم
- `email` - البريد الإلكتروني (فريد)
- `password` - كلمة المرور (مشفرة)
- `phone` - رقم الهاتف
- `role` - الدور (business/customer)
- `avatar` - الصورة الشخصية
- `isActive` - حالة الحساب
- `emailVerified` - تأكيد البريد الإلكتروني
- `phoneVerified` - تأكيد الهاتف

#### Business
- `ownerId` - معرف المالك
- `name` - اسم النشاط التجاري
- `description` - الوصف
- `category` - الفئة
- `address` - العنوان
- `location` - الموقع الجغرافي
- `phone` - رقم الهاتف
- `email` - البريد الإلكتروني
- `workingHours` - ساعات العمل
- `settings` - الإعدادات
- `rating` - التقييم
- `totalReviews` - عدد التقييمات

#### Service
- `businessId` - معرف النشاط التجاري
- `name` - اسم الخدمة
- `description` - الوصف
- `duration` - المدة (بالدقائق)
- `price` - السعر
- `currency` - العملة
- `category` - فئة الخدمة
- `image` - صورة الخدمة
- `isActive` - حالة الخدمة
- `isPopular` - شعبية الخدمة
- `availableDays` - الأيام المتاحة
- `availableTimeSlots` - الأوقات المتاحة

#### Booking
- `businessId` - معرف النشاط التجاري
- `serviceId` - معرف الخدمة
- `customerId` - معرف العميل
- `staffId` - معرف الموظف (اختياري)
- `date` - تاريخ الحجز
- `startTime` - وقت البداية
- `endTime` - وقت النهاية
- `status` - حالة الحجز
- `totalPrice` - السعر الإجمالي
- `paymentStatus` - حالة الدفع
- `notes` - الملاحظات
- `rating` - التقييم
- `review` - المراجعة

## 🚀 التشغيل

### التطوير
```bash
npm run dev
```

### الإنتاج
```bash
npm start
```

### الاختبار
```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع المراقبة
npm run test:watch

# تشغيل الاختبارات مع تقرير التغطية
npm run test:coverage
```

## 📊 المراقبة والصيانة

### فحص صحة النظام
```bash
curl http://localhost:5000/api/health
```

### عرض السجلات
```bash
# سجلات التطبيق
tail -f logs/app.log

# سجلات الأخطاء
tail -f logs/error.log
```

### إعادة تشغيل آمن
```bash
# إرسال إشارة إعادة التشغيل
kill -SIGTERM <PID>

# أو استخدام Ctrl+C في terminal
```

## 📝 أمثلة الاستخدام

### تسجيل مستخدم جديد
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "123456",
    "phone": "+966501234567",
    "role": "customer"
  }'
```

### تسجيل الدخول
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "123456"
  }'
```

### إنشاء حجز
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessId": "business_id_here",
    "serviceId": "service_id_here",
    "date": "2024-01-15",
    "startTime": "14:00"
  }'
```

## 🔧 الإعدادات المتقدمة

### إعداد MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking4u
```

### إعداد الإشعارات (اختياري)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### إعداد الدفع (اختياري)
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📈 المراقبة والصيانة

### سجلات الأخطاء
يتم تسجيل جميع الأخطاء في وحدة التحكم مع تفاصيل كاملة.

### مراقبة الأداء
يمكن إضافة أدوات مراقبة مثل:
- PM2
- New Relic
- DataDog

### النسخ الاحتياطي
يُنصح بإعداد نسخ احتياطي يومي لقاعدة البيانات.

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني
