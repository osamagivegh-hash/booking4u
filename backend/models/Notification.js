const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'عنوان الإشعار مطلوب'],
    trim: true,
    maxlength: [200, 'عنوان الإشعار لا يمكن أن يتجاوز 200 حرف']
  },
  message: {
    type: String,
    required: [true, 'محتوى الإشعار مطلوب'],
    trim: true,
    maxlength: [500, 'محتوى الإشعار لا يمكن أن يتجاوز 500 حرف']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'booking',      // حجز جديد/تحديث
      'message',      // رسالة جديدة
      'review',       // تقييم جديد
      'system',       // إشعار نظام
      'promotion',    // عرض/ترويج
      'reminder',     // تذكير
      'error'         // خطأ
    ],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    maxlength: [500, 'رابط الإجراء لا يمكن أن يتجاوز 500 حرف']
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted time
notificationSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const diffInMinutes = Math.floor((now - this.createdAt) / (1000 * 60));

  if (diffInMinutes < 1) return 'الآن';
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
  if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
  return this.createdAt.toLocaleDateString('ar-SA');
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type,
    isRead,
    priority
  } = options;

  let query = { userId };

  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead;
  if (priority) query.priority = priority;

  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Pre-save middleware to set expiration for certain types
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration for different notification types
    switch (this.type) {
      case 'promotion':
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'reminder':
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'system':
        this.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);




