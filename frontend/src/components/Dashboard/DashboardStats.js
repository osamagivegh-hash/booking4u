import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardStats = ({ userRole = 'customer' }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    monthlyBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalServices: 0,
    totalCustomers: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    conversionRate: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    fetchStats();
  }, [timeRange, userRole]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/stats?timeRange=${timeRange}`);
      
      if (response.data?.success) {
        setStats(response.data.data);
      } else {
        // If API returns success: false, use default stats
        console.warn('Stats API returned success: false, using default stats');
        setStats({
          totalBookings: 0,
          todayBookings: 0,
          monthlyBookings: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalServices: 0,
          totalCustomers: 0,
          pendingBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: 0,
          totalReviews: 0,
          conversionRate: 0,
          growthRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use default stats instead of showing error toast
      setStats({
        totalBookings: 0,
        todayBookings: 0,
        monthlyBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalServices: 0,
        totalCustomers: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        averageRating: 0,
        totalReviews: 0,
        conversionRate: 0,
        growthRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const safeAmount = amount || 0;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(safeAmount);
  };

  const formatNumber = (num) => {
    const safeNum = num || 0;
    return new Intl.NumberFormat('ar-SA').format(safeNum);
  };

  const getGrowthIcon = (rate) => {
    if (rate > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (rate < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <ChartBarIcon className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const businessStats = [
    {
      title: t('totalBookings'),
      value: formatNumber(stats.totalBookings),
      icon: CalendarIcon,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: stats.growthRate,
      subtitle: `${formatNumber(stats.todayBookings)} ${t('today')}`
    },
    {
      title: t('monthlyRevenue'),
      value: formatCurrency(stats.monthlyRevenue),
      icon: CurrencyDollarIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      change: stats.growthRate,
      subtitle: `${t('total')}: ${formatCurrency(stats.totalRevenue)}`
    },
    {
      title: t('activeServices'),
      value: formatNumber(stats.totalServices),
      icon: ChartBarIcon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: 0,
      subtitle: `${formatNumber(stats.totalCustomers)} ${t('customer')}`
    },
    {
      title: t('conversionRate'),
      value: `${(stats.conversionRate || 0).toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      change: stats.growthRate,
      subtitle: `${t('averageRating')}: ${(stats.averageRating || 0).toFixed(1)}`
    }
  ];

  const customerStats = [
    {
      title: t('myBookings'),
      value: formatNumber(stats.totalBookings),
      icon: CalendarIcon,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: stats.growthRate,
      subtitle: `${formatNumber(stats.todayBookings)} ${t('today')}`
    },
    {
      title: t('completed'),
      value: formatNumber(stats.completedBookings),
      icon: CheckCircleIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      change: 0,
      subtitle: `${formatNumber(stats.pendingBookings)} ${t('pending')}`
    },
    {
      title: t('cancelled'),
      value: formatNumber(stats.cancelledBookings),
      icon: XCircleIcon,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      change: 0,
      subtitle: `${formatNumber(stats.totalReviews)} ${t('reviews')}`
    },
    {
      title: t('amountPaid'),
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: stats.growthRate,
      subtitle: `${t('thisMonth')}: ${formatCurrency(stats.monthlyRevenue)}`
    }
  ];

  const statsToShow = userRole === 'business' ? businessStats : customerStats;

  return (
    <div className="mb-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('statistics')}</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">{t('last7Days')}</option>
            <option value="30d">{t('last30Days')}</option>
            <option value="90d">{t('last90Days')}</option>
            <option value="1y">{t('lastYear')}</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsToShow.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center space-x-1 space-x-reverse text-sm ${getGrowthColor(stat.change)}`}>
                  {getGrowthIcon(stat.change)}
                  <span>{Math.abs(stat.change || 0).toFixed(1)}%</span>
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
            
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Additional Stats for Business */}
      {userRole === 'business' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('bookingStatus')}</h3>
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('pending')}</span>
                <span className="text-sm font-semibold text-yellow-600">{formatNumber(stats.pendingBookings)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('completed')}</span>
                <span className="text-sm font-semibold text-green-600">{formatNumber(stats.completedBookings)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('cancelled')}</span>
                <span className="text-sm font-semibold text-red-600">{formatNumber(stats.cancelledBookings)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('reviews')}</h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{(stats.averageRating || 0).toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < Math.floor(stats.averageRating || 0) ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{formatNumber(stats.totalReviews)} {t('reviews')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('performance')}</h3>
              <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('conversionRate')}</span>
                <span className="text-sm font-semibold text-blue-600">{(stats.conversionRate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('bookingGrowth')}</span>
                <span className={`text-sm font-semibold ${getGrowthColor(stats.growthRate)}`}>
                  {(stats.growthRate || 0) > 0 ? '+' : ''}{(stats.growthRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('averageBooking')}</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency((stats.totalRevenue || 0) / Math.max(stats.totalBookings || 1, 1))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
