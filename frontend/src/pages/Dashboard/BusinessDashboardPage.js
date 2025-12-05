import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import QuickMessage from '../../components/QuickMessage';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import { DashboardSkeleton } from '../../components/Dashboard/DashboardSkeleton';
import AdvancedFilters from '../../components/Dashboard/AdvancedFilters';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  CogIcon,
  PlusIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const BusinessDashboardPage = () => {
  const { user } = useAuthStore();
  const [business, setBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    totalServices: 0,
    pendingBookings: 0,
    completedBookings: 0
  });
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);

      // Check if user has a business first
      const businessResponse = await api.get('/businesses/check-business');
      if (businessResponse.data && businessResponse.data.success) {
        if (businessResponse.data.hasBusiness) {
          const businessData = businessResponse.data.data;
          setBusiness(businessData);
          console.log('Business data loaded successfully:', businessData);

          // Fetch services for this business
          try {
            const servicesResponse = await api.get(`/services/${businessData._id}`);
            if (servicesResponse.data && servicesResponse.data.success) {
              setServices(servicesResponse.data.data);
              setStats(prev => ({ ...prev, totalServices: servicesResponse.data.data.length }));
            }
          } catch (servicesError) {
            console.warn('Failed to fetch services:', servicesError);
            setServices([]);
          }

          // Fetch bookings for this business
          try {
            const bookingsResponse = await api.get(`/bookings/business/${businessData._id}`);
            if (bookingsResponse.data && bookingsResponse.data.success) {
              const bookingsData = bookingsResponse.data.data;
              setBookings(bookingsData);

              // Calculate stats
              const today = new Date().toISOString().split('T')[0];
              const todayBookings = bookingsData.filter(booking =>
                new Date(booking.date).toISOString().split('T')[0] === today
              );

              const pendingBookings = bookingsData.filter(booking => booking.status === 'pending');
              const confirmedBookings = bookingsData.filter(booking => booking.status === 'confirmed');
              const completedBookings = bookingsData.filter(booking => booking.status === 'completed');
              const cancelledBookings = bookingsData.filter(booking => booking.status === 'cancelled');

              const totalRevenue = bookingsData
                .filter(booking => ['confirmed', 'completed'].includes(booking.status))
                .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

              setStats(prev => ({
                ...prev,
                totalBookings: bookingsData.length,
                todayBookings: todayBookings.length,
                pendingBookings: pendingBookings.length,
                confirmedBookings: confirmedBookings.length,
                completedBookings: completedBookings.length,
                cancelledBookings: cancelledBookings.length,
                totalRevenue: totalRevenue
              }));
            }
          } catch (bookingsError) {
            console.warn('Failed to fetch bookings:', bookingsError);
            setBookings([]);
          }

        } else {
          setBusiness(null);
          console.log('No business found for user');
        }
      }

      // Set default values if no data was fetched
      if (!business) {
        setBookings([]);
        setServices([]);
        setStats({
          totalBookings: 0,
          todayBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          totalServices: 0
        });
      }

      // Load unread message count
      try {
        const unreadResponse = await api.get('/messages/unread-count');
        const unreadCount = unreadResponse.data.data?.unreadCount || unreadResponse.data.unreadCount || 0;
        setUnreadMessageCount(unreadCount);
      } catch (unreadError) {
        console.warn('Failed to fetch unread message count:', unreadError);
        setUnreadMessageCount(0);
      }

    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('حدث خطأ في جلب البيانات');

      // Set default values on complete failure
      setBookings([]);
      setServices([]);
      setStats({
        totalBookings: 0,
        todayBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        totalServices: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'في الانتظار' },
      'confirmed': { color: 'bg-green-100 text-green-800', text: 'مؤكد' },
      'completed': { color: 'bg-blue-100 text-blue-800', text: 'مكتمل' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'ملغي' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      toast.success('تم تحديث حالة الحجز بنجاح');
      fetchBusinessData(); // Refresh data
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة الحجز');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Show message if no business exists
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-yellow-600 text-4xl">🏪</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">مرحباً، {user?.name}</h1>
            <p className="text-xl text-gray-600 mb-8">لم يتم إنشاء نشاط تجاري بعد</p>
            <p className="text-gray-500 mb-8">لبدء استخدام لوحة التحكم، يجب عليك إنشاء نشاط تجاري أولاً</p>
            <Link
              to="/dashboard/business/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              إنشاء نشاط تجاري جديد
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">مرحباً، {user?.name}</h1>
          <p className="text-gray-600">لوحة تحكم التاجر</p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats userRole="business" />

        {/* Advanced Filters */}
        <AdvancedFilters
          onFiltersChange={setFilters}
          filters={filters}
          showDateRange={true}
          showPriceRange={true}
          showLocation={true}
          showStatus={true}
          showCategory={true}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/dashboard/services/add"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <PlusIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">إضافة خدمة جديدة</h3>
                <p className="text-sm text-gray-600">أضف خدمة جديدة إلى متجرك</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/bookings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">إدارة الحجوزات</h3>
                <p className="text-sm text-gray-600">عرض وإدارة جميع الحجوزات</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/services"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CogIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">إدارة الخدمات</h3>
                <p className="text-sm text-gray-600">تعديل وحذف الخدمات</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Message Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/dashboard/messages"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <h3 className="text-lg font-medium text-gray-900">صندوق الوارد</h3>
                  {unreadMessageCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadMessageCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">عرض الرسائل الواردة من العملاء</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/messages?tab=sent"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">الرسائل المرسلة</h3>
                <p className="text-sm text-gray-600">عرض الرسائل المرسلة للعملاء</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Message Component */}
        <div className="mb-8">
          <QuickMessage />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">آخر الحجوزات</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الخدمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customer?.name || 'غير محدد'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customer?.phone || 'غير محدد'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.service?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.price} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleBookingStatusUpdate(booking._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            تأكيد
                          </button>
                          <button
                            onClick={() => handleBookingStatusUpdate(booking._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          إكمال
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد حجوزات بعد</p>
            </div>
          )}
        </div>

        {/* Services Overview */}
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
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.slice(0, 5).map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
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
                      {service.price} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.duration} دقيقة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {service.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد خدمات متاحة</p>
              <Link
                to="/dashboard/services/add"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                إضافة خدمة جديدة
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardPage;
