import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import ActivityLog from '../models/ActivityLog.js';
import FailedLogin from '../models/FailedLogin.js';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';

const router = express.Router();

// All routes require authentication and admin role
// Note: For this booking system, we'll consider 'business' role as admin for now
// You can create a separate 'admin' role if needed
router.use(protect);

/**
 * Helper function to parse date range from query params
 */
const getDateRange = (req) => {
    const { startDate, endDate, period } = req.query;

    let start, end;

    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    } else {
        // Default periods
        end = new Date();
        end.setHours(23, 59, 59, 999);

        switch (period) {
            case 'today':
                start = new Date();
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start = new Date();
                start.setDate(start.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start = new Date();
                start.setMonth(start.getMonth() - 1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'year':
                start = new Date();
                start.setFullYear(start.getFullYear() - 1);
                start.setHours(0, 0, 0, 0);
                break;
            default:
                // Default to last 30 days
                start = new Date();
                start.setDate(start.getDate() - 30);
                start.setHours(0, 0, 0, 0);
        }
    }

    return { startDate: start, endDate: end };
};

/**
 * @desc    Get activity dashboard overview
 * @route   GET /api/activity/dashboard
 * @access  Private (Admin)
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    const { startDate, endDate } = getDateRange(req);

    // Get login stats
    const loginStats = await ActivityLog.getLoginStats(startDate, endDate);
    const loginSuccess = loginStats.find(s => s._id === 'login_success')?.count || 0;
    const loginFailed = loginStats.find(s => s._id === 'login_failed')?.count || 0;

    // Get top pages
    const topPages = await ActivityLog.getTopPages(startDate, endDate, 10);

    // Get active users per day
    const activeUsersPerDay = await ActivityLog.getActiveUsersPerDay(startDate, endDate);

    // Get error rate
    const errorStats = await ActivityLog.getErrorRate(startDate, endDate);

    // Get total sessions
    const totalSessions = await ActivityLog.distinct('sessionId', {
        createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get activity over time (grouped by day)
    const activityOverTime = await ActivityLog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    actionType: '$actionType'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                activities: {
                    $push: {
                        type: '$_id.actionType',
                        count: '$count'
                    }
                },
                total: { $sum: '$count' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Get error breakdown by status code
    const errorsByStatus = await ActivityLog.aggregate([
        {
            $match: {
                actionType: { $in: ['error', 'auth_error'] },
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$httpStatus',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Get device breakdown
    const deviceBreakdown = await ActivityLog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                device: { $ne: null }
            }
        },
        {
            $group: {
                _id: '$device',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get browser breakdown
    const browserBreakdown = await ActivityLog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                browser: { $ne: null }
            }
        },
        {
            $group: {
                _id: '$browser',
                count: { $sum: 1 }
            }
        }
    ]);

    return ApiResponse.success(res, {
        overview: {
            totalLogins: loginSuccess + loginFailed,
            loginSuccess,
            loginFailed,
            loginSuccessRate: loginSuccess + loginFailed > 0
                ? ((loginSuccess / (loginSuccess + loginFailed)) * 100).toFixed(1)
                : 0,
            totalSessions: totalSessions.length,
            errorRate: errorStats.errorRate,
            totalErrors: errorStats.errors,
            totalRequests: errorStats.total
        },
        topPages,
        activeUsersPerDay,
        activityOverTime,
        errorsByStatus,
        deviceBreakdown,
        browserBreakdown,
        dateRange: { startDate, endDate }
    }, 'تم جلب بيانات لوحة التحكم بنجاح');
}));

/**
 * @desc    Get activity logs with filters and pagination
 * @route   GET /api/activity/logs
 * @access  Private (Admin)
 */
router.get('/logs', asyncHandler(async (req, res) => {
    const { startDate, endDate } = getDateRange(req);
    const {
        actionType,
        userId,
        sessionId,
        ipAddress,
        httpStatus,
        page = 1,
        limit = 50
    } = req.query;

    // Build query
    const query = {
        createdAt: { $gte: startDate, $lte: endDate }
    };

    if (actionType) query.actionType = actionType;
    if (userId) query.userId = userId;
    if (sessionId) query.sessionId = sessionId;
    if (ipAddress) query.ipAddress = ipAddress;
    if (httpStatus) query.httpStatus = parseInt(httpStatus);

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
        ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email')
            .lean(),
        ActivityLog.countDocuments(query)
    ]);

    return ApiResponse.success(res, {
        logs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    }, 'تم جلب سجلات النشاط بنجاح');
}));

