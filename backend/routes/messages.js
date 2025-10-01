import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import User from '../models/User.js';
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/apiResponse');
const { logInfo, logError } = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
router.post('/', [
  body('receiverId')
    .isMongoId()
    .withMessage('معرف المستلم غير صحيح'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('موضوع الرسالة يجب أن يكون بين 1 و 200 حرف'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('محتوى الرسالة يجب أن يكون بين 1 و 2000 حرف'),
  body('messageType')
    .optional()
    .isIn(['inquiry', 'booking_related', 'general', 'support'])
    .withMessage('نوع الرسالة غير صحيح'),
  body('relatedBookingId')
    .optional()
    .isMongoId()
    .withMessage('معرف الحجز غير صحيح'),
  body('relatedServiceId')
    .optional()
    .isMongoId()
    .withMessage('معرف الخدمة غير صحيح'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('أولوية الرسالة غير صحيحة'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('معرف الرسالة المراد الرد عليها غير صحيح')
], asyncHandler(async (req, res) => {
  console.log('📤 Message creation request:', {
    body: req.body,
    user: req.user?._id,
    timestamp: new Date().toISOString()
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return ApiResponse.validationError(res, errors.array(), 'بيانات غير صحيحة');
  }

  const {
    receiverId,
    subject,
    content,
    messageType = 'general',
    relatedBookingId,
    relatedServiceId,
    priority = 'normal',
    replyTo,
    tags = []
  } = req.body;

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return ApiResponse.notFound(res, 'المستخدم غير موجود');
  }

  // Check if receiver is active
  if (!receiver.isActive) {
    return ApiResponse.badRequest(res, 'لا يمكن إرسال رسالة إلى مستخدم معطل');
  }

  // Create message
  let message;
  try {
    message = await Message.create({
      senderId: req.user._id,
      receiverId,
      subject,
      content,
      messageType,
      relatedBookingId,
      relatedServiceId,
      priority,
      replyTo,
      tags
    });
    
    console.log('✅ Message created successfully:', message._id);
  } catch (createError) {
    console.error('❌ Error creating message:', createError);
    return ApiResponse.serverError(res, 'خطأ في إنشاء الرسالة');
  }

  // Populate sender and receiver details
  await message.populate([
    { path: 'senderId', select: 'name email avatar' },
    { path: 'receiverId', select: 'name email avatar' }
  ]);

  // Note: Real-time notifications removed - using REST API only
  console.log(`📤 Message sent successfully to receiver: ${receiverId}`);

  logInfo('Message sent successfully', {
    messageId: message._id,
    senderId: req.user._id,
    receiverId,
    subject: subject.substring(0, 50)
  });

  return ApiResponse.created(res, { message }, 'تم إرسال الرسالة بنجاح');
}));

// @desc    Get user's inbox (received messages)
// @route   GET /api/messages/inbox
// @access  Private
router.get('/inbox', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    receiverId: req.user._id,
    isDeleted: false
  };

  console.log(`📥 Fetching inbox for user: ${req.user._id}`);
  console.log(`📥 Query:`, query);

  // Filter by read status
  if (req.query.read !== undefined) {
    query.isRead = req.query.read === 'true';
  }

  // Filter by message type
  if (req.query.type) {
    query.messageType = req.query.type;
  }

  // Filter by priority
  if (req.query.priority) {
    query.priority = req.query.priority;
  }

  const messages = await Message.find(query)
    .populate('senderId', 'name email avatar')
    .populate('relatedBookingId', 'date startTime endTime')
    .populate('relatedServiceId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  console.log(`📥 Found ${messages.length} messages for user ${req.user._id}`);
  console.log(`📥 Total messages: ${total}`);

  return ApiResponse.success(res, {
    messages,
    pagination: {
      currentPage: page,
      totalPages,
      totalMessages: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }, 'تم جلب الرسائل الواردة بنجاح');
}));

// @desc    Get user's sent messages
// @route   GET /api/messages/sent
// @access  Private
router.get('/sent', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    senderId: req.user._id,
    isDeleted: false
  };

  console.log(`📤 Fetching sent messages for user: ${req.user._id}`);
  console.log(`📤 Query:`, query);

  // Filter by message type
  if (req.query.type) {
    query.messageType = req.query.type;
  }

  const messages = await Message.find(query)
    .populate('receiverId', 'name email avatar')
    .populate('relatedBookingId', 'date startTime endTime')
    .populate('relatedServiceId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  console.log(`📤 Found ${messages.length} sent messages for user ${req.user._id}`);
  console.log(`📤 Total sent messages: ${total}`);

  return ApiResponse.success(res, {
    messages,
    pagination: {
      currentPage: page,
      totalPages,
      totalMessages: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }, 'تم جلب الرسائل المرسلة بنجاح');
}));

// @desc    Get message thread/conversation
// @route   GET /api/messages/thread/:threadId
// @access  Private
router.get('/thread/:threadId', asyncHandler(async (req, res) => {
  const { threadId } = req.params;

  const messages = await Message.find({
    $or: [
      { _id: threadId },
      { threadId: threadId }
    ],
    isDeleted: false,
    $or: [
      { senderId: req.user._id },
      { receiverId: req.user._id }
    ]
  })
    .populate('senderId', 'name email avatar')
    .populate('receiverId', 'name email avatar')
    .populate('relatedBookingId', 'date startTime endTime')
    .populate('relatedServiceId', 'name')
    .sort({ createdAt: 1 });

  if (messages.length === 0) {
    return ApiResponse.notFound(res, 'المحادثة غير موجودة');
  }

  return ApiResponse.success(res, { messages }, 'تم جلب المحادثة بنجاح');
}));

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', asyncHandler(async (req, res) => {
  const message = await Message.findOne({
    _id: req.params.id,
    receiverId: req.user._id,
    isDeleted: false
  });

  if (!message) {
    return ApiResponse.notFound(res, 'الرسالة غير موجودة');
  }

  if (!message.isRead) {
    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Note: Real-time read receipts removed - using REST API only
    console.log(`📖 Message ${message._id} marked as read by ${req.user._id}`);
  }

  return ApiResponse.success(res, { message }, 'تم تحديث حالة الرسالة بنجاح');
}));

