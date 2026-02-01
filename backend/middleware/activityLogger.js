import ActivityLogger from '../utils/activityLogger.js';
import FailedLogin from '../models/FailedLogin.js';
import { logWarn } from '../utils/logger.js';

/**
 * Activity Logging Middleware
 * Global request logger for tracking all page views and API requests
 */

// List of paths to exclude from logging (static assets, health checks, etc.)
const EXCLUDED_PATHS = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/static/',
    '/assets/',
    '/uploads/',
    '/.well-known/',
    '/api/socket/stats',
    '/api/info',
    '/socket.io/'
];

// List of file extensions to exclude
const EXCLUDED_EXTENSIONS = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.map'
];

/**
 * Check if a path should be excluded from logging
 */
const shouldExcludePath = (path) => {
    // Check excluded paths
    for (const excluded of EXCLUDED_PATHS) {
        if (path.startsWith(excluded)) return true;
    }

    // Check file extensions
    for (const ext of EXCLUDED_EXTENSIONS) {
        if (path.endsWith(ext)) return true;
    }

    return false;
};

/**
 * Request Logger Middleware
 * Logs all incoming requests and their response times
 */
export const requestLogger = (req, res, next) => {
    // Skip if activity logging is disabled
    if (process.env.ENABLE_ACTIVITY_LOGGING === 'false') {
        return next();
    }

    // Skip excluded paths
    if (shouldExcludePath(req.path)) {
        return next();
    }

    const startTime = Date.now();

    // Override res.end to capture response details
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;

        // Log the request asynchronously
        setImmediate(() => {
            if (req.path.startsWith('/api/')) {
                ActivityLogger.logAPIRequest(req, res, responseTime);
            } else {
                ActivityLogger.logPageView(req, responseTime);
            }
        });

        originalEnd.apply(res, args);
    };

    next();
};

/**
 * Error Tracking Middleware
 * Captures and logs all errors with their HTTP status codes
 */
export const errorTracker = (err, req, res, next) => {
    // Determine the appropriate status code
    const statusCode = err.statusCode || err.status || 500;

    // Log the error activity
    ActivityLogger.logError(req, err, statusCode);

    // Pass to next error handler
    next(err);
};

/**
 * Login Rate Limiter Middleware
 * Prevents brute-force attacks by limiting login attempts
 */
export const loginRateLimiter = async (req, res, next) => {
    try {
        const ipAddress = ActivityLogger.getIPAddress(req);

        // Check if IP is blocked
        const isBlocked = await ActivityLogger.isIPBlocked(ipAddress);
        if (isBlocked) {
            ActivityLogger.logRateLimitExceeded(req);
            logWarn('Blocked IP attempted login', { ipAddress });

            return res.status(429).json({
                success: false,
                message: 'تم حظر عنوان IP الخاص بك مؤقتاً بسبب محاولات تسجيل دخول متعددة فاشلة. يرجى المحاولة لاحقاً.',
                retryAfter: 3600 // 1 hour in seconds
            });
        }

        // Check if the identifier (email) is under attack
        const email = req.body.email;
        if (email) {
            const isUnderAttack = await FailedLogin.isIdentifierUnderAttack(email);
            if (isUnderAttack) {
                logWarn('Identifier under attack', { email, ipAddress });
                // Add a small delay to slow down attacks
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        next();
    } catch (error) {
        // Don't block requests if rate limiting check fails
        console.error('Login rate limiter error:', error);
        next();
    }
};

/**
 * Session Tracker Middleware
 * Tracks session start and ensures session ID is set
 */
export const sessionTracker = (req, res, next) => {
    // Generate session ID if not present
    const sessionId = ActivityLogger.getSessionId(req);

    // Set session ID in response header for client to use
    res.setHeader('X-Session-ID', sessionId);

    // Store in request for other middleware to use
    req.sessionId = sessionId;

    next();
};

/**
 * Authentication Event Hooks
 * Functions to be called from auth routes
 */
export const authEventHooks = {
    /**
     * Call on successful login
     */
    onLoginSuccess: async (req, user) => {
        await ActivityLogger.logLoginSuccess(req, user);
    },

    /**
     * Call on failed login
     */
    onLoginFailed: async (req, identifier, reason) => {
        await ActivityLogger.logLoginFailed(req, identifier, reason);
    },

    /**
     * Call on logout
     */
    onLogout: async (req) => {
        await ActivityLogger.logLogout(req);
    },

    /**
     * Call on registration success
     */
    onRegisterSuccess: async (req, user) => {
        await ActivityLogger.log(req, 'login_success', {
            metadata: {
                email: user.email,
                role: user.role,
                isNewRegistration: true
            }
        });
    },

    /**
     * Call on auth validation error
     */
    onValidationError: async (req, errors) => {
        await ActivityLogger.logValidationError(req, errors);
    },

    /**
     * Call on auth error (401/403)
     */
    onAuthError: async (req, message, statusCode) => {
        await ActivityLogger.logAuthError(req, message, statusCode);
    }
};

/**
 * HTTP Status Tracker Middleware
 * Tracks specific HTTP error status codes (401, 403, 404, 500)
 */
export const httpStatusTracker = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
        // Track specific error status codes
        if (res.statusCode >= 400) {
            let actionType = 'error';
            let errorMessage = 'Request failed';

            // Parse body for error message if JSON
            try {
                const parsed = typeof body === 'string' ? JSON.parse(body) : body;
                errorMessage = parsed.message || errorMessage;
            } catch (e) {
                // Not JSON, use default message
            }

            switch (res.statusCode) {
                case 401:
                    actionType = 'auth_error';
                    break;
                case 403:
                    actionType = 'auth_error';
                    break;
                case 404:
                    actionType = 'error';
                    errorMessage = 'Resource not found';
                    break;
                case 429:
                    actionType = 'rate_limit_exceeded';
                    break;
                default:
                    if (res.statusCode >= 500) {
                        actionType = 'error';
                        errorMessage = 'Server error';
                    }
            }

            // Log asynchronously
            setImmediate(() => {
                ActivityLogger.log(req, actionType, {
                    httpStatus: res.statusCode,
                    errorMessage
                });
            });
        }

        return originalSend.call(this, body);
    };

    next();
};

export default {
    requestLogger,
    errorTracker,
    loginRateLimiter,
    sessionTracker,
    authEventHooks,
    httpStatusTracker
};
