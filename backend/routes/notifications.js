import express from 'express';
const router = express.Router();
const { protect } = require('../middleware/auth');
import Notification from '../models/Notification.js';
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    type,
    isRead,
    priority
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.getUserNotifications(req.user.id, {
    limit: parseInt(limit),
    skip,
    type,
    isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
    priority
  });

  const total = await Notification.countDocuments({
    userId: req.user.id,
    ...(type && { type }),
    ...(isRead !== undefined && { isRead: isRead === 'true' }),
    ...(priority && { priority })
  });

  return ApiResponse.success(res, {
    notifications,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  }, 'تم جلب الإشعارات بنجاح');
}));

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user.id);
  
  return ApiResponse.success(res, { count }, 'تم جلب عدد الإشعارات غير المقروءة بنجاح');
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!notification) {
    return ApiResponse.error(res, 'الإشعار غير موجود', 404);
  }

  await notification.markAsRead();

  return ApiResponse.success(res, { notification }, 'تم تحديد الإشعار كمقروء بنجاح');
}));

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', protect, asyncHandler(async (req, res) => {
  const result = await Notification.markAllAsRead(req.user.id);
  
  return ApiResponse.success(res, { 
    modifiedCount: result.modifiedCount 
  }, 'تم تحديد جميع الإشعارات كمقروءة بنجاح');
}));

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!notification) {
    return ApiResponse.error(res, 'الإشعار غير موجود', 404);
  }

  return ApiResponse.success(res, null, 'تم حذف الإشعار بنجاح');
}));

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
router.delete('/', protect, asyncHandler(async (req, res) => {
  const { type, isRead } = req.query;
  
  let query = { userId: req.user.id };
  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const result = await Notification.deleteMany(query);
  
  return ApiResponse.success(res, { 
    deletedCount: result.deletedCount 
  }, 'تم حذف الإشعارات بنجاح');
}));

// @desc    Create notification (for system use)
// @route   POST /api/notifications
// @access  Private (Admin/System)
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    userId,
    title,
    message,
    type = 'system',
    actionUrl,
    actionData,
    priority = 'medium',
    metadata
  } = req.body;

  // Check if user is admin or creating notification for themselves
  if (req.user.role !== 'admin' && userId !== req.user.id) {
    return ApiResponse.error(res, 'غير مصرح لك بإنشاء إشعارات لآخرين', 403);
  }

  const notification = await Notification.createNotification({
    userId,
    title,
    message,
    type,
    actionUrl,
    actionData,
    priority,
    metadata
  });

  return ApiResponse.success(res, { notification }, 'تم إنشاء الإشعار بنجاح', 201);
}));

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const stats = await Notification.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } },
        byType: {
          $push: {
            type: '$type',
            isRead: '$isRead'
          }
        }
      }
    }
  ]);

  const result = stats[0] || { total: 0, unread: 0, byType: [] };
  
  // Group by type
  const typeStats = result.byType.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = { total: 0, unread: 0 };
    }
    acc[item.type].total++;
    if (!item.isRead) acc[item.type].unread++;
    return acc;
  }, {});

  return ApiResponse.success(res, {
    total: result.total,
    unread: result.unread,
    byType: typeStats
  }, 'تم جلب إحصائيات الإشعارات بنجاح');
}));

module.exports = router;




