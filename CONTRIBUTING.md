# 🤝 دليل المساهمة - Booking4U

شكراً لاهتمامك بالمساهمة في تطوير Booking4U! هذا الدليل سيساعدك على البدء.

## 📋 جدول المحتويات

- [كيفية المساهمة](#كيفية-المساهمة)
- [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
- [معايير الكود](#معايير-الكود)
- [عملية التطوير](#عملية-التطوير)
- [الإبلاغ عن الأخطاء](#الإبلاغ-عن-الأخطاء)
- [اقتراح الميزات](#اقتراح-الميزات)
- [الأسئلة الشائعة](#الأسئلة-الشائعة)

## 🚀 كيفية المساهمة

### أنواع المساهمات

نرحب بجميع أنواع المساهمات:

- 🐛 **إصلاح الأخطاء** - إصلاح مشاكل في الكود
- ✨ **ميزات جديدة** - إضافة وظائف جديدة
- 📚 **تحسين التوثيق** - تحسين الكتب والوثائق
- 🎨 **تحسينات الواجهة** - تحسين التصميم والتفاعل
- ⚡ **تحسينات الأداء** - تحسين سرعة التطبيق
- 🧪 **اختبارات** - إضافة اختبارات جديدة
- 🔧 **تحسينات البنية** - تحسين هيكل المشروع

### خطوات المساهمة

1. **Fork المشروع**
   ```bash
   git clone https://github.com/your-username/booking4u.git
   cd booking4u
   ```

2. **إنشاء فرع جديد**
   ```bash
   git checkout -b feature/your-feature-name
   # أو
   git checkout -b fix/your-bug-fix
   ```

3. **إجراء التغييرات**
   - اكتب الكود
   - أضف الاختبارات
   - حدث التوثيق

4. **Commit التغييرات**
   ```bash
   git add .
   git commit -m "feat: add new booking feature"
   ```

5. **Push إلى الفرع**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **إنشاء Pull Request**
   - اذهب إلى GitHub
   - انقر على "New Pull Request"
   - املأ النموذج

## 🛠️ إعداد بيئة التطوير

### المتطلبات

- Node.js (v16 أو أحدث)
- npm أو yarn
- MongoDB (v5 أو أحدث)
- Docker و Docker Compose (اختياري)

### التثبيت

1. **استنساخ المشروع**
   ```bash
   git clone https://github.com/your-username/booking4u.git
   cd booking4u
   ```

2. **تثبيت التبعيات**
   ```bash
   npm run install:all
   ```

3. **إعداد ملفات البيئة**
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example.txt frontend/.env
   ```

4. **تشغيل التطبيق**
   ```bash
   npm run dev
   ```

### استخدام Docker

```bash
# تشغيل التطبيق
./start.sh

# أو
make docker-up
```

## 📝 معايير الكود

### تنسيق الكود

- استخدم **Prettier** لتنسيق الكود
- اتبع **ESLint** للقواعد
- استخدم **TypeScript** للفرونت إند (اختياري)

### أسماء المتغيرات والدوال

```javascript
// ✅ صحيح
const userName = 'ahmed';
const getUserData = () => {};

// ❌ خطأ
const user_name = 'ahmed';
const get_user_data = () => {};
```

### التعليقات

```javascript
/**
 * إنشاء حجز جديد
 * @param {Object} bookingData - بيانات الحجز
 * @param {string} bookingData.serviceId - معرف الخدمة
 * @param {Date} bookingData.date - تاريخ الحجز
 * @returns {Promise<Object>} الحجز المنشأ
 */
const createBooking = async (bookingData) => {
  // التحقق من صحة البيانات
  if (!bookingData.serviceId) {
    throw new Error('معرف الخدمة مطلوب');
  }
  
  // إنشاء الحجز
  const booking = await Booking.create(bookingData);
  return booking;
};
```

### رسائل Commit

استخدم **Conventional Commits**:

```bash
feat: add new booking feature
fix: resolve authentication issue
docs: update API documentation
style: format code with prettier
refactor: improve booking validation
test: add unit tests for booking service
chore: update dependencies
```

## 🔄 عملية التطوير

### دورة التطوير

1. **التخطيط**
   - حدد المشكلة أو الميزة
   - اكتب المتطلبات
   - صمم الحل

2. **التطوير**
   - اكتب الكود
   - اتبع معايير الكود
   - اكتب الاختبارات

3. **الاختبار**
   - اختبر الكود محلياً
   - تأكد من عمل الاختبارات
   - اختبر الواجهة

4. **المراجعة**
   - راجع الكود بنفسك
   - اطلب مراجعة من الآخرين
   - أصلح الملاحظات

5. **الدمج**
   - ادمج مع الفرع الرئيسي
   - تأكد من عمل CI/CD
   - نشر التحديث

### الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات الباك إند
cd backend && npm test

# تشغيل اختبارات الفرونت إند
cd frontend && npm test

# تشغيل اختبارات التغطية
npm run test:coverage
```

## 🐛 الإبلاغ عن الأخطاء

### قالب الإبلاغ عن الأخطاء

```markdown
## وصف المشكلة
وصف واضح ومختصر للمشكلة.

## خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. انقر على '...'
3. انتقل إلى '...'
4. شاهد الخطأ

## السلوك المتوقع
وصف لما يجب أن يحدث.

## لقطات الشاشة
إذا كان ذلك مناسباً، أضف لقطات شاشة.

## معلومات النظام
- نظام التشغيل: [مثل Windows 10]
- المتصفح: [مثل Chrome 90]
- إصدار التطبيق: [مثل 1.0.0]

## معلومات إضافية
أي معلومات أخرى حول المشكلة.
```

## 💡 اقتراح الميزات

### قالب اقتراح الميزة

```markdown
## ملخص الميزة
وصف مختصر للميزة المقترحة.

## المشكلة التي تحلها
وصف المشكلة التي ستحلها هذه الميزة.

## الحل المقترح
وصف مفصل للحل المقترح.

## البدائل المدروسة
وصف أي حلول بديلة تم النظر فيها.

## معلومات إضافية
أي معلومات أخرى مفيدة.
```

## ❓ الأسئلة الشائعة

### كيف أبدأ؟

1. اقرأ هذا الدليل
2. اطلع على [التوثيق](README.md)
3. اختر مشكلة أو ميزة بسيطة
4. ابدأ بالتطوير

### كيف أطلب مساعدة؟

- افتح [Issue](https://github.com/your-username/booking4u/issues)
- اطرح سؤالاً في [Discussions](https://github.com/your-username/booking4u/discussions)
- تواصل معنا عبر البريد الإلكتروني

### كيف أعرف أن مساهمتي مقبولة؟

- سيتم مراجعة Pull Request الخاص بك
- قد يُطلب منك إجراء تعديلات
- عند الموافقة، سيتم دمج الكود

### هل يمكنني المساهمة في التوثيق؟

نعم! التوثيق مهم جداً. يمكنك:
- تحسين README
- إضافة أمثلة للكود
- ترجمة التوثيق
- إضافة رسوم توضيحية

## 📞 التواصل

- **البريد الإلكتروني**: support@booking4u.com
- **GitHub Issues**: [رابط Issues](https://github.com/your-username/booking4u/issues)
- **GitHub Discussions**: [رابط Discussions](https://github.com/your-username/booking4u/discussions)

## 🙏 الشكر

شكراً لمساهمتك في تطوير Booking4U! كل مساهمة، مهما كانت صغيرة، تساعد في جعل النظام أفضل.

---

**Booking4U** - نظام حجز المواعيد الذكي 🚀