// @desc    Mark multiple messages as read
// @route   PUT /api/messages/read-multiple
// @access  Private
router.put('/read-multiple', [
  body('messageIds')
    .isArray({ min: 1 })
    .withMessage('يجب تحديد رسائل واحدة على الأقل'),
  body('messageIds.*')
    .isMongoId()
    .withMessage('معرف الرسالة غير صحيح')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.validationError(res, errors.array(), 'بيانات غير صحيحة');
  }

  const { messageIds } = req.body;

  const result = await Message.updateMany(
    {
      _id: { $in: messageIds },
      receiverId: req.user._id,
      isDeleted: false,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  return ApiResponse.success(res, {
    updatedCount: result.modifiedCount
  }, `تم تحديث ${result.modifiedCount} رسالة بنجاح`);
}));

// @desc    Delete message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const message = await Message.findOne({
    _id: req.params.id,
    $or: [
      { senderId: req.user._id },
      { receiverId: req.user._id }
    ],
    isDeleted: false
  });

  if (!message) {
    return ApiResponse.notFound(res, 'الرسالة غير موجودة');
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = req.user._id;
  await message.save();

  return ApiResponse.success(res, {}, 'تم حذف الرسالة بنجاح');
}));

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiverId: req.user._id,
    isRead: false,
    isDeleted: false
  });

  return ApiResponse.success(res, { unreadCount: count }, 'تم جلب عدد الرسائل غير المقروءة بنجاح');
}));

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
router.get('/search', asyncHandler(async (req, res) => {
  const { q: searchQuery, type, priority, dateFrom, dateTo } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { senderId: req.user._id },
      { receiverId: req.user._id }
    ],
    isDeleted: false
  };

  // Text search
  if (searchQuery) {
    query.$or = [
      { subject: { $regex: searchQuery, $options: 'i' } },
      { content: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  // Filter by message type
  if (type) {
    query.messageType = type;
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const messages = await Message.find(query)
    .populate('senderId', 'name email avatar')
    .populate('receiverId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return ApiResponse.success(res, {
    messages,
    pagination: {
      currentPage: page,
      totalPages,
      totalMessages: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }, 'تم البحث في الرسائل بنجاح');
}));

module.exports = router;
