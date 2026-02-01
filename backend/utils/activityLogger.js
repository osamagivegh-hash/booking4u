import ActivityLog from '../models/ActivityLog.js';
import FailedLogin from '../models/FailedLogin.js';
import { logInfo, logError } from './logger.js';

/**
 * Activity Logger Service
 * Provides non-blocking, async logging for user activities
 * 
 * Features:
 * - Async/non-blocking logging to prevent request delays
 * - User agent parsing
 * - IP address handling
 * - Session tracking
 * - Configurable via environment variables
 */

// Check if activity logging is enabled
const isLoggingEnabled = () => {
    return process.env.ENABLE_ACTIVITY_LOGGING !== 'false';
};

// Check if we should exclude admin activities
const shouldExcludeAdmin = (user) => {
    if (process.env.EXCLUDE_ADMIN_FROM_LOGS === 'true') {
        return user?.role === 'admin' || user?.role === 'superadmin';
    }
    return false;
};

// Parse user agent string
const parseUserAgent = (userAgentString) => {
    if (!userAgentString) return { browser: null, device: null, os: null };

    let browser = 'Unknown';
    let device = 'Desktop';
    let os = 'Unknown';

    // Browser detection
    if (userAgentString.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgentString.includes('Chrome')) {
        browser = 'Chrome';
    } else if (userAgentString.includes('Safari') && !userAgentString.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgentString.includes('Edge')) {
        browser = 'Edge';
    } else if (userAgentString.includes('Opera') || userAgentString.includes('OPR')) {
        browser = 'Opera';
    } else if (userAgentString.includes('MSIE') || userAgentString.includes('Trident')) {
        browser = 'Internet Explorer';
    }

    // Device detection
    if (userAgentString.includes('Mobile') || userAgentString.includes('Android')) {
        device = 'Mobile';
    } else if (userAgentString.includes('Tablet') || userAgentString.includes('iPad')) {
        device = 'Tablet';
    }

    // OS detection
    if (userAgentString.includes('Windows')) {
        os = 'Windows';
    } else if (userAgentString.includes('Mac OS')) {
        os = 'macOS';
    } else if (userAgentString.includes('Linux')) {
        os = 'Linux';
    } else if (userAgentString.includes('Android')) {
        os = 'Android';
    } else if (userAgentString.includes('iOS') || userAgentString.includes('iPhone') || userAgentString.includes('iPad')) {
        os = 'iOS';
    }

    return { browser, device, os };
};

// Get real IP address from request
const getIPAddress = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown';
};

// Hash IP address for privacy (optional)
const hashIP = (ip) => {
    if (process.env.HASH_IP_ADDRESSES === 'true') {
        // Simple hash - in production, use a proper hashing library
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    }
    return ip;
};

