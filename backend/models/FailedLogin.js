import mongoose from 'mongoose';

/**
 * Failed Login Schema
 * Tracks failed login attempts for brute-force detection and security monitoring
 */
const failedLoginSchema = new mongoose.Schema({
    // Identifier (email or username used in attempt)
    identifier: {
        type: String,
        required: true,
        index: true
    },

    // IP address of the attacker
    ipAddress: {
        type: String,
        required: true,
        index: true
    },

    // Reason for failure
    reason: {
        type: String,
        required: true,
        enum: [
            'invalid_email',
            'invalid_password',
            'account_disabled',
            'account_locked',
            'rate_limited',
            'invalid_token',
            'unknown'
        ]
    },

    // Cumulative count of attempts from this IP for this identifier
    attemptsCount: {
        type: Number,
        default: 1
    },

    // First attempt timestamp
    firstAttemptAt: {
        type: Date,
        default: Date.now
    },

    // Last attempt timestamp
    lastAttemptAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    // User agent of the attacker
    userAgent: {
        type: String,
        default: null
    },

    // Whether this IP/identifier combo has been flagged as suspicious
    isSuspicious: {
        type: Boolean,
        default: false,
        index: true
    },

    // Whether this has been reviewed by admin
    isReviewed: {
        type: Boolean,
        default: false
    },

    // Admin notes
    adminNotes: {
        type: String,
        default: null
    },

    // Block status
    isBlocked: {
        type: Boolean,
        default: false,
        index: true
    },

    blockedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
failedLoginSchema.index({ identifier: 1, ipAddress: 1 });
failedLoginSchema.index({ createdAt: -1 });
failedLoginSchema.index({ attemptsCount: -1 });

// Static method to record a failed login attempt
failedLoginSchema.statics.recordFailedAttempt = async function (identifier, ipAddress, reason, userAgent) {
    const existingRecord = await this.findOne({
        identifier,
        ipAddress,
        // Only consider records within the last 24 hours
        lastAttemptAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingRecord) {
        existingRecord.attemptsCount += 1;
        existingRecord.lastAttemptAt = new Date();
        existingRecord.reason = reason;
        if (userAgent) existingRecord.userAgent = userAgent;

        // Auto-flag as suspicious if attempts exceed threshold
        if (existingRecord.attemptsCount >= 5) {
            existingRecord.isSuspicious = true;
        }

        // Auto-block if attempts exceed critical threshold
        if (existingRecord.attemptsCount >= 10) {
            existingRecord.isBlocked = true;
            existingRecord.blockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour block
        }

        return existingRecord.save();
    }

    return this.create({
        identifier,
        ipAddress,
        reason,
        userAgent,
        attemptsCount: 1,
        firstAttemptAt: new Date(),
        lastAttemptAt: new Date()
    });
};

// Check if IP is blocked
failedLoginSchema.statics.isIPBlocked = async function (ipAddress) {
    const blockedRecord = await this.findOne({
        ipAddress,
        isBlocked: true,
        blockedUntil: { $gt: new Date() }
    });

    return !!blockedRecord;
};

// Check if identifier is under attack
failedLoginSchema.statics.isIdentifierUnderAttack = async function (identifier) {
    const recentAttempts = await this.countDocuments({
        identifier,
        lastAttemptAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
    });

    return recentAttempts >= 5;
};

// Get brute force alerts
failedLoginSchema.statics.getBruteForceAlerts = async function (startDate, endDate) {
    return this.find({
        isSuspicious: true,
        lastAttemptAt: { $gte: startDate, $lte: endDate }
    }).sort({ attemptsCount: -1 });
};

// Get failed login statistics
failedLoginSchema.statics.getFailedLoginStats = async function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                lastAttemptAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$reason',
                count: { $sum: '$attemptsCount' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Clear old records (for manual cleanup if needed)
failedLoginSchema.statics.clearOldRecords = async function (daysOld = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    return this.deleteMany({
        lastAttemptAt: { $lt: cutoffDate },
        isBlocked: false
    });
};

export default mongoose.model('FailedLogin', failedLoginSchema);
