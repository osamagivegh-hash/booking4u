import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/bookings/my-bookings${params}`);
      
      console.log('📋 MyBookingsPage - API Response:', response.data);
      
      if (response.data && response.data.success) {
        const bookingsData = response.data.data || [];
        console.log('📋 MyBookingsPage - Bookings data:', bookingsData);
        setBookings(bookingsData);
      } else {
        console.warn('📋 MyBookingsPage - Invalid response format:', response.data);
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ MyBookingsPage - Error fetching bookings:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'حدث خطأ في جلب الحجوزات';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'يجب تسجيل الدخول أولاً';
      } else if (error.response?.status === 500) {
        errorMessage = 'خطأ في الخادم، يرجى المحاولة مرة أخرى';
      }
      
      toast.error(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
      return;
    }

    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'إلغاء من قبل العميل'
      });
      
      if (response.data.success) {
        toast.success('تم إلغاء الحجز بنجاح');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في إلغاء الحجز');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'cancelled':
        return 'ملغي';
      case 'completed':
        return 'مكتمل';
      case 'no_show':
        return 'لم يحضر';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'confirmed':
        return <CheckIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckIcon className="h-4 w-4" />;
      case 'no_show':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const canCancel = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
    
    return booking.status === 'pending' || booking.status === 'confirmed' && hoursUntilBooking > 24;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يجب تسجيل الدخول</h2>
          <button
            onClick={() => navigate('/auth/login')}
            className="btn btn-primary"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">حجوزاتي</h1>
          <p className="text-gray-600 mt-2">إدارة حجوزاتك ومواعيدك</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              جميع الحجوزات
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              في الانتظار
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              مؤكدة
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              مكتملة
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ملغية
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="mr-3 text-gray-600">جاري تحميل الحجوزات...</span>
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'لم تقم بحجز أي مواعيد بعد'
                : `لا توجد حجوزات بحالة "${getStatusLabel(filter)}"`
              }
            </p>
            <button
              onClick={() => navigate('/services')}
              className="btn btn-primary"
            >
              تصفح الخدمات
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings && bookings.length > 0 ? bookings.map((booking) => {
              // Safety check for booking data
              if (!booking || !booking._id) {
                console.warn('📋 MyBookingsPage - Invalid booking data:', booking);
                return null;
              }
              
              return (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.serviceId?.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="mr-1">{getStatusLabel(booking.status)}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 ml-2" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 ml-2" />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="ml-2">💰</span>
                        <span>{booking.totalPrice} {booking.currency}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="ml-2">⏱️</span>
                        <span>{booking.serviceId?.duration} دقيقة</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="ml-2">🏢</span>
                        <span>{booking.businessId?.name}</span>
                      </div>
                      
                      {booking.businessId?.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 ml-2" />
                          <span>{booking.businessId.address}</span>
                        </div>
                      )}
                      
                      {booking.businessId?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 ml-2" />
                          <span>{booking.businessId.phone}</span>
                        </div>
                      )}
                    </div>

                    {booking.notes?.customer && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">ملاحظاتك:</span> {booking.notes.customer}
                        </p>
                      </div>
                    )}

                    {booking.notes?.business && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">ملاحظات النشاط التجاري:</span> {booking.notes.business}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 ml-2" />
                      التفاصيل
                    </button>
                    
                    {canCancel(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <XMarkIcon className="h-4 w-4 ml-2" />
                        إلغاء
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            }).filter(Boolean) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
                <p className="text-gray-500 mb-6">لم تقم بحجز أي مواعيد بعد</p>
                <button
                  onClick={() => navigate('/services')}
                  className="btn btn-primary"
                >
                  تصفح الخدمات
                </button>
              </div>
            )}
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">تفاصيل الحجز</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">الخدمة</h4>
                    <p className="text-gray-600">{selectedBooking.serviceId?.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">التاريخ والوقت</h4>
                    <p className="text-gray-600">
                      {formatDate(selectedBooking.date)} في {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">النشاط التجاري</h4>
                    <p className="text-gray-600">{selectedBooking.businessId?.name}</p>
                    {selectedBooking.businessId?.address && (
                      <p className="text-gray-600">{selectedBooking.businessId.address}</p>
                    )}
                    {selectedBooking.businessId?.phone && (
                      <p className="text-gray-600">{selectedBooking.businessId.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">الحالة</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusIcon(selectedBooking.status)}
                      <span className="mr-1">{getStatusLabel(selectedBooking.status)}</span>
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">السعر</h4>
                    <p className="text-gray-600">{selectedBooking.totalPrice} {selectedBooking.currency}</p>
                  </div>
                  
                  {selectedBooking.notes?.customer && (
                    <div>
                      <h4 className="font-medium text-gray-900">ملاحظاتك</h4>
                      <p className="text-gray-600">{selectedBooking.notes.customer}</p>
                    </div>
                  )}
                  
                  {selectedBooking.notes?.business && (
                    <div>
                      <h4 className="font-medium text-gray-900">ملاحظات النشاط التجاري</h4>
                      <p className="text-gray-600">{selectedBooking.notes.business}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    إغلاق
                  </button>
                  
                  {canCancel(selectedBooking) && (
                    <button
                      onClick={() => {
                        setSelectedBooking(null);
                        handleCancelBooking(selectedBooking._id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
                    >
                      إلغاء الحجز
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
