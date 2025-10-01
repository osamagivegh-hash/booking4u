import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Service from '../models/Service.js';
import Business from '../models/Business.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { logInfo, logError } from '../utils/logger.js';

const router = express.Router();

// PUBLIC ROUTES (no authentication required)

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
router.get('/service/:serviceId', asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return ApiResponse.notFound(res, 'الخدمة غير موجودة');
  }

  const query = {
    serviceId,
    isPublic: true,
    isVerified: true
  };

  // Filter by rating
  if (req.query.rating) {
    query.rating = parseInt(req.query.rating);
  }

  const reviews = await Review.find(query)
    .populate('customerId', 'name avatar')
    .populate('businessId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Calculate service average rating
  const serviceStats = await Review.aggregate([
    {
      $match: {
        serviceId: service._id,
        isPublic: true,
        isVerified: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const stats = serviceStats[0] || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  };

  // Calculate rating distribution
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats.ratingDistribution.forEach(rating => {
    if (ratingCounts[rating] !== undefined) {
      ratingCounts[rating]++;
    }
  });

  return ApiResponse.success(res, {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    serviceStats: {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalReviews: stats.totalReviews,
      ratingDistribution: ratingCounts
    }
  }, 'تم جلب تقييمات الخدمة بنجاح');
}));

// Apply authentication middleware to protected routes
router.use(protect);

// PROTECTED ROUTES (authentication required)

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Customers only)
router.post('/', [
  body('businessId')
    .isMongoId()
    .withMessage('معرف النشاط التجاري غير صحيح'),
  body('serviceId')
    .isMongoId()
    .withMessage('معرف الخدمة غير صحيح'),
  body('bookingId')
    .isMongoId()
    .withMessage('معرف الحجز غير صحيح'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون بين 1 و 5'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('التعليق يجب أن يكون بين 1 و 1000 حرف'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('عنوان التقييم لا يمكن أن يتجاوز 100 حرف'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('العلامات يجب أن تكون مصفوفة'),
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('قيمة المجهول غير صحيحة')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.validationError(res, errors.array(), 'بيانات غير صحيحة');
  }

  const {
    businessId,
    serviceId,
    bookingId,
    rating,
    comment,
    title,
    tags = [],
    anonymous = false
  } = req.body;

  // Check if user is a customer
  if (req.user.role !== 'customer') {
    return ApiResponse.forbidden(res, 'يمكن للعملاء فقط كتابة التقييمات');
  }

  // Check if business exists
  const business = await Business.findById(businessId);
  if (!business) {
    return ApiResponse.notFound(res, 'النشاط التجاري غير موجود');
  }

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return ApiResponse.notFound(res, 'الخدمة غير موجودة');
  }

  // Check if service belongs to the business
  if (service.businessId.toString() !== businessId) {
    return ApiResponse.badRequest(res, 'الخدمة لا تنتمي إلى النشاط التجاري المحدد');
  }

  // Create review
  const review = await Review.create({
    customerId: req.user._id,
    businessId,
    serviceId,
    bookingId,
    rating,
    comment,
    title,
    tags,
    anonymous
  });

  // Populate related data
  await review.populate([
    { path: 'customerId', select: 'name avatar' },
    { path: 'businessId', select: 'name' },
    { path: 'serviceId', select: 'name' }
  ]);

  // Update business average rating
  await Review.getAverageRating(businessId);

  logInfo('Review created successfully', {
    reviewId: review._id,
    businessId,
    serviceId,
    rating
  });

  return ApiResponse.created(res, { review }, 'تم إنشاء التقييم بنجاح');
}));

// @desc    Get reviews for a business
// @route   GET /api/reviews/business/:businessId
// @access  Public
router.get('/business/:businessId', asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if business exists
  const business = await Business.findById(businessId);
  if (!business) {
    return ApiResponse.notFound(res, 'النشاط التجاري غير موجود');
  }

  const query = {
    businessId,
    isPublic: true,
    isVerified: true
  };

  // Filter by rating
  if (req.query.rating) {
    query.rating = parseInt(req.query.rating);
  }

  // Filter by service
  if (req.query.serviceId) {
    query.serviceId = req.query.serviceId;
  }

  // Filter by verified reviews
  if (req.query.verified !== undefined) {
    query.isVerified = req.query.verified === 'true';
  }

  const reviews = await Review.find(query)
    .populate('customerId', 'name avatar')
    .populate('serviceId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Get average rating and statistics
  const stats = await Review.getAverageRating(businessId);

  return ApiResponse.success(res, {
    reviews,
    stats,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }, 'تم جلب التقييمات بنجاح');
}));


// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
router.get('/my-reviews', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { customerId: req.user._id };

  const reviews = await Review.find(query)
    .populate('businessId', 'name')
    .populate('serviceId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return ApiResponse.success(res, {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalReviews: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }, 'تم جلب تقييماتك بنجاح');
}));

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
router.put('/:id', [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون بين 1 و 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('التعليق يجب أن يكون بين 1 و 1000 حرف'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('عنوان التقييم لا يمكن أن يتجاوز 100 حرف'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('العلامات يجب أن تكون مصفوفة')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.validationError(res, errors.array(), 'بيانات غير صحيحة');
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return ApiResponse.notFound(res, 'التقييم غير موجود');
  }

  // Check if user owns the review
  if (review.customerId.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'لا يمكنك تعديل تقييم آخر');
  }

  const updateFields = {};
  if (req.body.rating !== undefined) updateFields.rating = req.body.rating;
  if (req.body.comment !== undefined) updateFields.comment = req.body.comment;
  if (req.body.title !== undefined) updateFields.title = req.body.title;
  if (req.body.tags !== undefined) updateFields.tags = req.body.tags;

  // Add to edit history if comment changed
  if (req.body.comment && req.body.comment !== review.comment) {
    updateFields.editHistory = [
      ...review.editHistory,
      {
        comment: review.comment,
        editedAt: new Date(),
        editedBy: req.user._id
      }
    ];
    updateFields.isEdited = true;
    updateFields.editedAt = new Date();
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  ).populate([
    { path: 'customerId', select: 'name avatar' },
    { path: 'businessId', select: 'name' },
    { path: 'serviceId', select: 'name' }
  ]);

  // Update business average rating
  await Review.getAverageRating(review.businessId);

  return ApiResponse.success(res, { review: updatedReview }, 'تم تحديث التقييم بنجاح');
}));

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner only)
router.delete('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return ApiResponse.notFound(res, 'التقييم غير موجود');
  }

  // Check if user owns the review
  if (review.customerId.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'لا يمكنك حذف تقييم آخر');
  }

  await Review.findByIdAndDelete(req.params.id);

  // Update business average rating
  await Review.getAverageRating(review.businessId);

  return ApiResponse.success(res, {}, 'تم حذف التقييم بنجاح');
}));

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return ApiResponse.notFound(res, 'التقييم غير موجود');
  }

  const userId = req.user._id;
  const isAlreadyHelpful = review.helpfulUsers.includes(userId);

  if (isAlreadyHelpful) {
    // Remove from helpful
    review.helpfulUsers = review.helpfulUsers.filter(id => id.toString() !== userId.toString());
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    // Add to helpful
    review.helpfulUsers.push(userId);
    review.helpfulCount += 1;
  }

  await review.save();

  return ApiResponse.success(res, {
    helpfulCount: review.helpfulCount,
    isHelpful: !isAlreadyHelpful
  }, isAlreadyHelpful ? 'تم إلغاء التقييم كمساعد' : 'تم التقييم كمساعد');
}));

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
router.post('/:id/report', [
  body('reason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('سبب البلاغ يجب أن يكون بين 1 و 500 حرف')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.validationError(res, errors.array(), 'بيانات غير صحيحة');
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return ApiResponse.notFound(res, 'التقييم غير موجود');
  }

  const userId = req.user._id;
  const alreadyReported = review.reportedBy.some(report => 
    report.userId.toString() === userId.toString()
  );

  if (alreadyReported) {
    return ApiResponse.badRequest(res, 'لقد أبلغت عن هذا التقييم مسبقاً');
  }

  review.reportedBy.push({
    userId,
    reason: req.body.reason,
    reportedAt: new Date()
  });
  review.reportCount += 1;

  await review.save();

  return ApiResponse.success(res, {}, 'تم إرسال البلاغ بنجاح');
}));

// @desc    Get business rating statistics
// @route   GET /api/reviews/stats/business/:businessId
// @access  Public
router.get('/stats/business/:businessId', asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  // Check if business exists
  const business = await Business.findById(businessId);
  if (!business) {
    return ApiResponse.notFound(res, 'النشاط التجاري غير موجود');
  }

  const stats = await Review.getAverageRating(businessId);

  return ApiResponse.success(res, { stats }, 'تم جلب إحصائيات التقييم بنجاح');
}));

export default router;

