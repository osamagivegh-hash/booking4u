import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const fetchBusinessAndServices = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get business data
      const businessResponse = await api.get('/businesses/for-service');
      if (businessResponse.data && businessResponse.data.success) {
        setBusiness(businessResponse.data.data);
        
        // Get services for this business (including inactive ones for management)
        const servicesResponse = await api.get(`/services/${businessResponse.data.data._id}?showAll=true`);
        if (servicesResponse.data && servicesResponse.data.success) {
          setServices(servicesResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        toast.error('يجب إنشاء نشاط تجاري أولاً');
        navigate('/dashboard/business/create');
      } else {
        toast.error('حدث خطأ في جلب البيانات');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBusinessAndServices();
  }, [fetchBusinessAndServices]);

  const handleEditService = (service) => {
    setEditingService(service);
    setValue('name', service.name);
    setValue('description', service.description);
    setValue('price', service.price);
    setValue('duration', service.duration);
    setValue('category', service.category);
    setValue('isActive', service.isActive);
    setShowEditForm(true);
  };

  const handleUpdateService = async (data) => {
    try {
      const response = await api.put(`/services/${editingService._id}`, data);
      
      if (response.data && response.data.success) {
        toast.success('تم تحديث الخدمة بنجاح');
        setShowEditForm(false);
        setEditingService(null);
        reset();
        fetchBusinessAndServices(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في تحديث الخدمة');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('هل أنت متأكد من إلغاء تفعيل هذه الخدمة؟ يمكنك إعادة تفعيلها لاحقاً.')) {
      try {
        const response = await api.delete(`/services/${serviceId}`);
        
        if (response.data && response.data.success) {
          toast.success('تم إلغاء تفعيل الخدمة بنجاح');
          fetchBusinessAndServices(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error(error.response?.data?.message || 'حدث خطأ في حذف الخدمة');
      }
    }
  };

  const handleToggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const response = await api.put(`/services/${serviceId}`, {
        isActive: !currentStatus
      });
      
      if (response.data && response.data.success) {
        toast.success(`تم ${!currentStatus ? 'إعادة تفعيل' : 'إلغاء تفعيل'} الخدمة بنجاح`);
        fetchBusinessAndServices(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في تغيير حالة الخدمة');
    }
  };

  const categories = [
    { value: 'haircut', label: 'قص شعر' },
    { value: 'hair_styling', label: 'تصفيف شعر' },
    { value: 'hair_coloring', label: 'صبغ شعر' },
    { value: 'manicure', label: 'منيكير' },
    { value: 'pedicure', label: 'بديكير' },
    { value: 'facial', label: 'تنظيف بشرة' },
    { value: 'massage', label: 'مساج' },
    { value: 'consultation', label: 'استشارة' },
    { value: 'treatment', label: 'علاج' },
    { value: 'training', label: 'تدريب' },
    { value: 'other', label: 'أخرى' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">يجب إنشاء نشاط تجاري أولاً</h1>
            <p className="text-gray-600 mb-8">لإدارة الخدمات، يجب عليك إنشاء نشاط تجاري أولاً</p>
            <button
              onClick={() => navigate('/dashboard/business/create')}
              className="btn btn-primary"
            >
              إنشاء نشاط تجاري
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الخدمات</h1>
              <p className="text-gray-600 mt-2">إدارة خدمات {business.name}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/services/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة خدمة جديدة
            </button>
          </div>
        </div>

        {/* Edit Service Form */}
        {showEditForm && editingService && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">تعديل الخدمة</h2>
            <form onSubmit={handleSubmit(handleUpdateService)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-name" className="form-label">اسم الخدمة *</label>
                  <input
                    id="edit-name"
                    type="text"
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    {...register('name', {
                      required: 'اسم الخدمة مطلوب',
                      minLength: {
                        value: 3,
                        message: 'اسم الخدمة يجب أن يكون 3 أحرف على الأقل'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-category" className="form-label">الفئة *</label>
                  <select
                    id="edit-category"
                    className={`input ${errors.category ? 'input-error' : ''}`}
                    {...register('category', {
                      required: 'الفئة مطلوبة'
                    })}
                  >
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
              </div>

              <div>
                <label htmlFor="edit-description" className="form-label">وصف الخدمة *</label>
                <textarea
                  id="edit-description"
                  rows="4"
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  {...register('description', {
                    required: 'وصف الخدمة مطلوب',
                    minLength: {
                      value: 10,
                      message: 'وصف الخدمة يجب أن يكون 10 أحرف على الأقل'
                    }
                  })}
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="edit-price" className="form-label">السعر (ريال) *</label>
                  <input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className={`input ${errors.price ? 'input-error' : ''}`}
                    {...register('price', {
                      required: 'السعر مطلوب',
                      min: {
                        value: 0,
                        message: 'السعر يجب أن يكون أكبر من صفر'
                      }
                    })}
                  />
                  {errors.price && (
                    <p className="form-error">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-duration" className="form-label">المدة (دقيقة) *</label>
                  <input
                    id="edit-duration"
                    type="number"
                    min="15"
                    max="480"
                    className={`input ${errors.duration ? 'input-error' : ''}`}
                    {...register('duration', {
                      required: 'المدة مطلوبة',
                      min: {
                        value: 15,
                        message: 'المدة يجب أن تكون 15 دقيقة على الأقل'
                      },
                      max: {
                        value: 480,
                        message: 'المدة لا يمكن أن تتجاوز 8 ساعات'
                      }
                    })}
                  />
                  {errors.duration && (
                    <p className="form-error">{errors.duration.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="edit-isActive"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('isActive')}
                  />
                  <label htmlFor="edit-isActive" className="mr-2 block text-sm text-gray-900">
                    تفعيل الخدمة
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingService(null);
                    reset();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">الخدمات المتاحة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الخدمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className={`hover:bg-gray-50 ${!service.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {service.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categories.find(cat => cat.value === service.category)?.label || service.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.price} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.duration} دقيقة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleServiceStatus(service._id, service.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {service.isActive ? 'نشط' : 'محذوف'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-900"
                          title="تعديل"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:text-red-900"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد خدمات متاحة</p>
              <button
                onClick={() => navigate('/dashboard/services/add')}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                إضافة خدمة جديدة
              </button>
            </div>
          )}
          
          {services.length > 0 && services.every(service => !service.isActive) && (
            <div className="text-center py-4 bg-yellow-50 border-t border-yellow-200">
              <p className="text-yellow-700 text-sm">
                جميع الخدمات معطلة. يمكنك إعادة تفعيلها بالنقر على حالة الخدمة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
