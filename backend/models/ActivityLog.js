import mongoose from 'mongoose';

/**
 * Activity Log Schema
 * Tracks user activity events including authentication, navigation, and errors
 */
const activityLogSchema = new mongoose.Schema({
    // User identification (nullable for guest/unauthenticated users)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },

    // Session identifier for tracking user journey
    sessionId: {
        type: String,
        required: true,
        index: true
    },

    // Type of action performed
    actionType: {
        type: String,
        required: true,
        enum: [
            'login_success',
            'login_failed',
            'logout',
            'page_view',
            'api_request',
            'error',
            'validation_error',
            'auth_error',
            'rate_limit_exceeded',
            'session_start',
            'session_end'
        ],
        index: true
    },

    // Page/Route information
    pageUrl: {
        type: String,
        default: null
    },

    routeName: {
        type: String,
        default: null
    },

    // HTTP method (GET, POST, PUT, DELETE, etc.)
    httpMethod: {
        type: String,
        default: null
    },

    // HTTP status code
    httpStatus: {
        type: Number,
        default: null
    },

    // Error message (for error events)
    errorMessage: {
        type: String,
        default: null
    },

    // Error code (for error events)
    errorCode: {
        type: String,
        default: null
    },

    // Request metadata
    ipAddress: {
        type: String,
        required: true,
        index: true
    },

    userAgent: {
        type: String,
        default: null
    },

    // Parsed user agent info
    browser: {
        type: String,
        default: null
    },

    device: {
        type: String,
        default: null
    },

    os: {
        type: String,
        default: null
    },

    // Request/Response timing
    responseTime: {
        type: Number, // milliseconds
        default: null
    },

    // Additional metadata (flexible for future extensions)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    // Enable TTL index for automatic cleanup (default: 90 days)
    expireAfterSeconds: process.env.ACTIVITY_LOG_TTL_DAYS
        ? parseInt(process.env.ACTIVITY_LOG_TTL_DAYS) * 24 * 60 * 60
        : 90 * 24 * 60 * 60
});

// Compound indexes for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ sessionId: 1, createdAt: 1 });
activityLogSchema.index({ actionType: 1, createdAt: -1 });
activityLogSchema.index({ ipAddress: 1, createdAt: -1 });
activityLogSchema.index({ httpStatus: 1, createdAt: -1 });

// TTL index for automatic cleanup
activityLogSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: process.env.ACTIVITY_LOG_TTL_DAYS
        ? parseInt(process.env.ACTIVITY_LOG_TTL_DAYS) * 24 * 60 * 60
        : 90 * 24 * 60 * 60
});

// Static methods for analytics
activityLogSchema.statics.getLoginStats = async function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                actionType: { $in: ['login_success', 'login_failed'] },
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$actionType',
                count: { $sum: 1 }
            }
        }
    ]);
};

activityLogSchema.statics.getTopPages = async function (startDate, endDate, limit = 10) {
    return this.aggregate([
        {
            $match: {
                actionType: 'page_view',
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$pageUrl',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

activityLogSchema.statics.getActiveUsersPerDay = async function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                userId: { $ne: null },
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    userId: '$userId'
                }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                uniqueUsers: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

activityLogSchema.statics.getErrorRate = async function (startDate, endDate) {
    const total = await this.countDocuments({
        actionType: 'api_request',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const errors = await this.countDocuments({
        actionType: 'error',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    return {
        total,
        errors,
        errorRate: total > 0 ? ((errors / total) * 100).toFixed(2) : 0
    };
};

activityLogSchema.statics.getUserSessionTimeline = async function (userId, sessionId) {
    return this.find({
        userId,
        sessionId
    }).sort({ createdAt: 1 });
};

activityLogSchema.statics.getSuspiciousIPs = async function (startDate, endDate, threshold = 10) {
    return this.aggregate([
        {
            $match: {
                actionType: 'login_failed',
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$ipAddress',
                failedAttempts: { $sum: 1 },
                lastAttempt: { $max: '$createdAt' }
            }
        },
        {
            $match: {
                failedAttempts: { $gte: threshold }
            }
        },
        { $sort: { failedAttempts: -1 } }
    ]);
};

export default mongoose.model('ActivityLog', activityLogSchema);