// Generate or get session ID
const getSessionId = (req) => {
    // Check for existing session ID in headers or cookies
    if (req.headers['x-session-id']) {
        return req.headers['x-session-id'];
    }
    if (req.cookies?.sessionId) {
        return req.cookies.sessionId;
    }
    // Generate a new session ID if none exists
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Map route to human-readable name
const getRouteName = (path, method) => {
    const routeMap = {
        'GET /api/auth/me': 'Get Current User',
        'POST /api/auth/login': 'User Login',
        'POST /api/auth/register': 'User Registration',
        'POST /api/auth/logout': 'User Logout',
        'GET /api/bookings': 'View Bookings',
        'POST /api/bookings': 'Create Booking',
        'GET /api/services': 'View Services',
        'GET /api/businesses': 'View Businesses',
        'GET /api/users': 'View Users',
        'GET /api/messages': 'View Messages',
        'GET /api/notifications': 'View Notifications'
    };

    const key = `${method} ${path}`;

    // Check for exact match first
    if (routeMap[key]) return routeMap[key];

    // Check for partial match (for parameterized routes)
    for (const [route, name] of Object.entries(routeMap)) {
        const routeParts = route.split(' ');
        const routeMethod = routeParts[0];
        const routePath = routeParts[1];

        if (method === routeMethod && path.startsWith(routePath.replace(/:\w+/g, ''))) {
            return name;
        }
    }

    return null;
};

/**
 * Main Activity Logger Class
 */
class ActivityLogger {
    /**
     * Log a generic activity
     */
    static async log(req, actionType, options = {}) {
        if (!isLoggingEnabled()) return;
        if (shouldExcludeAdmin(req.user)) return;

        try {
            const userAgent = req.headers['user-agent'];
            const { browser, device, os } = parseUserAgent(userAgent);
            const ipAddress = process.env.HASH_IP_ADDRESSES === 'true'
                ? hashIP(getIPAddress(req))
                : getIPAddress(req);

            const logData = {
                userId: req.user?._id || null,
                sessionId: getSessionId(req),
                actionType,
                pageUrl: options.pageUrl || req.originalUrl,
                routeName: options.routeName || getRouteName(req.path, req.method),
                httpMethod: req.method,
                httpStatus: options.httpStatus || null,
                errorMessage: options.errorMessage || null,
                errorCode: options.errorCode || null,
                ipAddress,
                userAgent,
                browser,
                device,
                os,
                responseTime: options.responseTime || null,
                metadata: options.metadata || {}
            };

            // Non-blocking save
            setImmediate(async () => {
                try {
                    await ActivityLog.create(logData);
                } catch (err) {
                    logError('Activity logging failed', { error: err.message, actionType });
                }
            });

        } catch (error) {
            logError('Activity logger error', { error: error.message });
        }
    }

    /**
     * Log successful login
     */
    static async logLoginSuccess(req, user) {
        await this.log(req, 'login_success', {
            metadata: {
                email: user.email,
                role: user.role
            }
        });
        logInfo('Login success logged', { userId: user._id, email: user.email });
    }

    /**
     * Log failed login
     */
    static async logLoginFailed(req, identifier, reason = 'invalid_credentials') {
        await this.log(req, 'login_failed', {
            errorMessage: reason,
            metadata: {
                identifier
            }
        });

        // Also record in FailedLogin collection for brute-force detection
        try {
            await FailedLogin.recordFailedAttempt(
                identifier,
                getIPAddress(req),
                reason === 'invalid_credentials' ? 'invalid_password' : reason,
                req.headers['user-agent']
            );
        } catch (error) {
            logError('Failed to record failed login', { error: error.message });
        }

        logInfo('Login failure logged', { identifier, reason });
    }

    /**
     * Log logout
     */
    static async logLogout(req) {
        await this.log(req, 'logout');
        logInfo('Logout logged', { userId: req.user?._id });
    }

    /**
     * Log page view
     */
    static async logPageView(req, responseTime = null) {
        await this.log(req, 'page_view', {
            responseTime,
            httpStatus: 200
        });
    }

    /**
     * Log API request
     */
    static async logAPIRequest(req, res, responseTime = null) {
        await this.log(req, 'api_request', {
            httpStatus: res.statusCode,
            responseTime
        });
    }

    /**
     * Log error
     */
    static async logError(req, error, statusCode = 500) {
        await this.log(req, 'error', {
            httpStatus: statusCode,
            errorMessage: error.message,
            errorCode: error.code || 'UNKNOWN_ERROR',
            metadata: {
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
        logError('Error activity logged', {
            statusCode,
            message: error.message,
            path: req.originalUrl
        });
    }

    /**
     * Log validation error
     */
    static async logValidationError(req, errors) {
        await this.log(req, 'validation_error', {
            httpStatus: 400,
            errorMessage: 'Validation failed',
            metadata: {
                errors: errors
            }
        });
    }

    /**
     * Log authentication error
     */
    static async logAuthError(req, message, statusCode = 401) {
        await this.log(req, 'auth_error', {
            httpStatus: statusCode,
            errorMessage: message
        });
    }

    /**
     * Log rate limit exceeded
     */
    static async logRateLimitExceeded(req) {
        await this.log(req, 'rate_limit_exceeded', {
            httpStatus: 429,
            errorMessage: 'Rate limit exceeded'
        });
    }

    /**
     * Log session start
     */
    static async logSessionStart(req) {
        await this.log(req, 'session_start');
    }

    /**
     * Log session end
     */
    static async logSessionEnd(req) {
        await this.log(req, 'session_end');
    }

    /**
     * Check if IP is blocked
     */
    static async isIPBlocked(ipAddress) {
        try {
            return await FailedLogin.isIPBlocked(ipAddress);
        } catch (error) {
            logError('Failed to check IP block status', { error: error.message });
            return false;
        }
    }

    /**
     * Get IP address from request (exposed for external use)
     */
    static getIPAddress(req) {
        return getIPAddress(req);
    }

    /**
     * Get session ID from request (exposed for external use)
     */
    static getSessionId(req) {
        return getSessionId(req);
    }
}

export default ActivityLogger;
export { getIPAddress, getSessionId, parseUserAgent };
