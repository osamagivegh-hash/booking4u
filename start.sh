#!/bin/bash

# Booking4U - Quick Start Script
# نظام حجز المواعيد الذكي - سكريبت التشغيل السريع

echo "🚀 مرحباً بك في Booking4U - نظام حجز المواعيد الذكي"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت. يرجى تثبيت Docker أولاً."
    echo "يمكنك تحميله من: https://docker.com"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose غير مثبت. يرجى تثبيت Docker Compose أولاً."
    exit 1
fi

echo "✅ Docker و Docker Compose مثبتان"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "📝 إنشاء ملف البيئة للباك إند..."
    cp backend/env.example backend/.env
    echo "⚠️  يرجى تعديل ملف backend/.env بإعداداتك"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 إنشاء ملف البيئة للفرونت إند..."
    cp frontend/env.example.txt frontend/.env
    echo "⚠️  يرجى تعديل ملف frontend/.env بإعداداتك"
fi

# Function to show menu
show_menu() {
    echo ""
    echo "🔧 اختر الخيار المطلوب:"
    echo "1) تشغيل التطبيق (Docker)"
    echo "2) إيقاف التطبيق"
    echo "3) إعادة تشغيل التطبيق"
    echo "4) عرض السجلات"
    echo "5) فحص صحة التطبيق"
    echo "6) تنظيف وإعادة البناء"
    echo "7) عرض المساعدة"
    echo "0) خروج"
    echo ""
}

# Function to start application
start_app() {
    echo "🚀 تشغيل التطبيق..."
    docker-compose up -d
    echo ""
    echo "✅ تم تشغيل التطبيق بنجاح!"
    echo "🌐 يمكنك الوصول للتطبيق على:"
    echo "   - الواجهة الأمامية: http://localhost:3000"
    echo "   - واجهة API: http://localhost:5000"
    echo "   - قاعدة البيانات: mongodb://localhost:27017"
    echo ""
    echo "📊 لعرض السجلات: ./start.sh"
    echo "🛑 لإيقاف التطبيق: docker-compose down"
}

# Function to stop application
stop_app() {
    echo "🛑 إيقاف التطبيق..."
    docker-compose down
    echo "✅ تم إيقاف التطبيق!"
}

# Function to restart application
restart_app() {
    echo "🔄 إعادة تشغيل التطبيق..."
    docker-compose down
    docker-compose up -d
    echo "✅ تم إعادة تشغيل التطبيق!"
}

# Function to show logs
show_logs() {
    echo "📋 عرض السجلات..."
    echo "اختر الخدمة:"
    echo "1) جميع السجلات"
    echo "2) سجلات الباك إند"
    echo "3) سجلات الفرونت إند"
    echo "4) سجلات قاعدة البيانات"
    read -p "اختر رقم الخدمة: " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        4) docker-compose logs -f mongodb ;;
        *) echo "❌ خيار غير صحيح" ;;
    esac
}

# Function to health check
health_check() {
    echo "🏥 فحص صحة التطبيق..."
    
    # Check backend
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ الباك إند يعمل بشكل صحيح"
    else
        echo "❌ الباك إند غير متاح"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ الفرونت إند يعمل بشكل صحيح"
    else
        echo "❌ الفرونت إند غير متاح"
    fi
    
    # Check database
    if docker-compose exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ قاعدة البيانات تعمل بشكل صحيح"
    else
        echo "❌ قاعدة البيانات غير متاحة"
    fi
}

# Function to clean and rebuild
clean_rebuild() {
    echo "🧹 تنظيف وإعادة البناء..."
    docker-compose down
    docker system prune -f
    docker-compose build --no-cache
    docker-compose up -d
    echo "✅ تم التنظيف وإعادة البناء!"
}

# Function to show help
show_help() {
    echo ""
    echo "📚 دليل الاستخدام:"
    echo "=================="
    echo ""
    echo "🔧 الأوامر الأساسية:"
    echo "   make docker-up     - تشغيل التطبيق"
    echo "   make docker-down   - إيقاف التطبيق"
    echo "   make docker-logs   - عرض السجلات"
    echo "   make health        - فحص الصحة"
    echo ""
    echo "📁 هيكل المشروع:"
    echo "   backend/           - خادم API"
    echo "   frontend/          - واجهة المستخدم"
    echo "   nginx/             - خادم الويب العكسي"
    echo "   docker-compose.yml - إعدادات Docker"
    echo ""
    echo "🌐 الروابط:"
    echo "   التطبيق: http://localhost:3000"
    echo "   API: http://localhost:5000"
    echo "   قاعدة البيانات: mongodb://localhost:27017"
    echo ""
    echo "📧 الدعم:"
    echo "   للمساعدة: support@booking4u.com"
    echo ""
}

# Main script logic
if [ "$1" = "start" ]; then
    start_app
elif [ "$1" = "stop" ]; then
    stop_app
elif [ "$1" = "restart" ]; then
    restart_app
elif [ "$1" = "logs" ]; then
    show_logs
elif [ "$1" = "health" ]; then
    health_check
elif [ "$1" = "clean" ]; then
    clean_rebuild
elif [ "$1" = "help" ]; then
    show_help
else
    # Interactive mode
    while true; do
        show_menu
        read -p "أدخل رقم الخيار: " choice
        
        case $choice in
            1) start_app ;;
            2) stop_app ;;
            3) restart_app ;;
            4) show_logs ;;
            5) health_check ;;
            6) clean_rebuild ;;
            7) show_help ;;
            0) echo "👋 شكراً لاستخدام Booking4U!"; exit 0 ;;
            *) echo "❌ خيار غير صحيح. يرجى المحاولة مرة أخرى." ;;
        esac
        
        echo ""
        read -p "اضغط Enter للعودة للقائمة..."
    done
fi
