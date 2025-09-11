import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../stores/authStore';
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data, event) => {
    // Explicitly prevent default form submission
    if (event) {
      event.preventDefault();
    }
    
    try {
      console.log('🔍 Attempting login with:', data);
      console.log('🌐 Current API URL:', window.getApiUrl ? window.getApiUrl() : 'Not available');
      
      const result = await login(data);
      console.log('✅ Login result:', result);
      
      toast.success('تم تسجيل الدخول بنجاح');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // More specific error messages
      if (error.response?.status === 401) {
        toast.error('بيانات الدخول غير صحيحة');
      } else if (error.response?.status === 500) {
        toast.error('خطأ في الخادم، يرجى المحاولة لاحقاً');
      } else if (error.message.includes('Network Error')) {
        toast.error('خطأ في الاتصال، تأكد من اتصالك بالإنترنت');
      } else {
        toast.error(error.message || 'حدث خطأ في تسجيل الدخول');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="animate-fade-in-up">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <h2 className="mt-8 text-center text-4xl font-bold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            أو{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200 underline decoration-2 underline-offset-4"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="form-label group-hover:text-primary-600 transition-colors duration-200">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input pr-12 ${errors.email ? 'input-error' : 'group-hover:border-primary-300'} transition-all duration-300`}
                  placeholder="أدخل بريدك الإلكتروني"
                  {...register('email', {
                    required: 'البريد الإلكتروني مطلوب',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'البريد الإلكتروني غير صحيح',
                    },
                  })}
                />
                <div className="absolute inset-y-0 left-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="form-error animate-fade-in-up">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="form-label group-hover:text-primary-600 transition-colors duration-200">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-12 ${errors.password ? 'input-error' : 'group-hover:border-primary-300'} transition-all duration-300`}
                  placeholder="أدخل كلمة المرور"
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: {
                      value: 6,
                      message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pr-3 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error animate-fade-in-up">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all duration-200 group-hover:border-primary-400"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                تذكرني
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 underline decoration-1 underline-offset-4"
                onClick={() => alert('نسيت كلمة المرور - سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-primary hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? (
                <div className="spinner-lg"></div>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <SparklesIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </form>

        {/* Social Login */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 text-gray-500 font-medium">أو</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="mr-2">Google</span>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956-.925-1.956-1.874v-3.23h3.906l-.447 3.47h-3.46v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="mr-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
