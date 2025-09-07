import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const EditBusinessPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Fetch business data when component mounts
  useEffect(() => {
    // Check if user has business role
    if (user && user.role !== 'business') {
      toast.error('هذه الصفحة مخصصة للتجار فقط');
      navigate('/dashboard');
      return;
    }
    
    if (user && user.role === 'business') {
      fetchBusinessData();
    }
  }, [user, navigate]);

  const fetchBusinessData = async () => {
    try {
      const response = await api.get('/businesses/check-business');
      if (response.data && response.data.success) {
                  if (response.data.hasBusiness) {
            setBusiness(response.data.data);
            // Pre-fill form with existing data
            setValue('name', response.data.data.name);
            setValue('description', response.data.data.description || '');
            setValue('category', response.data.data.category);
            setValue('phone', response.data.data.phone);
            setValue('email', response.data.data.email);
            setValue('street', response.data.data.address?.street || '');
            setValue('city', response.data.data.address?.city || '');
            setValue('state', response.data.data.address?.state || '');
            setValue('zipCode', response.data.data.address?.zipCode || '');
          } else {
          toast.error('لا يوجد نشاط تجاري مسجل');
          navigate('/dashboard/business/create');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      if (error.response?.status === 404) {
        toast.error('لا يوجد نشاط تجاري مسجل');
        navigate('/dashboard/business/create');
        return;
      }
      toast.error('حدث خطأ في جلب بيانات النشاط التجاري');
    }
  };

  // If user is not business, show helpful message
  if (!user || user.role !== 'business') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              هذه الصفحة مخصصة للتجار فقط
            </h2>
            <p className="text-gray-600 mb-4">
              دورك الحالي: <span className="font-semibold">{user?.role === 'customer' ? 'عميل' : user?.role || 'غير محدد'}</span>
            </p>
            <p className="text-gray-600 mb-6">
              إذا كنت تاجراً وتريد الوصول لهذه الصفحة، يرجى التواصل مع الإدارة لتغيير دورك.
            </p>
            <div className="space-x-3 space-x-reverse">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                العودة للداشبورد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const businessData = {
        name: data.name,
        description: data.description,
        category: data.category,
        phone: data.phone,
        email: data.email,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        }
      };

      const response = await api.put(`/businesses/${business._id}`, businessData);

      if (response.data && response.data.success) {
        toast.success('تم تحديث النشاط التجاري بنجاح');
        setBusiness(response.data.data);
        setIsEditing(false);
        fetchBusinessData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating business:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('حدث خطأ في تحديث النشاط التجاري');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'clinic', label: 'عيادة' },
    { value: 'salon', label: 'صالون تجميل' },
    { value: 'spa', label: 'سبا' },
    { value: 'gym', label: 'صالة رياضية' },
    { value: 'restaurant', label: 'مطعم' },
    { value: 'consultation', label: 'استشارات' },
    { value: 'education', label: 'تعليم' },
    { value: 'other', label: 'أخرى' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">معلومات النشاط التجاري</h1>
              <p className="text-gray-600 mt-2">عرض وتعديل معلومات نشاطك التجاري</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PencilIcon className="h-4 w-4 ml-2" />
              {isEditing ? 'إلغاء التعديل' : 'تعديل'}
            </button>
          </div>
        </div>

        {/* Business Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="mr-4">
              <h2 className="text-xl font-semibold text-gray-900">{business.name}</h2>
              <p className="text-gray-600">{business.category}</p>
            </div>
          </div>
          
          {business.description && (
            <p className="text-gray-700 mb-4">{business.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
              <span className="text-gray-700">{business.phone}</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="h-4 w-4 text-gray-400 ml-2" />
              <span className="text-gray-700">{business.email}</span>
            </div>
            {business.address?.city && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-gray-400 ml-2" />
                <span className="text-gray-700">{business.address.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Name */}
              <div>
                <label htmlFor="name" className="form-label">
                  اسم النشاط التجاري *
                </label>
                <input
                  id="name"
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="أدخل اسم النشاط التجاري"
                  {...register('name', {
                    required: 'اسم النشاط التجاري مطلوب',
                    minLength: {
                      value: 2,
                      message: 'اسم النشاط التجاري يجب أن يكون 2 أحرف على الأقل'
                    },
                    maxLength: {
                      value: 100,
                      message: 'اسم النشاط التجاري لا يمكن أن يتجاوز 100 حرف'
                    }
                  })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="form-label">
                  وصف النشاط التجاري
                </label>
                <textarea
                  id="description"
                  rows="4"
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  placeholder="أدخل وصف مفصل للنشاط التجاري"
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'الوصف لا يمكن أن يتجاوز 500 حرف'
                    }
                  })}
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="form-label">
                  فئة النشاط التجاري *
                </label>
                <select
                  id="category"
                  className={`input ${errors.category ? 'input-error' : ''}`}
                  {...register('category', {
                    required: 'فئة النشاط التجاري مطلوبة'
                  })}
                >
                  <option value="">اختر فئة النشاط التجاري</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="form-error">{errors.category.message}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="form-label">
                    رقم الهاتف *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={`input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="05xxxxxxxx"
                    {...register('phone', {
                      required: 'رقم الهاتف مطلوب',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'يرجى إدخال رقم هاتف صحيح'
                      }
                    })}
                  />
                  {errors.phone && (
                    <p className="form-error">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    البريد الإلكتروني *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="example@email.com"
                    {...register('email', {
                      required: 'البريد الإلكتروني مطلوب',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'يرجى إدخال بريد إلكتروني صحيح'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPinIcon className="h-5 w-5 ml-2 text-gray-500" />
                  العنوان
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="street" className="form-label">
                      الشارع
                    </label>
                    <input
                      id="street"
                      type="text"
                      className={`input ${errors.street ? 'input-error' : ''}`}
                      placeholder="اسم الشارع"
                      {...register('street')}
                    />
                    {errors.street && (
                      <p className="form-error">{errors.street.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="form-label">
                      المدينة *
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`input ${errors.city ? 'input-error' : ''}`}
                      placeholder="اسم المدينة"
                      {...register('city', {
                        required: 'المدينة مطلوبة'
                      })}
                    />
                    {errors.city && (
                      <p className="form-error">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="state" className="form-label">
                      المنطقة/المنطقة
                    </label>
                    <input
                      id="state"
                      type="text"
                      className={`input ${errors.state ? 'input-error' : ''}`}
                      placeholder="اسم المنطقة"
                      {...register('state')}
                    />
                    {errors.state && (
                      <p className="form-error">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="form-label">
                      الرمز البريدي
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      className={`input ${errors.zipCode ? 'input-error' : ''}`}
                      placeholder="الرمز البريدي"
                      {...register('zipCode')}
                    />
                    {errors.zipCode && (
                      <p className="form-error">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التغييرات'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/dashboard/services/add')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <BuildingOfficeIcon className="h-5 w-5 ml-2" />
            إضافة خدمة جديدة
          </button>
          <button
            onClick={() => navigate('/dashboard/business')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            العودة للداشبورد
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBusinessPage;
