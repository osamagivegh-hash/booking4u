import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getServiceImage, handleImageError } from '../../utils/imageUtils';

const BookingPage = () => {
  const { businessId, serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [service, setService] = useState(null);
  const [business, setBusiness] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (serviceId && businessId) {
      fetchServiceDetails();
    }
  }, [serviceId, businessId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      
      // Ensure businessId and serviceId are strings
      const businessIdStr = String(businessId || '');
      const serviceIdStr = String(serviceId || '');
      
      // Validate that we have valid IDs
      if (!businessIdStr || businessIdStr === 'undefined' || businessIdStr === 'null') {
        throw new Error('Invalid business ID');
      }
      if (!serviceIdStr || serviceIdStr === 'undefined' || serviceIdStr === 'null') {
        throw new Error('Invalid service ID');
      }
      
      console.log('Fetching service details for booking:', { businessId: businessIdStr, serviceId: serviceIdStr });
      
      // Fetch service details
      const serviceResponse = await api.get(`/services/${businessIdStr}/${serviceIdStr}`);
      if (serviceResponse.data.success) {
        setService(serviceResponse.data.data);
        setBusiness(serviceResponse.data.data.businessId);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast.error('حدث خطأ في جلب تفاصيل الخدمة');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    
    try {
      const businessIdStr = String(businessId || '');
      const serviceIdStr = String(serviceId || '');
      
      if (!businessIdStr || !serviceIdStr) {
        throw new Error('Invalid IDs for fetching slots');
      }
      
      const response = await api.get(`/bookings/available-slots/${businessIdStr}/${serviceIdStr}?date=${date}`);
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('حدث خطأ في جلب الأوقات المتاحة');
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    fetchAvailableSlots(date);
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/auth/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('يرجى اختيار التاريخ والوقت');
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        businessId: String(businessId || ''),
        serviceId: String(serviceId || ''),
        date: selectedDate,
        startTime: selectedTime,
        notes: {
          customer: notes
        }
      };

      const response = await api.post('/bookings', bookingData);
      
      if (response.data.success) {
        toast.success('تم حجز الموعد بنجاح!');
        navigate('/dashboard/bookings');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في حجز الموعد');
    } finally {
      setBookingLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'haircut': 'قص شعر',
      'hair_styling': 'تصفيف شعر',
      'hair_coloring': 'صبغ شعر',
      'manicure': 'منيكير',
      'pedicure': 'بديكير',
      'facial': 'تنظيف بشرة',
      'massage': 'مساج',
      'consultation': 'استشارة',
      'treatment': 'علاج',
      'training': 'تدريب',
      'other': 'أخرى'
    };
    return categories[category] || category;
  };

  const formatTime = (time) => {
    return time.slice(0, 5); // Remove seconds if present
  };

  const getNextAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!service || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الخدمة غير موجودة</h2>
          <button
            onClick={() => navigate('/services')}
            className="btn btn-primary"
          >
            العودة للخدمات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/services')}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← العودة للخدمات
          </button>
          <h1 className="text-3xl font-bold text-gray-900">حجز موعد</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start space-x-4 space-x-reverse">
                <img
                  src={getServiceImage(service)}
                  alt={service.name || 'Service Image'}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => handleImageError(e, '/default-service-image.svg')}
                />
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h2>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 ml-1" />
                      {service.duration} دقيقة
                    </span>
                    <span className="flex items-center">
                      <span className="ml-1">💰</span>
                      {service.price} ريال
                    </span>
                    <span className="flex items-center">
                      <span className="ml-1">🏷️</span>
                      {getCategoryLabel(service.category)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النشاط التجاري</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 ml-3" />
                  <span className="text-gray-900">{business.name}</span>
                </div>
                
                {business.address && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 ml-3" />
                    <span className="text-gray-600">{business.address}</span>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 ml-3" />
                    <span className="text-gray-600">{business.phone}</span>
                  </div>
                )}
                
                {business.rating && (
                  <div className="flex items-center">
                    <StarIconSolid className="h-5 w-5 text-yellow-400 ml-3" />
                    <span className="text-gray-600">{business.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">حجز الموعد</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر التاريخ
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">اختر التاريخ</option>
                  {getNextAvailableDates().map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('ar-SA')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختر الوقت
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          onClick={() => setSelectedTime(slot.startTime)}
                          className={`p-2 text-sm border rounded-md transition-colors ${
                            selectedTime === slot.startTime
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">لا توجد أوقات متاحة في هذا التاريخ</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="أي ملاحظات خاصة..."
                />
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">ملخص الحجز</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>الخدمة: {service.name}</p>
                    <p>التاريخ: {new Date(selectedDate).toLocaleDateString('ar-SA')}</p>
                    <p>الوقت: {formatTime(selectedTime)}</p>
                    <p>المدة: {service.duration} دقيقة</p>
                    <p className="font-medium text-gray-900">السعر: {service.price} ريال</p>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || bookingLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bookingLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
              </button>

              {!user && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  يجب تسجيل الدخول لحجز موعد
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
