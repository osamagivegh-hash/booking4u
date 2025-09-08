import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import QuickMessage from '../../components/QuickMessage';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BellIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const CustomerDashboardPage = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  });

  // Function to calculate stats from bookings data
  const calculateStatsFromBookings = (bookings) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      totalBookings: bookings.length,
      todayBookings: bookings.filter(booking => {
        try {
          const bookingDate = new Date(booking.date);
          return bookingDate >= today && 
                 ['pending', 'confirmed'].includes(booking.status);
        } catch (dateError) {
          console.warn('Invalid date in booking:', booking.date);
          return false;
        }
      }).length,
      monthlyBookings: bookings.filter(booking => {
        try {
          const bookingDate = new Date(booking.createdAt || booking.date);
          return bookingDate >= thisMonth;
        } catch (dateError) {
          console.warn('Invalid date in booking:', booking.createdAt || booking.date);
          return false;
        }
      }).length,
      upcomingBookings: bookings.filter(booking => {
        try {
          return new Date(booking.date) > now && 
                 ['pending', 'confirmed'].includes(booking.status);
        } catch (dateError) {
          console.warn('Invalid date in booking:', booking.date);
          return false;
        }
      }).length,
      completedBookings: bookings.filter(booking => booking.status === 'completed').length,
      cancelledBookings: bookings.filter(booking => booking.status === 'cancelled').length,
      pendingBookings: bookings.filter(booking => booking.status === 'pending').length,
      confirmedBookings: bookings.filter(booking => booking.status === 'confirmed').length,
      totalRevenue: bookings
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
      monthlyRevenue: bookings
        .filter(booking => {
          try {
            const bookingDate = new Date(booking.date);
            return booking.status === 'completed' && 
                   bookingDate >= thisMonth;
          } catch (dateError) {
            return false;
          }
        })
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
    };
  };
  const [latestServices, setLatestServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings first
      const bookingsResponse = await api.get('/bookings/my-bookings');
      setBookings(bookingsResponse.data.data || []);
      
      // Fetch latest services
      try {
        const latestServicesResponse = await api.get('/services/latest?limit=6');
        if (latestServicesResponse.data && latestServicesResponse.data.success) {
          setLatestServices(latestServicesResponse.data.data || []);
        }
      } catch (latestServicesError) {
        console.warn('Failed to fetch latest services:', latestServicesError);
        setLatestServices([]);
      }
      
      // Try to fetch stats (optional - we'll calculate from bookings if it fails)
      let statsResponse = null;
      try {
        statsResponse = await api.get('/bookings/stats');
        if (statsResponse.data && statsResponse.data.success) {
          setStats(statsResponse.data.data || {});
          console.log('Stats API success:', statsResponse.data.data);
        } else {
          throw new Error('Invalid stats response');
        }
      } catch (statsError) {
        console.warn('Stats API failed, will calculate from bookings data:', statsError.message);
        statsResponse = null; // Ensure we fall back to calculation
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
      
      // If stats API failed, calculate stats from bookings data
      if (!statsResponse) {
        console.log('Calculating stats from bookings data');
        const bookings = bookingsResponse.data.data || [];
        const calculatedStats = calculateStatsFromBookings(bookings);
        console.log('Calculated stats from bookings:', calculatedStats);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('حدث خطأ في جلب البيانات');
      
      // Set default values on complete failure
      setStats(calculateStatsFromBookings([]));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !searchCategory) {
      toast.error('يرجى إدخال كلمة بحث أو اختيار فئة');
      return;
    }

    try {
      setIsSearching(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (searchCategory) params.append('category', searchCategory);
      params.append('limit', '20');

      const response = await api.get(`/services/search?${params.toString()}`);
      if (response.data && response.data.success) {
        setSearchResults(response.data.data || []);
        if (response.data.data.length === 0) {
          toast.info('لم يتم العثور على خدمات تطابق البحث');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('حدث خطأ في البحث');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingTime('09:00');
  };

  const handleCreateBooking = async () => {
    if (!bookingDate || !bookingTime) {
      toast.error('يرجى تحديد التاريخ والوقت');
      return;
    }

    if (!selectedService) {
      toast.error('يرجى اختيار خدمة');
      return;
    }

    // Prepare booking data outside try block for error logging
    let bookingData = null;
    
    try {
      setIsCreatingBooking(true);
      
      // Ensure we have valid IDs
      const businessId = selectedService.businessId?._id || selectedService.businessId;
      const serviceId = selectedService._id;
      
      if (!businessId) {
        console.error('Missing businessId:', selectedService);
        toast.error('خطأ في بيانات النشاط التجاري');
        return;
      }
      
      if (!serviceId) {
        console.error('Missing serviceId:', selectedService);
        toast.error('خطأ في بيانات الخدمة');
        return;
      }
      
      // Validate date format
      const bookingDateObj = new Date(bookingDate);
      if (isNaN(bookingDateObj.getTime())) {
        toast.error('تاريخ غير صحيح');
        return;
      }
      
      // Ensure date is in ISO format for backend
      const isoDate = bookingDateObj.toISOString();
      console.log('Date conversion:', { bookingDate, bookingDateObj, isoDate });
      
      // Validate time format
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(bookingTime)) {
        toast.error('وقت غير صحيح');
        return;
      }
      
      console.log('Creating booking with:', { 
        businessId: String(businessId), 
        serviceId: String(serviceId), 
        date: bookingDate, 
        startTime: bookingTime,
        selectedService: selectedService
      });
      
      bookingData = {
        businessId: String(businessId),
        serviceId: String(serviceId),
        date: isoDate,
        startTime: bookingTime,
        notes: {
          customer: bookingNotes || ''
        }
      };
      
      console.log('Sending booking data:', bookingData);

      const response = await api.post('/bookings', bookingData);
      
      if (response.data && response.data.success) {
        toast.success('تم إنشاء الحجز بنجاح');
        setShowBookingModal(false);
        setSelectedService(null);
        setBookingDate('');
        setBookingTime('');
        setBookingNotes('');
        // Refresh customer data to show new booking
        fetchCustomerData();
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        bookingData: bookingData
      });
      
      let errorMessage = 'حدث خطأ في إنشاء الحجز';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          errorMessage = validationErrors[0].msg || validationErrors[0].message;
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'بيانات الحجز غير صحيحة';
      } else if (error.response?.status === 404) {
        errorMessage = 'الخدمة أو النشاط التجاري غير موجود';
      } else if (error.response?.status === 500) {
        errorMessage = 'خطأ في الخادم، يرجى المحاولة مرة أخرى';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const categories = [
    { value: '', label: 'جميع الفئات' },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">مرحباً، {user?.name}</h1>
          <p className="text-gray-600">لوحة تحكم العميل</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الحجوزات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الحجوزات القادمة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الحجوزات المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الحجوزات الملغية</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelledBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/services"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">البحث عن خدمات</h3>
                <p className="text-sm text-gray-600">ابحث عن الخدمات المتاحة</p>
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
                <h3 className="text-lg font-medium text-gray-900">حجوزاتي</h3>
                <p className="text-sm text-gray-600">عرض وإدارة الحجوزات</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">الملف الشخصي</h3>
                <p className="text-sm text-gray-600">تعديل البيانات الشخصية</p>
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
                <p className="text-sm text-gray-600">عرض الرسائل الواردة</p>
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
                <p className="text-sm text-gray-600">عرض الرسائل المرسلة</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Search Services */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">البحث عن الخدمات</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ابحث عن خدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 ml-2" />
                  بحث
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">نتائج البحث</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((service) => (
                  <div key={service._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{service.businessId?.name}</span>
                      <span className="text-sm font-medium text-primary-600">{service.price} ريال</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{service.duration} دقيقة</span>
                      <button
                        onClick={() => handleBookService(service)}
                        className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 ml-1" />
                        احجز الآن
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Message Component */}
        <div className="mb-8">
          <QuickMessage />
        </div>

        {/* Latest Services */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">أحدث الخدمات المضافة</h2>
          {latestServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestServices.map((service) => (
                <div key={service._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">{service.name}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{service.businessId?.name}</span>
                    <span className="text-sm font-medium text-primary-600">{service.price} ريال</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{service.duration} دقيقة</span>
                    <button
                      onClick={() => handleBookService(service)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 ml-1" />
                      احجز الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد خدمات جديدة في آخر 24 ساعة</p>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">آخر الحجوزات</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.service?.name || 'غير محدد'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.business?.name || 'غير محدد'}
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد حجوزات بعد</p>
              <Link
                to="/services"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                احجز الآن
              </Link>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات التواصل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-400 ml-2" />
              <span className="text-gray-900">{user?.phone || 'غير محدد'}</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 ml-2" />
              <span className="text-gray-900">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedService && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">حجز خدمة: {selectedService.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="أضف أي ملاحظات خاصة..."
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">تفاصيل الخدمة</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>النشاط التجاري: {selectedService.businessId?.name}</p>
                      <p>السعر: {selectedService.price} ريال</p>
                      <p>المدة: {selectedService.duration} دقيقة</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedService(null);
                      setBookingDate('');
                      setBookingTime('');
                      setBookingNotes('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    disabled={isCreatingBooking}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingBooking ? 'جاري الحجز...' : 'تأكيد الحجز'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
