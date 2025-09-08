import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  UserIcon, 
  CogIcon, 
  CalendarIcon, 
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Add a small delay to prevent rapid re-renders
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading while initializing or loading
  if (isInitializing || isLoading) {
    return <LoadingSpinner message="جاري تحميل لوحة التحكم..." />;
  }

  console.log('🔍 DashboardPage: Auth state:', { isAuthenticated, user });

  if (!isAuthenticated) {
    console.log('🔍 DashboardPage: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user?.role === 'business') {
    console.log('🔍 DashboardPage: Business user, redirecting to business dashboard');
    return <Navigate to="/dashboard/business" replace />;
  } else if (user?.role === 'customer') {
    console.log('🔍 DashboardPage: Customer user, redirecting to customer dashboard');
    return <Navigate to="/dashboard/customer" replace />;
  } else {
    console.log('🔍 DashboardPage: Unknown role, showing default dashboard');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl mb-6 shadow-xl">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                مرحباً، {user?.name}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                دور المستخدم: {user?.role || 'غير محدد'}
              </p>
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                <SparklesIcon className="h-4 w-4" />
                <span>اختر نوع لوحة التحكم المناسبة لك</span>
              </div>
            </div>

            {/* Dashboard Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Business Dashboard */}
              <div className="group">
                <a 
                  href="/dashboard/business" 
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200/50"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <CogIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      لوحة تحكم صاحب العمل
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      إدارة الخدمات والحجوزات والعملاء. تتبع الإحصائيات والأداء.
                    </p>
                    <div className="inline-flex items-center space-x-2 space-x-reverse text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                      <span>ابدأ الإدارة</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>

              {/* Customer Dashboard */}
              <div className="group">
                <a 
                  href="/dashboard/customer" 
                  className="block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200/50"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <CalendarIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                      لوحة تحكم العميل
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      عرض الحجوزات وإدارة المواعيد. تتبع التاريخ والتفاصيل.
                    </p>
                    <div className="inline-flex items-center space-x-2 space-x-reverse text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-300">
                      <span>عرض الحجوزات</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 mr-2 text-primary-600" />
                  إحصائيات سريعة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient-primary mb-2">0</div>
                    <div className="text-gray-600">إجمالي الحجوزات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient-success mb-2">0</div>
                    <div className="text-gray-600">الحجوزات المكتملة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient-warning mb-2">0</div>
                    <div className="text-gray-600">الحجوزات المعلقة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient-danger mb-2">0</div>
                    <div className="text-gray-600">الحجوزات الملغاة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <p className="text-gray-500 text-sm">
                تحتاج مساعدة؟{' '}
                <a href="/help" className="text-primary-600 hover:text-primary-700 font-medium underline decoration-1 underline-offset-4 transition-colors duration-200">
                  تواصل مع الدعم
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default DashboardPage;
