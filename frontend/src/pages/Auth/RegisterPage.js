import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../stores/authStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'customer'
    }
  });

  const password = watch('password');

  // Watch all form values for state preservation
  const watchedValues = watch();

  // Restore form state on component mount
  useEffect(() => {
    const formId = 'register-form';

    // Try to restore form state from sessionStorage
    try {
      const savedState = sessionStorage.getItem(`form-state-${formId}`);
      if (savedState) {
        const formData = JSON.parse(savedState);

        // Restore form values using react-hook-form setValue
        Object.entries(formData).forEach(([name, value]) => {
          if (name && value !== undefined && value !== null) {
            setValue(name, value);
          }
        });

        console.log('🔧 Registration form state restored:', formData);
      }
    } catch (error) {
      console.warn('Could not restore form state:', error);
    }
  }, [setValue]);

  // Save form state on changes
  useEffect(() => {
    const formId = 'register-form';

    // Only save if there are actual values (not just default empty values)
    const hasValues = Object.values(watchedValues).some(value =>
      value !== undefined && value !== null && value !== ''
    );

    if (hasValues) {
      try {
        sessionStorage.setItem(`form-state-${formId}`, JSON.stringify(watchedValues));
        console.log('🔧 Form state saved:', watchedValues);
      } catch (error) {
        console.warn('Could not save form state:', error);
      }
    }
  }, [watchedValues]);

  const onSubmit = async (data, event) => {
    // Explicitly prevent default form submission
    if (event) {
      event.preventDefault();
    }

    try {
      await registerUser(data);

      // Clear form state after successful registration
      sessionStorage.removeItem('form-state-register-form');

      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Handle different types of errors
      if (error.response?.status === 422) {
        // Validation errors from backend
        const validationErrors = error.response.data.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach(err => {
            toast.error(err.message || 'بيانات غير صحيحة');
          });
        } else {
          toast.error(error.response.data.message || 'بيانات غير صحيحة');
        }
      } else if (error.response?.status === 409) {
        // Conflict error (email already exists)
        toast.error('البريد الإلكتروني مسجل مسبقاً');
      } else if (error.response?.status === 500) {
        toast.error('خطأ في الخادم، يرجى المحاولة لاحقاً');
      } else if (error.message.includes('Network Error')) {
        toast.error('خطأ في الاتصال، تأكد من اتصالك بالإنترنت');
      } else {
        // Generic error
        toast.error(error.message || 'حدث خطأ في إنشاء الحساب');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أو{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              تسجيل الدخول إلى حسابك
            </Link>
          </p>
        </div>

        <form id="register-form" className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="form-label">
                الاسم الكامل
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="أدخل اسمك الكامل"
                {...register('name', {
                  required: 'الاسم مطلوب',
                  minLength: {
                    value: 2,
                    message: 'الاسم يجب أن يكون حرفين على الأقل',
                  },
                  maxLength: {
                    value: 50,
                    message: 'الاسم لا يمكن أن يتجاوز 50 حرف',
                  },
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="أدخل بريدك الإلكتروني"
                {...register('email', {
                  required: 'البريد الإلكتروني مطلوب',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'البريد الإلكتروني غير صحيح',
                  },
                })}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="form-label">
                رقم الهاتف
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={`input ${errors.phone ? 'input-error' : ''}`}
                placeholder="أدخل رقم هاتفك"
                {...register('phone', {
                  required: 'رقم الهاتف مطلوب',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'رقم الهاتف غير صحيح',
                  },
                })}
              />
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="form-label">
                نوع الحساب
              </label>
              <select
                id="role"
                className={`input ${errors.role ? 'input-error' : ''}`}
                {...register('role', {
                  required: 'نوع الحساب مطلوب',
                })}
              >
                <option value="">اختر نوع الحساب</option>
                <option value="customer">عميل</option>
                <option value="business">صاحب نشاط تجاري</option>
              </select>
              {errors.role && (
                <p className="form-error">{errors.role.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
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
                  className="absolute inset-y-0 left-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="أعد إدخال كلمة المرور"
                  {...register('confirmPassword', {
                    required: 'تأكيد كلمة المرور مطلوب',
                    validate: (value) =>
                      value === password || 'كلمة المرور غير متطابقة',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register('agreeTerms', {
                required: 'يجب الموافقة على الشروط والأحكام',
              })}
            />
            <label htmlFor="agree-terms" className="mr-2 block text-sm text-gray-900">
              أوافق على{' '}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-500 underline"
                onClick={() => alert('الشروط والأحكام - سيتم فتح صفحة الشروط والأحكام')}
              >
                الشروط والأحكام
              </button>{' '}
              و{' '}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-500 underline"
                onClick={() => alert('سياسة الخصوصية - سيتم فتح صفحة سياسة الخصوصية')}
              >
                سياسة الخصوصية
              </button>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="form-error">{errors.agreeTerms.message}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="spinner h-5 w-5"></div>
              ) : (
                'إنشاء الحساب'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </form>

        {/* Social Register */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">أو</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956-.925-1.956-1.874v-3.23h3.906l-.447 3.47h-3.46v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="mr-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