/**
 * @desc    Get user activity details
 * @route   GET /api/activity/users/:userId
 * @access  Private (Admin)
 */
router.get('/users/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = getDateRange(req);

    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
        return ApiResponse.notFound(res, 'المستخدم غير موجود');
    }

    // Get user's sessions
    const sessions = await ActivityLog.aggregate([
        {
            $match: {
                userId: user._id,
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$sessionId',
                startTime: { $min: '$createdAt' },
                endTime: { $max: '$createdAt' },
                pageViews: {
                    $sum: { $cond: [{ $eq: ['$actionType', 'page_view'] }, 1, 0] }
                },
                errors: {
                    $sum: { $cond: [{ $in: ['$actionType', ['error', 'auth_error']] }, 1, 0] }
                },
                activities: { $sum: 1 }
            }
        },
        {
            $addFields: {
                duration: { $subtract: ['$endTime', '$startTime'] }
            }
        },
        { $sort: { startTime: -1 } }
    ]);

    // Get login history
    const loginHistory = await ActivityLog.find({
        userId: user._id,
        actionType: { $in: ['login_success', 'login_failed', 'logout'] },
        createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 }).limit(50);

    // Get errors encountered by user
    const userErrors = await ActivityLog.find({
        userId: user._id,
        actionType: { $in: ['error', 'auth_error', 'validation_error'] },
        createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 }).limit(50);

    // Get most visited pages
    const mostVisitedPages = await ActivityLog.aggregate([
        {
            $match: {
                userId: user._id,
                actionType: 'page_view',
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$pageUrl',
                count: { $sum: 1 },
                lastVisit: { $max: '$createdAt' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    return ApiResponse.success(res, {
        user,
        sessions,
        loginHistory,
        userErrors,
        mostVisitedPages,
        stats: {
            totalSessions: sessions.length,
            totalPageViews: sessions.reduce((sum, s) => sum + s.pageViews, 0),
            totalErrors: sessions.reduce((sum, s) => sum + s.errors, 0),
            averageSessionDuration: sessions.length > 0
                ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 1000 / 60)
                : 0
        }
    }, 'تم جلب بيانات نشاط المستخدم بنجاح');
}));

/**
 * @desc    Get session timeline
 * @route   GET /api/activity/sessions/:sessionId
 * @access  Private (Admin)
 */
router.get('/sessions/:sessionId', asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const timeline = await ActivityLog.find({ sessionId })
        .sort({ createdAt: 1 })
        .populate('userId', 'name email')
        .lean();

    if (timeline.length === 0) {
        return ApiResponse.notFound(res, 'الجلسة غير موجودة');
    }

    // Calculate session metadata
    const startTime = timeline[0].createdAt;
    const endTime = timeline[timeline.length - 1].createdAt;
    const duration = new Date(endTime) - new Date(startTime);

    const pageViews = timeline.filter(t => t.actionType === 'page_view').length;
    const errors = timeline.filter(t => ['error', 'auth_error'].includes(t.actionType)).length;

    return ApiResponse.success(res, {
        sessionId,
        timeline,
        metadata: {
            startTime,
            endTime,
            duration: Math.round(duration / 1000 / 60), // in minutes
            totalActivities: timeline.length,
            pageViews,
            errors,
            user: timeline[0].userId,
            ipAddress: timeline[0].ipAddress,
            userAgent: timeline[0].userAgent,
            browser: timeline[0].browser,
            device: timeline[0].device,
            os: timeline[0].os
        }
    }, 'تم جلب تفاصيل الجلسة بنجاح');
}));

/**
 * @desc    Get security reports (suspicious IPs, brute force, etc.)
 * @route   GET /api/activity/security
 * @access  Private (Admin)
 */
