import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  CogIcon,
  PlusIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const AdminPanelPage = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalServices: 0,
    totalRevenue: 0,
    todayBookings: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, servicesResponse, usersResponse, statsResponse] = await Promise.all([
        api.get('/bookings/all'),
        api.get('/services/all'),
        api.get('/users/all'),
        api.get('/admin/stats')
      ]);

      setBookings(bookingsResponse.data.data || []);
      setServices(servicesResponse.data.data || []);
      setUsers(usersResponse.data.data || []);
      setStats(statsResponse.data.data || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('حدث خطأ في جلب البيانات');
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

  const handleServiceStatusToggle = async (serviceId, currentStatus) => {
    try {
      await api.put(`/services/${serviceId}/toggle-status`, {
        isActive: !currentStatus
      });
      toast.success('تم تحديث حالة الخدمة بنجاح');
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة الخدمة');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/toggle-status`, {
        isActive: !currentStatus
      });
      toast.success('تم تحديث حالة المستخدم بنجاح');
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة المستخدم');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
          <p className="text-gray-600">مرحباً، {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الحجوزات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CogIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الخدمات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue} ريال</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/dashboard/admin/services/add"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <PlusIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">إضافة خدمة جديدة</h3>
                <p className="text-sm text-gray-600">أضف خدمة جديدة للموقع</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">إدارة المستخدمين</h3>
                <p className="text-sm text-gray-600">عرض وإدارة جميع المستخدمين</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/admin/bookings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">إدارة الحجوزات</h3>
                <p className="text-sm text-gray-600">عرض وإدارة جميع الحجوزات</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Services Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">إدارة الخدمات</h2>
            <Link
              to="/dashboard/admin/services/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة خدمة
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الخدمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاجر
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
                {services.slice(0, 10).map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {service.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.business?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.price} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.duration} دقيقة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleServiceStatusToggle(service._id, service.isActive)}
                        className={`${
                          service.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {service.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد خدمات متاحة</p>
            </div>
          )}
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">إدارة المستخدمين</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
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
                {users.slice(0, 10).map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'business' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'business' ? 'تاجر' : 'عميل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                        className={`${
                          user.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا يوجد مستخدمون</p>
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
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاجر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الخدمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
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
                {bookings.slice(0, 10).map((booking) => (
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
                      {booking.business?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.service?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString('ar-SA')}
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
              <p className="text-gray-500">لا توجد حجوزات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
