import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    services: 'الخدمات',
    news: 'الأخبار',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    cancel: 'إلغاء',
    save: 'حفظ',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    search: 'بحث',
    filter: 'فلتر',
    sort: 'ترتيب',
    clear: 'مسح',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    open: 'فتح',
    show: 'إظهار',
    hide: 'إخفاء',
    
    // Services
    service: 'خدمة',
    services: 'خدمات',
    serviceDetails: 'تفاصيل الخدمة',
    bookService: 'احجز الخدمة',
    serviceProvider: 'مقدم الخدمة',
    price: 'السعر',
    duration: 'المدة',
    category: 'الفئة',
    description: 'الوصف',
    requirements: 'المتطلبات',
    reviews: 'التقييمات',
    rating: 'التقييم',
    bookNow: 'احجز الآن',
    askAboutService: 'اسأل عن الخدمة',
    relatedServices: 'خدمات مشابهة',
    
    // Bookings
    booking: 'حجز',
    bookings: 'حجوزات',
    myBookings: 'حجوزاتي',
    bookingDate: 'تاريخ الحجز',
    bookingTime: 'وقت الحجز',
    bookingStatus: 'حالة الحجز',
    pending: 'معلقة',
    confirmed: 'مؤكدة',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    
    // News
    news: 'الأخبار',
    latestNews: 'آخر الأخبار',
    breakingNews: 'أخبار عاجلة',
    featuredNews: 'أخبار مميزة',
    newsCategories: 'فئات الأخبار',
    readMore: 'اقرأ المزيد',
    publishedAt: 'تاريخ النشر',
    author: 'المؤلف',
    views: 'المشاهدات',
    likes: 'الإعجابات',
    shares: 'المشاركات',
    
    // Dashboard
    statistics: 'الإحصائيات',
    totalBookings: 'إجمالي الحجوزات',
    todayBookings: 'حجوزات اليوم',
    monthlyRevenue: 'الإيرادات الشهرية',
    totalRevenue: 'إجمالي الإيرادات',
    activeServices: 'الخدمات النشطة',
    conversionRate: 'معدل التحويل',
    averageRating: 'متوسط التقييم',
    totalReviews: 'إجمالي التقييمات',
    growthRate: 'معدل النمو',
    
    // Messages
    messages: 'الرسائل',
    sendMessage: 'إرسال رسالة',
    message: 'رسالة',
    newMessage: 'رسالة جديدة',
    unreadMessages: 'الرسائل غير المقروءة',
    conversation: 'محادثة',
    
    // Notifications
    notifications: 'الإشعارات',
    unreadNotifications: 'الإشعارات غير المقروءة',
    markAsRead: 'تحديد كمقروء',
    markAllAsRead: 'تحديد الكل كمقروء',
    
    // Forms
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    address: 'العنوان',
    city: 'المدينة',
    country: 'البلد',
    website: 'الموقع الإلكتروني',
    bio: 'نبذة شخصية',
    
    // Time
    now: 'الآن',
    minutesAgo: 'منذ {count} دقيقة',
    hoursAgo: 'منذ {count} ساعة',
    daysAgo: 'منذ {count} يوم',
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    
    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    online: 'متصل',
    offline: 'غير متصل',
    available: 'متاح',
    unavailable: 'غير متاح',
    
    // Actions
    like: 'إعجاب',
    share: 'مشاركة',
    comment: 'تعليق',
    follow: 'متابعة',
    unfollow: 'إلغاء المتابعة',
    report: 'إبلاغ',
    block: 'حظر',
    
    // Validation
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    invalidPhone: 'رقم الهاتف غير صحيح',
    passwordTooShort: 'كلمة المرور قصيرة جداً',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    
    // Categories
    haircut: 'قص شعر',
    hairStyling: 'تصفيف شعر',
    hairColoring: 'صبغ شعر',
    manicure: 'منيكير',
    pedicure: 'بديكير',
    facial: 'تنظيف بشرة',
    massage: 'مساج',
    consultation: 'استشارة',
    treatment: 'علاج',
    training: 'تدريب',
    other: 'أخرى',
    
    // Business Categories
    clinic: 'عيادة',
    salon: 'صالون تجميل',
    spa: 'سبا',
    gym: 'صالة رياضية',
    restaurant: 'مطعم',
    education: 'تعليم',
    
    // News Categories
    general: 'عام',
    business: 'أعمال',
    health: 'صحة',
    beauty: 'جمال',
    technology: 'تكنولوجيا',
    lifestyle: 'نمط حياة',
    promotions: 'عروض',
    announcements: 'إعلانات',
    
    // Search
    all: 'الكل',
    businesses: 'الأعمال',
    viewAllResults: 'عرض جميع النتائج',
    noResultsFound: 'لم يتم العثور على نتائج',
    tryDifferentKeywords: 'جرب كلمات مختلفة',
    
    // Social Sharing
    share: 'مشاركة',
    shareVia: 'مشاركة عبر',
    linkCopied: 'تم نسخ الرابط',
    contentCopied: 'تم نسخ المحتوى',
    copyFailed: 'فشل في النسخ',
    shareFailed: 'فشل في المشاركة',
    copied: 'تم النسخ',
    email: 'البريد الإلكتروني',
    sms: 'الرسائل النصية',
    
    // Time Ranges
    last7Days: 'آخر 7 أيام',
    last30Days: 'آخر 30 يوم',
    last90Days: 'آخر 90 يوم',
    lastYear: 'آخر سنة',
    
    // Additional terms
    total: 'إجمالي',
    customer: 'عميل',
    activeServices: 'الخدمات النشطة',
    amountPaid: 'المبلغ المدفوع',
    thisMonth: 'هذا الشهر',
    performance: 'الأداء',
    bookingGrowth: 'نمو الحجوزات',
    averageBooking: 'متوسط الحجز',
    today: 'اليوم',
    myBookings: 'حجوزاتي',
    bookingStatus: 'حالة الحجوزات'
  },
  en: {
    // Navigation
    home: 'Home',
    services: 'Services',
    news: 'News',
    dashboard: 'Dashboard',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Common
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    show: 'Show',
    hide: 'Hide',
    
    // Services
    service: 'Service',
    services: 'Services',
    serviceDetails: 'Service Details',
    bookService: 'Book Service',
    serviceProvider: 'Service Provider',
    price: 'Price',
    duration: 'Duration',
    category: 'Category',
    description: 'Description',
    requirements: 'Requirements',
    reviews: 'Reviews',
    rating: 'Rating',
    bookNow: 'Book Now',
    askAboutService: 'Ask About Service',
    relatedServices: 'Related Services',
    
    // Bookings
    booking: 'Booking',
    bookings: 'Bookings',
    myBookings: 'My Bookings',
    bookingDate: 'Booking Date',
    bookingTime: 'Booking Time',
    bookingStatus: 'Booking Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // News
    news: 'News',
    latestNews: 'Latest News',
    breakingNews: 'Breaking News',
    featuredNews: 'Featured News',
    newsCategories: 'News Categories',
    readMore: 'Read More',
    publishedAt: 'Published At',
    author: 'Author',
    views: 'Views',
    likes: 'Likes',
    shares: 'Shares',
    
    // Dashboard
    statistics: 'Statistics',
    totalBookings: 'Total Bookings',
    todayBookings: 'Today\'s Bookings',
    monthlyRevenue: 'Monthly Revenue',
    totalRevenue: 'Total Revenue',
    activeServices: 'Active Services',
    conversionRate: 'Conversion Rate',
    averageRating: 'Average Rating',
    totalReviews: 'Total Reviews',
    growthRate: 'Growth Rate',
    
    // Messages
    messages: 'Messages',
    sendMessage: 'Send Message',
    message: 'Message',
    newMessage: 'New Message',
    unreadMessages: 'Unread Messages',
    conversation: 'Conversation',
    
    // Notifications
    notifications: 'Notifications',
    unreadNotifications: 'Unread Notifications',
    markAsRead: 'Mark as Read',
    markAllAsRead: 'Mark All as Read',
    
    // Forms
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    address: 'Address',
    city: 'City',
    country: 'Country',
    website: 'Website',
    bio: 'Bio',
    
    // Time
    now: 'Now',
    minutesAgo: '{count} minutes ago',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    online: 'Online',
    offline: 'Offline',
    available: 'Available',
    unavailable: 'Unavailable',
    
    // Actions
    like: 'Like',
    share: 'Share',
    comment: 'Comment',
    follow: 'Follow',
    unfollow: 'Unfollow',
    report: 'Report',
    block: 'Block',
    
    // Validation
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    passwordTooShort: 'Password is too short',
    passwordsDoNotMatch: 'Passwords do not match',
    
    // Categories
    haircut: 'Haircut',
    hairStyling: 'Hair Styling',
    hairColoring: 'Hair Coloring',
    manicure: 'Manicure',
    pedicure: 'Pedicure',
    facial: 'Facial',
    massage: 'Massage',
    consultation: 'Consultation',
    treatment: 'Treatment',
    training: 'Training',
    other: 'Other',
    
    // Business Categories
    clinic: 'Clinic',
    salon: 'Beauty Salon',
    spa: 'Spa',
    gym: 'Gym',
    restaurant: 'Restaurant',
    education: 'Education',
    
    // News Categories
    general: 'General',
    business: 'Business',
    health: 'Health',
    beauty: 'Beauty',
    technology: 'Technology',
    lifestyle: 'Lifestyle',
    promotions: 'Promotions',
    announcements: 'Announcements',
    
    // Search
    all: 'All',
    businesses: 'Businesses',
    viewAllResults: 'View All Results',
    noResultsFound: 'No results found',
    tryDifferentKeywords: 'Try different keywords',
    
    // Social Sharing
    share: 'Share',
    shareVia: 'Share via',
    linkCopied: 'Link copied',
    contentCopied: 'Content copied',
    copyFailed: 'Failed to copy',
    shareFailed: 'Failed to share',
    copied: 'Copied',
    email: 'Email',
    sms: 'SMS',
    
    // Time Ranges
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    last90Days: 'Last 90 days',
    lastYear: 'Last year',
    
    // Additional terms
    total: 'Total',
    customer: 'Customer',
    activeServices: 'Active Services',
    amountPaid: 'Amount Paid',
    thisMonth: 'This Month',
    performance: 'Performance',
    bookingGrowth: 'Booking Growth',
    averageBooking: 'Average Booking',
    today: 'Today',
    myBookings: 'My Bookings',
    bookingStatus: 'Booking Status'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'ar';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction and language
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Update body class for styling
    document.body.className = document.body.className.replace(/lang-\w+/g, '');
    document.body.classList.add(`lang-${language}`);
  }, [language]);

  const t = (key, params = {}) => {
    let translation = translations[language]?.[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  const switchLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const isRTL = language === 'ar';

  const value = {
    language,
    setLanguage: switchLanguage,
    t,
    isRTL,
    translations: translations[language] || {}
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
