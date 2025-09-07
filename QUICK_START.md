# 🚀 التشغيل السريع - Booking4U

## التثبيت والتشغيل في 5 دقائق

### المتطلبات
- Docker و Docker Compose مثبتان
- Git

### الخطوات

1. **استنساخ المشروع**
```bash
git clone https://github.com/your-username/booking4u.git
cd booking4u
```

2. **تشغيل التطبيق**
```bash
./start.sh
```

3. **الوصول للتطبيق**
- التطبيق: http://localhost:3000
- API: http://localhost:5000

### أوامر سريعة

```bash
# تشغيل التطبيق
./start.sh start

# إيقاف التطبيق
./start.sh stop

# عرض السجلات
./start.sh logs

# فحص الصحة
./start.sh health

# إعادة تشغيل
./start.sh restart
```

### أوامر Makefile

```bash
# عرض جميع الأوامر
make help

# تشغيل التطبيق
make docker-up

# إيقاف التطبيق
make docker-down

# عرض السجلات
make docker-logs
```

## إعداد ملفات البيئة

### الباك إند
```bash
cp backend/env.example backend/.env
# تعديل backend/.env
```

### الفرونت إند
```bash
cp frontend/env.example.txt frontend/.env
# تعديل frontend/.env
```

## الملفات المهمة

- `docker-compose.yml` - إعدادات Docker
- `start.sh` - سكريبت التشغيل السريع
- `Makefile` - أوامر التشغيل
- `backend/.env` - إعدادات الباك إند
- `frontend/.env` - إعدادات الفرونت إند

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
# فحص حالة الخدمات
docker-compose ps

# عرض السجلات
docker-compose logs

# إعادة بناء الصور
docker-compose build --no-cache
```

### قاعدة البيانات لا تعمل
```bash
# فحص MongoDB
docker-compose exec mongodb mongosh

# إعادة تشغيل MongoDB
docker-compose restart mongodb
```

### الباك إند لا يستجيب
```bash
# فحص الباك إند
curl http://localhost:5000/api/health

# عرض سجلات الباك إند
docker-compose logs backend
```

## الروابط المفيدة

- [التوثيق الكامل](README.md)
- [دليل API](backend/README.md)
- [دليل الفرونت إند](frontend/README.md)
- [إعدادات Docker](docker-compose.yml)

---

**Booking4U** - نظام حجز المواعيد الذكي 🚀
