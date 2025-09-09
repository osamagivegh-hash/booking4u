import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AddServicePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageAlts, setImageAlts] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    // Check if user is authenticated and has business role
    if (!user) {
      navigate('/auth/login');
      return;
    }

    fetchBusinessData();
  }, [user, navigate]);

  const fetchBusinessData = async () => {
    try {
      setBusinessLoading(true);
      const response = await api.get('/businesses/for-service');
      
      if (response.data && response.data.success) {
        setBusiness(response.data.data);
        console.log('Business data loaded for service creation:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      if (error.response?.status === 404) {
        toast.error('يجب إنشاء نشاط تجاري أولاً قبل إضافة الخدمات');
        navigate('/dashboard/business/create');
      } else {
        toast.error('حدث خطأ في جلب بيانات النشاط التجاري');
        navigate('/dashboard/business');
      }
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    
    if (files.length + selectedImages.length > maxFiles) {
      toast.error(`يمكن رفع ${maxFiles} صور كحد أقصى`);
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('يُسمح بملفات الصور فقط');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
        setImageAlts(prev => [...prev, '']);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageAlts(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageAlt = (index, alt) => {
    setImageAlts(prev => prev.map((item, i) => i === index ? alt : item));
  };

  const onSubmit = async (data) => {
    if (!business) {
      toast.error('يجب إنشاء نشاط تجاري أولاً');
      navigate('/dashboard/business/create');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add service data
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', parseFloat(data.price));
      formData.append('duration', parseInt(data.duration));
      formData.append('category', data.category);
      formData.append('isActive', data.isActive || true);

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append('serviceImages', image.file);
        if (imageAlts[index]) {
          formData.append('imageAlts', imageAlts[index]);
        }
      });

      console.log('Creating service for business:', business._id);
      console.log('Service data:', data);
      console.log('Images count:', selectedImages.length);

      const response = await api.post('/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('تم إضافة الخدمة بنجاح');
      reset();
      setSelectedImages([]);
      setImageAlts([]);
      
      // Navigate based on user role
      if (user?.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/business');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في إضافة الخدمة');
    } finally {
      setLoading(false);
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

  // Show loading while checking business
  if (businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error if no business found
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">يجب إنشاء نشاط تجاري أولاً</h1>
            <p className="text-gray-600 mb-8">لإضافة خدمات، يجب عليك إنشاء نشاط تجاري أولاً</p>
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
          <h1 className="text-3xl font-bold text-gray-900">إضافة خدمة جديدة</h1>
          <p className="text-gray-600 mt-2">أضف خدمة جديدة إلى {business.name}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Name */}
            <div>
              <label htmlFor="name" className="form-label">
                اسم الخدمة *
              </label>
              <input
                id="name"
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="أدخل اسم الخدمة"
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="form-label">
                وصف الخدمة *
              </label>
              <textarea
                id="description"
                rows="4"
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="أدخل وصف مفصل للخدمة"
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

            {/* Price and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="form-label">
                  السعر (ريال) *
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0.00"
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
                <label htmlFor="duration" className="form-label">
                  المدة (دقيقة) *
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  className={`input ${errors.duration ? 'input-error' : ''}`}
                  placeholder="60"
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
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="form-label">
                الفئة *
              </label>
              <select
                id="category"
                className={`input ${errors.category ? 'input-error' : ''}`}
                {...register('category', {
                  required: 'الفئة مطلوبة'
                })}
              >
                <option value="">اختر فئة الخدمة</option>
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

            {/* Image Upload */}
            <div>
              <label className="form-label">
                صور الخدمة (اختياري)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>رفع صور</span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="sr-only"
                      />
                    </label>
                    <p className="pr-1">أو اسحب وأفلت</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF حتى 5 ميجابايت (حد أقصى 5 صور)
                  </p>
                </div>
              </div>

              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">الصور المحددة:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {selectedImages.map((image, index) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/default-service-image.svg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <input
                          type="text"
                          placeholder="وصف الصورة (اختياري)"
                          value={imageAlts[index] || ''}
                          onChange={(e) => updateImageAlt(index, e.target.value)}
                          className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>



            {/* Active Status */}
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
                {...register('isActive')}
              />
              <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                تفعيل الخدمة فوراً
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 ml-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    إضافة الخدمة
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddServicePage;

