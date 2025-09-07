.PHONY: help install dev build start stop clean docker-up docker-down docker-build docker-logs

# Default target
help:
	@echo "Booking4U - نظام حجز المواعيد الذكي"
	@echo ""
	@echo "الأوامر المتاحة:"
	@echo "  install      - تثبيت جميع التبعيات"
	@echo "  dev          - تشغيل في وضع التطوير"
	@echo "  build        - بناء التطبيق للإنتاج"
	@echo "  start        - تشغيل التطبيق"
	@echo "  stop         - إيقاف التطبيق"
	@echo "  clean        - تنظيف الملفات المؤقتة"
	@echo "  docker-up    - تشغيل التطبيق باستخدام Docker"
	@echo "  docker-down  - إيقاف التطبيق في Docker"
	@echo "  docker-build - بناء صور Docker"
	@echo "  docker-logs  - عرض سجلات Docker"

# Install all dependencies
install:
	@echo "تثبيت تبعيات المشروع..."
	npm run install:all
	@echo "تم تثبيت جميع التبعيات بنجاح!"

# Development mode
dev:
	@echo "تشغيل التطبيق في وضع التطوير..."
	npm run dev

# Build for production
build:
	@echo "بناء التطبيق للإنتاج..."
	npm run build
	@echo "تم بناء التطبيق بنجاح!"

# Start production
start:
	@echo "تشغيل التطبيق..."
	npm start

# Stop application
stop:
	@echo "إيقاف التطبيق..."
	@-pkill -f "node.*server.js"
	@-pkill -f "react-scripts"

# Clean temporary files
clean:
	@echo "تنظيف الملفات المؤقتة..."
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf frontend/build
	rm -rf .cache
	@echo "تم التنظيف بنجاح!"

# Docker commands
docker-up:
	@echo "تشغيل التطبيق باستخدام Docker..."
	docker-compose up -d
	@echo "تم تشغيل التطبيق بنجاح!"
	@echo "يمكنك الوصول للتطبيق على: http://localhost"

docker-down:
	@echo "إيقاف التطبيق في Docker..."
	docker-compose down
	@echo "تم إيقاف التطبيق!"

docker-build:
	@echo "بناء صور Docker..."
	docker-compose build
	@echo "تم بناء الصور بنجاح!"

docker-logs:
	@echo "عرض سجلات Docker..."
	docker-compose logs -f

# Database commands
db-backup:
	@echo "إنشاء نسخة احتياطية من قاعدة البيانات..."
	docker exec booking4u-mongodb mongodump --out /data/backup/$(shell date +%Y%m%d_%H%M%S)
	@echo "تم إنشاء النسخة الاحتياطية!"

db-restore:
	@echo "استعادة قاعدة البيانات من النسخة الاحتياطية..."
	@read -p "أدخل اسم ملف النسخة الاحتياطية: " backup_file; \
	docker exec booking4u-mongodb mongorestore /data/backup/$$backup_file
	@echo "تم استعادة قاعدة البيانات!"

# Development utilities
lint:
	@echo "فحص الكود..."
	cd backend && npm run lint
	cd frontend && npm run lint

test:
	@echo "تشغيل الاختبارات..."
	cd backend && npm test
	cd frontend && npm test

# Production deployment
deploy:
	@echo "نشر التطبيق..."
	@echo "يرجى تكوين إعدادات النشر أولاً"
	@echo "يمكنك استخدام: make docker-up للاختبار المحلي"

# Monitoring
logs:
	@echo "عرض سجلات التطبيق..."
	@echo "سجلات الباك إند:"
	@-tail -f backend/logs/app.log 2>/dev/null || echo "لا توجد سجلات"
	@echo "سجلات الفرونت إند:"
	@-tail -f frontend/logs/app.log 2>/dev/null || echo "لا توجد سجلات"

# Health check
health:
	@echo "فحص صحة التطبيق..."
	@curl -f http://localhost:5000/api/health || echo "الباك إند غير متاح"
	@curl -f http://localhost:3000 || echo "الفرونت إند غير متاح"

# Setup development environment
setup-dev:
	@echo "إعداد بيئة التطوير..."
	@echo "1. تثبيت Node.js و npm..."
	@echo "2. تثبيت MongoDB..."
	@echo "3. تثبيت Docker (اختياري)..."
	@echo "4. نسخ ملفات البيئة..."
	cp backend/env.example backend/.env
	@echo "5. تثبيت التبعيات..."
	make install
	@echo "تم إعداد بيئة التطوير بنجاح!"
	@echo "يمكنك الآن تشغيل: make dev"