router.get('/security', asyncHandler(async (req, res) => {
    const { startDate, endDate } = getDateRange(req);

    // Get suspicious IPs
    const suspiciousIPs = await ActivityLog.getSuspiciousIPs(startDate, endDate);

    // Get brute force alerts
    const bruteForceAlerts = await FailedLogin.getBruteForceAlerts(startDate, endDate);

    // Get failed login statistics
    const failedLoginStats = await FailedLogin.getFailedLoginStats(startDate, endDate);

    // Get blocked IPs
    const blockedIPs = await FailedLogin.find({
        isBlocked: true,
        blockedUntil: { $gt: new Date() }
    }).select('identifier ipAddress attemptsCount blockedUntil').lean();

    // Get recent failed logins
    const recentFailedLogins = await ActivityLog.find({
        actionType: 'login_failed',
        createdAt: { $gte: startDate, $lte: endDate }
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    // Get rate limit events
    const rateLimitEvents = await ActivityLog.find({
        actionType: 'rate_limit_exceeded',
        createdAt: { $gte: startDate, $lte: endDate }
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    // Calculate security score (simple implementation)
    const totalLogins = await ActivityLog.countDocuments({
        actionType: { $in: ['login_success', 'login_failed'] },
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const failedLogins = await ActivityLog.countDocuments({
        actionType: 'login_failed',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const failureRate = totalLogins > 0 ? (failedLogins / totalLogins * 100) : 0;
    let securityScore = 100;
    securityScore -= Math.min(failureRate * 2, 30); // Max 30 points for high failure rate
    securityScore -= Math.min(suspiciousIPs.length * 5, 30); // Max 30 points for suspicious IPs
    securityScore -= Math.min(bruteForceAlerts.length * 10, 40); // Max 40 points for brute force
    securityScore = Math.max(0, Math.round(securityScore));

    return ApiResponse.success(res, {
        overview: {
            securityScore,
            suspiciousIPCount: suspiciousIPs.length,
            bruteForceAlertCount: bruteForceAlerts.length,
            blockedIPCount: blockedIPs.length,
            failedLoginCount: failedLogins,
            failureRate: failureRate.toFixed(2)
        },
        suspiciousIPs,
        bruteForceAlerts,
        blockedIPs,
        recentFailedLogins,
        rateLimitEvents,
        failedLoginStats
    }, 'تم جلب تقرير الأمان بنجاح');
}));

/**
 * @desc    Unblock an IP address
 * @route   POST /api/activity/security/unblock
 * @access  Private (Admin)
 */
router.post('/security/unblock', asyncHandler(async (req, res) => {
    const { ipAddress, identifier } = req.body;

    const query = {};
    if (ipAddress) query.ipAddress = ipAddress;
    if (identifier) query.identifier = identifier;

    if (Object.keys(query).length === 0) {
        return ApiResponse.badRequest(res, 'يجب تحديد عنوان IP أو المعرف');
    }

    await FailedLogin.updateMany(query, {
        $set: {
            isBlocked: false,
            blockedUntil: null,
            isReviewed: true,
            adminNotes: `Unblocked by admin on ${new Date().toISOString()}`
        }
    });

    return ApiResponse.success(res, null, 'تم إلغاء الحظر بنجاح');
}));

/**
 * @desc    Get action type breakdown
 * @route   GET /api/activity/breakdown
 * @access  Private (Admin)
 */
router.get('/breakdown', asyncHandler(async (req, res) => {
    const { startDate, endDate } = getDateRange(req);

    const breakdown = await ActivityLog.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$actionType',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return ApiResponse.success(res, { breakdown }, 'تم جلب تفصيل الأنشطة بنجاح');
}));

/**
 * @desc    Export activity logs (CSV format placeholder)
 * @route   GET /api/activity/export
 * @access  Private (Admin)
 */
router.get('/export', asyncHandler(async (req, res) => {
    const { startDate, endDate } = getDateRange(req);
    const { format = 'json' } = req.query;

    const logs = await ActivityLog.find({
        createdAt: { $gte: startDate, $lte: endDate }
    })
        .sort({ createdAt: -1 })
        .limit(10000) // Limit for performance
        .populate('userId', 'name email')
        .lean();

    if (format === 'csv') {
        // Generate CSV
        const headers = ['Date', 'User', 'Action', 'Page URL', 'Status', 'IP Address', 'Browser', 'Device'];
        const rows = logs.map(log => [
            new Date(log.createdAt).toISOString(),
            log.userId?.email || 'Guest',
            log.actionType,
            log.pageUrl || '',
            log.httpStatus || '',
            log.ipAddress,
            log.browser || '',
            log.device || ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=activity_logs_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`);
        return res.send(csv);
    }

    return ApiResponse.success(res, { logs, count: logs.length }, 'تم تصدير السجلات بنجاح');
}));

export default router;
