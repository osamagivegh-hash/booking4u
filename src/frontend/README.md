# Booking4U Frontend

واجهة المستخدم لنظام حجز المواعيد Booking4U

## 🚀 المميزات

- **واجهة مستخدم حديثة** مع Tailwind CSS
- **تصميم متجاوب** يعمل على جميع الأجهزة
- **نظام مصادقة كامل** مع إدارة الحالة
- **تنقل سلس** مع React Router
- **نماذج ذكية** مع React Hook Form
- **إشعارات تفاعلية** مع React Hot Toast
- **إدارة حالة متقدمة** مع Zustand
- **دعم اللغة العربية** مع RTL

## 📋 المتطلبات

- Node.js (v14 أو أحدث)
- npm أو yarn

## 🛠️ التثبيت

1. **تثبيت التبعيات:**
```bash
npm install
```

2. **تشغيل التطبيق:**
```bash
npm start
```

3. **بناء التطبيق للإنتاج:**
```bash
npm run build
```

## 🏗️ هيكل المشروع

```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
│   ├── Auth/           # مكونات المصادقة
│   ├── Layout/         # مكونات التخطيط
│   ├── UI/             # مكونات واجهة المستخدم
│   └── Forms/          # مكونات النماذج
├── pages/              # صفحات التطبيق
│   ├── Auth/           # صفحات المصادقة
│   ├── Dashboard/      # صفحات لوحة التحكم
│   ├── Services/       # صفحات الخدمات
│   └── Booking/        # صفحات الحجز
├── stores/             # إدارة الحالة
├── services/           # خدمات API
├── hooks/              # React Hooks مخصصة
├── utils/              # أدوات مساعدة
└── styles/             # ملفات التنسيق
```

## 🎨 التصميم

### الألوان
- **Primary**: أزرق (#3B82F6)
- **Secondary**: رمادي (#64748B)
- **Success**: أخضر (#22C55E)
- **Warning**: برتقالي (#F59E0B)
- **Danger**: أحمر (#EF4444)

### الخطوط
- **Arabic**: Cairo
- **English**: Inter

### المكونات
- **Buttons**: أزرار بأحجام وألوان مختلفة
- **Inputs**: حقول إدخال مع تحقق من صحة البيانات
- **Cards**: بطاقات لعرض المحتوى
- **Modals**: نوافذ منبثقة
- **Tables**: جداول منظمة
- **Forms**: نماذج ذكية

## 🔧 الإعدادات

### Tailwind CSS
تم تخصيص Tailwind CSS ليتناسب مع التصميم العربي:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        secondary: { /* ... */ },
        // ...
      },
      fontFamily: {
        'arabic': ['Cairo', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### RTL Support
التطبيق يدعم اللغة العربية مع اتجاه RTL:

```html
<html lang="ar" dir="rtl">
```

## 📱 الصفحات

### الصفحات العامة
- **الرئيسية** (`/`) - صفحة الترحيب والمميزات
- **تسجيل الدخول** (`/login`) - تسجيل الدخول للمستخدمين
- **التسجيل** (`/register`) - إنشاء حساب جديد
- **الخدمات** (`/services`) - عرض الخدمات المتاحة

### الصفحات المحمية
- **لوحة التحكم** (`/dashboard`) - الصفحة الرئيسية للمستخدم
- **لوحة تحكم الأعمال** (`/dashboard/business`) - لإدارة الأعمال التجارية
- **حجوزاتي** (`/dashboard/bookings`) - عرض الحجوزات
- **الملف الشخصي** (`/dashboard/profile`) - إدارة الملف الشخصي

## 🔐 المصادقة

### إدارة الحالة
يستخدم التطبيق Zustand لإدارة حالة المصادقة:

```javascript
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      // Actions...
    }),
    { name: 'auth-storage' }
  )
);
```

### حماية المسارات
```javascript
<ProtectedRoute requiredRole="business">
  <BusinessDashboard />
</ProtectedRoute>
```

## 🌐 API Integration

### إعداد Axios
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});
```

### Interceptors
- **Request**: إضافة token للمصادقة
- **Response**: معالجة أخطاء المصادقة

## 📊 إدارة البيانات

### React Query
يستخدم React Query لإدارة حالة البيانات:

```javascript
const { data, isLoading, error } = useQuery(
  ['services', businessId],
  () => fetchServices(businessId)
);
```

### Mutations
```javascript
const mutation = useMutation(createBooking, {
  onSuccess: () => {
    toast.success('تم إنشاء الحجز بنجاح');
    queryClient.invalidateQueries(['bookings']);
  },
});
```

## 🎯 المكونات الرئيسية

### Layout
- **Header**: شريط التنقل مع قائمة المستخدم
- **Footer**: معلومات الشركة والروابط
- **Sidebar**: قائمة جانبية للوحة التحكم

### Forms
- **LoginForm**: نموذج تسجيل الدخول
- **RegisterForm**: نموذج التسجيل
- **BookingForm**: نموذج الحجز
- **ProfileForm**: نموذج الملف الشخصي

### UI Components
- **Button**: أزرار قابلة للتخصيص
- **Input**: حقول إدخال مع تحقق
- **Modal**: نوافذ منبثقة
- **Table**: جداول منظمة
- **Card**: بطاقات عرض المحتوى

## 🚀 النشر

### بناء التطبيق
```bash
npm run build
```

### النشر على Netlify
1. رفع مجلد `build` إلى Netlify
2. تعيين متغيرات البيئة
3. تكوين إعادة التوجيه للـ SPA

### النشر على Vercel
```bash
npm install -g vercel
vercel
```

## 🔧 التطوير

### تشغيل في وضع التطوير
```bash
npm start
```

### تشغيل الاختبارات
```bash
npm test
```

### فحص الكود
```bash
npm run lint
```

## 📱 الاستجابة

التطبيق مصمم ليعمل على جميع أحجام الشاشات:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🌍 دعم اللغات

### اللغة العربية
- اتجاه RTL
- خطوط عربية
- تنسيق التواريخ والأرقام
- ترجمة كاملة للواجهة

### اللغة الإنجليزية
- اتجاه LTR
- خطوط إنجليزية
- تنسيق غربي

## 🔒 الأمان

- **HTTPS**: إجبارية في الإنتاج
- **CORS**: إعدادات آمنة
- **XSS Protection**: حماية من هجمات XSS
- **CSRF Protection**: حماية من هجمات CSRF

## 📈 الأداء

- **Code Splitting**: تقسيم الكود حسب الصفحات
- **Lazy Loading**: تحميل المكونات عند الحاجة
- **Image Optimization**: تحسين الصور
- **Caching**: تخزين مؤقت للبيانات

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
