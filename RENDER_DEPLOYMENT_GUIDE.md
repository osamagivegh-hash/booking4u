# 🚀 دليل نشر المشروع على Render (النظام المدمج)

## 📋 المتطلبات

- حساب على [Render.com](https://render.com)
- مشروع على GitHub
- MongoDB Atlas (مجاني)

## 🔧 خطوات النشر

### 1. إعداد MongoDB Atlas

1. اذهب إلى [MongoDB Atlas](https://cloud.mongodb.com)
2. أنشئ حساب جديد أو سجل دخول
3. أنشئ Cluster جديد (اختر الخطة المجانية)
4. أنشئ Database: `booking4u`
5. أنشئ Collections: `users`, `bookings`, `services`
6. احصل على Connection String

### 2. إعداد Render

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط **"New +"**
3. اختر **"Blueprint"**
4. اربط مع GitHub Repository
5. اختر **"Apply existing blueprint"**
6. اختر ملف `render.yaml`

### 3. إعداد Environment Variables

في Render Dashboard، أضف المتغيرات التالية:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking4u

# Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production
PORT=10000

# CORS
CORS_ORIGIN=https://your-app-name.onrender.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD
CORS_MAX_AGE=86400

# Frontend
REACT_APP_API_URL=/api
REACT_APP_BASE_URL=/
REACT_APP_SOCKET_URL=/

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 4. Deploy

1. اضغط **"Apply"**
2. انتظر حتى يكتمل البناء (5-10 دقائق)
3. ستجد الرابط في Dashboard

## 🎯 النتيجة

بعد النشر، ستحصل على:

- **Frontend**: `https://your-app-name.onrender.com/`
- **API**: `https://your-app-name.onrender.com/api/`
- **Health Check**: `https://your-app-name.onrender.com/api/health`

## 🔍 اختبار النظام

### 1. اختبار Frontend
```bash
curl https://your-app-name.onrender.com/
```

### 2. اختبار API
```bash
curl https://your-app-name.onrender.com/api/health
```

### 3. اختبار Database
```bash
curl https://your-app-name.onrender.com/api/debug/database
```

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

1. **Build Failed**
   - تحقق من `package.json` scripts
   - تأكد من وجود جميع dependencies

2. **Database Connection Failed**
   - تحقق من `MONGODB_URI`
   - تأكد من إضافة IP إلى whitelist في MongoDB

3. **CORS Errors**
   - تحقق من `CORS_ORIGIN`
   - تأكد من أن الرابط صحيح

4. **Frontend Not Loading**
   - تحقق من `frontend-build` folder
   - تأكد من `homepage` في package.json

## 📊 Monitoring

- **Logs**: متاحة في Render Dashboard
- **Metrics**: CPU, Memory, Response Time
- **Health Checks**: تلقائية كل 5 دقائق

## 🔄 Auto-Deploy

- كل push إلى `main` branch سيؤدي إلى إعادة deploy تلقائية
- يمكن تعطيل Auto-Deploy من Settings

## 💰 التكلفة

- **Free Plan**: 750 ساعة/شهر
- **Sleep Mode**: بعد 15 دقيقة من عدم الاستخدام
- **Database**: MongoDB Atlas مجاني حتى 512MB

## 🆘 الدعم

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [GitHub Issues](https://github.com/your-repo/issues)
