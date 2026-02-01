import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import activityService from '../../services/activityService';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Dashboard/DashboardSkeleton';
import './AdminActivityDashboard.css';
import {
    ChartBarIcon,
    UserGroupIcon,
    ShieldExclamationIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ArrowPathIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

// Simple Line Chart Component
const LineChart = ({ data, labels, title, color = '#6366f1' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data, 1);
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1 || 1)) * 100;
        const y = 100 - (value / maxValue) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="activity-chart-container">
            <h4 className="activity-chart-title">{title}</h4>
            <div className="activity-line-chart">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        points={points}
                    />
                    {data.map((value, index) => {
                        const x = (index / (data.length - 1 || 1)) * 100;
                        const y = 100 - (value / maxValue) * 100;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="3"
                                fill={color}
                                className="activity-chart-point"
                            />
                        );
                    })}
                </svg>
                <div className="activity-chart-labels">
                    {labels?.slice(0, 7).map((label, i) => (
                        <span key={i}>{label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Bar Chart Component
const BarChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="activity-chart-container">
            <h4 className="activity-chart-title">{title}</h4>
            <div className="activity-bar-chart">
                {data.slice(0, 8).map((item, index) => (
                    <div key={index} className="activity-bar-item">
                        <div className="activity-bar-label" title={item._id || 'Unknown'}>
                            {(item._id || 'Unknown').replace('/api/', '').substring(0, 20)}
                        </div>
                        <div className="activity-bar-container">
                            <div
                                className="activity-bar-fill"
                                style={{ width: `${(item.count / maxValue) * 100}%` }}
                            />
                            <span className="activity-bar-value">{item.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Pie Chart Component (using CSS)
const PieChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    let currentAngle = 0;
    const segments = data.map((item, index) => {
        const percentage = (item.count / total) * 100;
        const startAngle = currentAngle;
        currentAngle += percentage * 3.6;
        return {
            ...item,
            percentage,
            color: colors[index % colors.length],
            startAngle
        };
    });

    return (
        <div className="activity-chart-container">
            <h4 className="activity-chart-title">{title}</h4>
            <div className="activity-pie-wrapper">
                <div
                    className="activity-pie-chart"
                    style={{
                        background: `conic-gradient(${segments.map((s, i) =>
                            `${s.color} ${i === 0 ? 0 : segments.slice(0, i).reduce((a, b) => a + b.percentage, 0)}% ${segments.slice(0, i + 1).reduce((a, b) => a + b.percentage, 0)}%`
                        ).join(', ')})`
                    }}
                />
                <div className="activity-pie-legend">
                    {segments.map((item, index) => (
                        <div key={index} className="activity-legend-item">
                            <span className="activity-legend-color" style={{ backgroundColor: item.color }} />
                            <span className="activity-legend-label">{item._id || 'Unknown'}</span>
                            <span className="activity-legend-value">{item.percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, trendUp, color = 'primary' }) => (
    <div className={`activity-stat-card activity-stat-${color}`}>
        <div className="activity-stat-icon">
            <Icon className="h-6 w-6" />
        </div>
        <div className="activity-stat-content">
            <p className="activity-stat-label">{label}</p>
            <p className="activity-stat-value">{value}</p>
            {trend !== undefined && (
                <p className={`activity-stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
                    {trendUp ? '↑' : '↓'} {trend}%
                </p>
            )}
        </div>
    </div>
);

const AdminActivityDashboard = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState('month');
    const [dashboardData, setDashboardData] = useState(null);
    const [securityData, setSecurityData] = useState(null);
    const [logsData, setLogsData] = useState({ logs: [], pagination: {} });
    const [selectedUser, setSelectedUser] = useState(null);
    const [userActivity, setUserActivity] = useState(null);
    const [filters, setFilters] = useState({
        actionType: '',
        userId: '',
        ipAddress: '',
        page: 1
    });

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await activityService.getDashboard({ period: dateRange });
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('حدث خطأ في جلب بيانات لوحة التحكم');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    // Fetch security data
    const fetchSecurityData = useCallback(async () => {
        try {
            const response = await activityService.getSecurityReports({ period: dateRange });
            setSecurityData(response.data);
        } catch (error) {
            console.error('Error fetching security data:', error);
        }
    }, [dateRange]);

    // Fetch activity logs
    const fetchLogs = useCallback(async () => {
        try {
            const response = await activityService.getLogs({
                period: dateRange,
                ...filters,
                limit: 20
            });
            setLogsData(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    }, [dateRange, filters]);

    // Fetch user activity
    const fetchUserActivity = useCallback(async (userId) => {
        try {
            const response = await activityService.getUserActivity(userId, { period: dateRange });
            setUserActivity(response.data);
            setSelectedUser(userId);
        } catch (error) {
            console.error('Error fetching user activity:', error);
            toast.error('حدث خطأ في جلب بيانات نشاط المستخدم');
        }
    }, [dateRange]);

    // Handle IP unblock
    const handleUnblockIP = async (ipAddress) => {
        try {
            await activityService.unblockIP({ ipAddress });
            toast.success('تم إلغاء حظر عنوان IP بنجاح');
            fetchSecurityData();
        } catch (error) {
            toast.error('حدث خطأ في إلغاء الحظر');
        }
    };

    // Export logs
    const handleExportLogs = async (format = 'csv') => {
        try {
            const response = await activityService.exportLogs({ period: dateRange, format });

            if (format === 'csv') {
                const blob = new Blob([response], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('تم تصدير السجلات بنجاح');
            }
        } catch (error) {
            toast.error('حدث خطأ في تصدير السجلات');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSecurityData();
        } else if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab, fetchSecurityData, fetchLogs]);

    if (loading && !dashboardData) {
        return <DashboardSkeleton />;
    }

    const overview = dashboardData?.overview || {};

    return (
        <div className="activity-dashboard">
            {/* Header */}
            <div className="activity-header">
                <div className="activity-header-content">
                    <h1 className="activity-title">📊 لوحة مراقبة النشاط</h1>
                    <p className="activity-subtitle">مرحباً، {user?.name} - مراقبة وتحليل نشاط المستخدمين</p>
                </div>
                <div className="activity-header-actions">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="activity-date-select"
                    >
                        <option value="today">اليوم</option>
                        <option value="week">آخر أسبوع</option>
                        <option value="month">آخر شهر</option>
                        <option value="year">آخر سنة</option>
                    </select>
                    <button
                        onClick={() => fetchDashboardData()}
                        className="activity-refresh-btn"
                        title="تحديث"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleExportLogs('csv')}
                        className="activity-export-btn"
                        title="تصدير"
                    >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                        <span>تصدير</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="activity-tabs">
                <button
                    className={`activity-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <ChartBarIcon className="h-5 w-5" />
                    <span>نظرة عامة</span>
                </button>
                <button
                    className={`activity-tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <ClockIcon className="h-5 w-5" />
                    <span>سجل النشاط</span>
                </button>
                <button
                    className={`activity-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <ShieldExclamationIcon className="h-5 w-5" />
                    <span>تقارير الأمان</span>
                </button>
                <button
                    className={`activity-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <UserGroupIcon className="h-5 w-5" />
                    <span>نشاط المستخدمين</span>
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="activity-overview">
                    {/* Stats Grid */}
                    <div className="activity-stats-grid">
                        <StatCard
                            icon={CheckCircleIcon}
                            label="تسجيلات الدخول الناجحة"
                            value={overview.loginSuccess || 0}
                            color="success"
                        />
                        <StatCard
                            icon={XCircleIcon}
                            label="تسجيلات الدخول الفاشلة"
                            value={overview.loginFailed || 0}
                            color="danger"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            label="الجلسات النشطة"
                            value={overview.totalSessions || 0}
                            color="primary"
                        />
                        <StatCard
                            icon={ExclamationTriangleIcon}
                            label="معدل الأخطاء"
                            value={`${overview.errorRate || 0}%`}
                            color="warning"
                        />
                    </div>

                    {/* Success Rate Card */}
                    <div className="activity-success-rate-card">
                        <div className="activity-success-rate">
                            <div className="activity-success-circle">
                                <span className="activity-success-value">{overview.loginSuccessRate || 0}%</span>
                                <span className="activity-success-label">نسبة النجاح</span>
                            </div>
                            <div className="activity-success-details">
                                <div className="activity-success-item success">
                                    <span>ناجح</span>
                                    <span>{overview.loginSuccess || 0}</span>
                                </div>
                                <div className="activity-success-item failed">
                                    <span>فاشل</span>
                                    <span>{overview.loginFailed || 0}</span>
                                </div>
                                <div className="activity-success-item total">
                                    <span>المجموع</span>
                                    <span>{overview.totalLogins || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="activity-charts-grid">
                        {/* Activity Over Time */}
                        {dashboardData?.activityOverTime && (
                            <LineChart
                                data={dashboardData.activityOverTime.map(d => d.total)}
                                labels={dashboardData.activityOverTime.map(d => d._id.split('-').slice(1).join('/'))}
                                title="النشاط عبر الزمن"
                                color="#6366f1"
                            />
                        )}

                        {/* Top Pages */}
                        {dashboardData?.topPages && (
                            <BarChart
                                data={dashboardData.topPages}
                                title="أكثر الصفحات زيارة"
                            />
                        )}

                        {/* Device Breakdown */}
                        {dashboardData?.deviceBreakdown && (
                            <PieChart
                                data={dashboardData.deviceBreakdown}
                                title="توزيع الأجهزة"
                            />
                        )}

                        {/* Browser Breakdown */}
                        {dashboardData?.browserBreakdown && (
                            <PieChart
                                data={dashboardData.browserBreakdown}
                                title="توزيع المتصفحات"
                            />
                        )}
                    </div>

                    {/* Active Users Per Day */}
                    {dashboardData?.activeUsersPerDay && dashboardData.activeUsersPerDay.length > 0 && (
                        <div className="activity-users-chart">
                            <LineChart
                                data={dashboardData.activeUsersPerDay.map(d => d.uniqueUsers)}
                                labels={dashboardData.activeUsersPerDay.map(d => d._id.split('-').slice(1).join('/'))}
                                title="المستخدمون النشطون يومياً"
                                color="#10b981"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div className="activity-logs">
                    {/* Filters */}
                    <div className="activity-logs-filters">
                        <div className="activity-filter-group">
                            <FunnelIcon className="h-5 w-5" />
                            <select
                                value={filters.actionType}
                                onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value, page: 1 }))}
                                className="activity-filter-select"
                            >
                                <option value="">كل الأنشطة</option>
                                <option value="login_success">تسجيل دخول ناجح</option>
                                <option value="login_failed">تسجيل دخول فاشل</option>
                                <option value="logout">تسجيل خروج</option>
                                <option value="page_view">مشاهدة صفحة</option>
                                <option value="error">خطأ</option>
                                <option value="auth_error">خطأ مصادقة</option>
                            </select>
                            <input
                                type="text"
                                placeholder="عنوان IP..."
                                value={filters.ipAddress}
                                onChange={(e) => setFilters(prev => ({ ...prev, ipAddress: e.target.value, page: 1 }))}
                                className="activity-filter-input"
                            />
                            <button
                                onClick={fetchLogs}
                                className="activity-filter-btn"
                            >
                                بحث
                            </button>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="activity-logs-table-container">
                        <table className="activity-logs-table">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>المستخدم</th>
                                    <th>النوع</th>
                                    <th>الصفحة</th>
                                    <th>الحالة</th>
                                    <th>عنوان IP</th>
                                    <th>الجهاز</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logsData.logs?.map((log, index) => (
                                    <tr key={log._id || index}>
                                        <td>{new Date(log.createdAt).toLocaleString('ar-SA')}</td>
                                        <td>{log.userId?.email || 'زائر'}</td>
                                        <td>
                                            <span className={`activity-badge activity-badge-${log.actionType}`}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        <td className="activity-log-url">{log.pageUrl?.substring(0, 30) || '-'}</td>
                                        <td>
                                            {log.httpStatus && (
                                                <span className={`activity-status-badge ${log.httpStatus >= 400 ? 'error' : 'success'}`}>
                                                    {log.httpStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td>{log.ipAddress}</td>
                                        <td>
                                            {log.device === 'Mobile' ? (
                                                <DevicePhoneMobileIcon className="h-5 w-5" />
                                            ) : (
                                                <ComputerDesktopIcon className="h-5 w-5" />
                                            )}
                                        </td>
                                        <td>
                                            {log.userId && (
                                                <button
                                                    onClick={() => fetchUserActivity(log.userId._id)}
                                                    className="activity-action-btn"
                                                    title="عرض نشاط المستخدم"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logsData.pagination && (
                        <div className="activity-pagination">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={filters.page <= 1}
                                className="activity-page-btn"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                            <span className="activity-page-info">
                                صفحة {filters.page} من {logsData.pagination.pages || 1}
                            </span>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={filters.page >= logsData.pagination.pages}
                                className="activity-page-btn"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && securityData && (
                <div className="activity-security">
                    {/* Security Score */}
                    <div className="activity-security-score-card">
                        <div className={`activity-security-score ${securityData.overview?.securityScore >= 80 ? 'score-good' :
                            securityData.overview?.securityScore >= 50 ? 'score-medium' : 'score-bad'
                            }`}>
                            <span className="score-value">{securityData.overview?.securityScore || 0}</span>
                            <span className="score-label">درجة الأمان</span>
                        </div>
                        <div className="activity-security-stats">
                            <div className="security-stat">
                                <span className="stat-value">{securityData.overview?.suspiciousIPCount || 0}</span>
                                <span className="stat-label">عناوين IP مشبوهة</span>
                            </div>
                            <div className="security-stat">
                                <span className="stat-value">{securityData.overview?.bruteForceAlertCount || 0}</span>
                                <span className="stat-label">تنبيهات الاختراق</span>
                            </div>
                            <div className="security-stat">
                                <span className="stat-value">{securityData.overview?.blockedIPCount || 0}</span>
                                <span className="stat-label">عناوين محظورة</span>
                            </div>
                        </div>
                    </div>

                    {/* Suspicious IPs */}
                    {securityData.suspiciousIPs?.length > 0 && (
                        <div className="activity-security-section">
                            <h3 className="activity-section-title">
                                <ShieldExclamationIcon className="h-5 w-5" />
                                عناوين IP المشبوهة
                            </h3>
                            <div className="activity-security-list">
                                {securityData.suspiciousIPs.map((ip, index) => (
                                    <div key={index} className="activity-security-item">
                                        <div className="security-item-info">
                                            <GlobeAltIcon className="h-5 w-5" />
                                            <span className="security-item-ip">{ip._id}</span>
                                            <span className="security-item-attempts">{ip.failedAttempts} محاولة فاشلة</span>
                                        </div>
                                        <span className="security-item-time">
                                            آخر محاولة: {new Date(ip.lastAttempt).toLocaleString('ar-SA')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Blocked IPs */}
                    {securityData.blockedIPs?.length > 0 && (
                        <div className="activity-security-section">
                            <h3 className="activity-section-title">
                                <XCircleIcon className="h-5 w-5" />
                                عناوين IP المحظورة
                            </h3>
                            <div className="activity-security-list">
                                {securityData.blockedIPs.map((ip, index) => (
                                    <div key={index} className="activity-security-item blocked">
                                        <div className="security-item-info">
                                            <GlobeAltIcon className="h-5 w-5" />
                                            <span className="security-item-ip">{ip.ipAddress}</span>
                                            <span className="security-item-identifier">{ip.identifier}</span>
                                        </div>
                                        <div className="security-item-actions">
                                            <span className="security-item-until">
                                                محظور حتى: {new Date(ip.blockedUntil).toLocaleString('ar-SA')}
                                            </span>
                                            <button
                                                onClick={() => handleUnblockIP(ip.ipAddress)}
                                                className="activity-unblock-btn"
                                            >
                                                إلغاء الحظر
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Brute Force Alerts */}
                    {securityData.bruteForceAlerts?.length > 0 && (
                        <div className="activity-security-section">
                            <h3 className="activity-section-title">
                                <ExclamationTriangleIcon className="h-5 w-5" />
                                تنبيهات محاولات الاختراق
                            </h3>
                            <div className="activity-security-list">
                                {securityData.bruteForceAlerts.map((alert, index) => (
                                    <div key={index} className="activity-security-item alert">
                                        <div className="security-item-info">
                                            <span className="security-item-identifier">{alert.identifier}</span>
                                            <span className="security-item-ip">من: {alert.ipAddress}</span>
                                        </div>
                                        <div className="security-item-details">
                                            <span className="security-item-attempts">{alert.attemptsCount} محاولات</span>
                                            <span className="security-item-reason">{alert.reason}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Failed Logins */}
                    <div className="activity-security-section">
                        <h3 className="activity-section-title">
                            <ClockIcon className="h-5 w-5" />
                            آخر محاولات تسجيل الدخول الفاشلة
                        </h3>
                        <div className="activity-logs-table-container">
                            <table className="activity-logs-table">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>عنوان IP</th>
                                        <th>الرسالة</th>
                                        <th>المتصفح</th>
                                        <th>الجهاز</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {securityData.recentFailedLogins?.slice(0, 10).map((log, index) => (
                                        <tr key={index}>
                                            <td>{new Date(log.createdAt).toLocaleString('ar-SA')}</td>
                                            <td>{log.ipAddress}</td>
                                            <td>{log.errorMessage || '-'}</td>
                                            <td>{log.browser || '-'}</td>
                                            <td>{log.device || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="activity-users-tab">
                    {selectedUser && userActivity ? (
                        <div className="activity-user-details">
                            <button
                                onClick={() => { setSelectedUser(null); setUserActivity(null); }}
                                className="activity-back-btn"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                                العودة للقائمة
                            </button>

                            <div className="activity-user-header">
                                <h3>{userActivity.user?.name}</h3>
                                <p>{userActivity.user?.email}</p>
                            </div>

                            <div className="activity-user-stats">
                                <div className="user-stat">
                                    <span className="stat-value">{userActivity.stats?.totalSessions || 0}</span>
                                    <span className="stat-label">الجلسات</span>
                                </div>
                                <div className="user-stat">
                                    <span className="stat-value">{userActivity.stats?.totalPageViews || 0}</span>
                                    <span className="stat-label">مشاهدات الصفحات</span>
                                </div>
                                <div className="user-stat">
                                    <span className="stat-value">{userActivity.stats?.totalErrors || 0}</span>
                                    <span className="stat-label">الأخطاء</span>
                                </div>
                                <div className="user-stat">
                                    <span className="stat-value">{userActivity.stats?.averageSessionDuration || 0} د</span>
                                    <span className="stat-label">متوسط مدة الجلسة</span>
                                </div>
                            </div>

                            {/* User Sessions */}
                            <div className="activity-user-sessions">
                                <h4>الجلسات</h4>
                                <div className="sessions-list">
                                    {userActivity.sessions?.map((session, index) => (
                                        <div key={index} className="session-item">
                                            <div className="session-time">
                                                {new Date(session.startTime).toLocaleString('ar-SA')}
                                            </div>
                                            <div className="session-info">
                                                <span>{Math.round(session.duration / 1000 / 60)} دقيقة</span>
                                                <span>{session.pageViews} صفحات</span>
                                                <span>{session.errors} أخطاء</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Login History */}
                            <div className="activity-user-logins">
                                <h4>سجل تسجيل الدخول</h4>
                                <div className="logins-list">
                                    {userActivity.loginHistory?.map((login, index) => (
                                        <div key={index} className={`login-item ${login.actionType}`}>
                                            <span className="login-time">
                                                {new Date(login.createdAt).toLocaleString('ar-SA')}
                                            </span>
                                            <span className={`login-type ${login.actionType}`}>
                                                {login.actionType === 'login_success' ? 'دخول ناجح' :
                                                    login.actionType === 'login_failed' ? 'دخول فاشل' : 'خروج'}
                                            </span>
                                            <span className="login-ip">{login.ipAddress}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Most Visited Pages */}
                            <div className="activity-user-pages">
                                <h4>الصفحات الأكثر زيارة</h4>
                                <div className="pages-list">
                                    {userActivity.mostVisitedPages?.map((page, index) => (
                                        <div key={index} className="page-item">
                                            <span className="page-url">{page._id}</span>
                                            <span className="page-count">{page.count} زيارة</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="activity-users-search">
                            <p className="activity-users-hint">
                                اختر مستخدماً من سجل النشاط لعرض تفاصيله، أو استخدم البحث أدناه:
                            </p>
                            <Link
                                to="/dashboard/admin/users"
                                className="activity-users-link"
                            >
                                <UserGroupIcon className="h-5 w-5" />
                                إدارة المستخدمين
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminActivityDashboard;
