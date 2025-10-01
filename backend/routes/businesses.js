import express from 'express';
import { body, validationResult } from 'express-validator';
import Business from '../models/Business.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { isActive: true };
    if (category) query.category = category;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const businesses = await Business.find(query)
      .populate('ownerId', 'name email phone')
      .sort({ rating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Business.countDocuments(query);

    res.json({
      success: true,
      count: businesses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: businesses
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الأعمال التجارية'
    });
  }
});

// @desc    Check if user has a business
// @route   GET /api/businesses/check-business
// @access  Private (All authenticated users)
router.get('/check-business', [
  protect
], async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id })
      .populate('ownerId', 'name email phone');

    if (business) {
      res.json({
        success: true,
        hasBusiness: true,
        data: business
      });
    } else {
      res.json({
        success: true,
        hasBusiness: false,
        data: null
      });
    }
  } catch (error) {
    console.error('Check business error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من النشاط التجاري'
    });
  }
});

// @desc    Get user's business for service creation
// @route   GET /api/businesses/for-service
// @access  Private (Business owners only)
router.get('/for-service', [
  protect
], async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id })
      .select('_id name category');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'يجب إنشاء نشاط تجاري أولاً قبل إضافة الخدمات'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Get business for service error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات النشاط التجاري'
    });
  }
});

// @desc    Search businesses
// @route   GET /api/businesses/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, city, minRating, limit = 20 } = req.query;

    console.log('🔍 Business search request:', { q, category, city, minRating, limit });

    // Check if Business model is available
    if (!Business) {
      console.error('❌ Business model not available');
      return res.status(500).json({
        success: false,
        message: 'خطأ في جلب النشاط التجاري',
        error: 'Business model not available'
      });
    }

    let query = { isActive: true };

    // Text search - use regex instead of $text for better compatibility
    if (q && q.trim()) {
      const searchTerm = q.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // City filter
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    console.log('🔍 Business search query:', JSON.stringify(query, null, 2));

    // Execute query with better error handling
    let businesses = [];
    try {
      businesses = await Business.find(query)
        .populate('ownerId', 'name email phone')
        .limit(parseInt(limit))
        .sort({ rating: -1, totalReviews: -1 });
      
      console.log(`✅ Found ${businesses.length} businesses`);
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      console.error('❌ Database error details:', {
        message: dbError.message,
        stack: dbError.stack,
        query: query
      });
      
      // Return empty results instead of error
      businesses = [];
    }

    res.json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    console.error('❌ Search businesses error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث عن الأعمال التجارية',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single business
// @route   GET /api/businesses/:businessId
// @access  Public
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findOne({
      _id: businessId,
      isActive: true
    }).populate('ownerId', 'name email phone');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب النشاط التجاري'
    });
  }
});

// @desc    Create new business
// @route   POST /api/businesses
// @access  Private (All authenticated users)
router.post('/', [
  protect,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم النشاط التجاري يجب أن يكون بين 2 و 100 حرف'),
  body('category')
    .isIn([
      'clinic', 'salon', 'spa', 'gym', 'restaurant', 
      'consultation', 'education', 'other'
    ])
    .withMessage('فئة النشاط التجاري غير صحيحة'),
  body('phone')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('يرجى إدخال رقم هاتف صحيح'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('المدينة مطلوبة')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add logging to debug the issue
    console.log('Create business - User ID:', req.user._id);
    console.log('Create business - User:', req.user);
    console.log('Create business - Request body:', req.body);

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ ownerId: req.user._id });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'لديك نشاط تجاري مسجل مسبقاً'
      });
    }

    const businessData = {
      ...req.body,
      ownerId: req.user._id
    };

    console.log('Business data to create:', businessData);

    const business = await Business.create(businessData);

    console.log('Created business:', business);

    // Update user role to 'business' if it's not already
    if (req.user.role !== 'business') {
      // User is already imported at the top
      await User.findByIdAndUpdate(req.user._id, { role: 'business' });
      console.log('Updated user role to business');
      
      // Update the user object in the request for subsequent operations
      req.user.role = 'business';
    }

    await business.populate('ownerId', 'name email phone');

    console.log('Populated business:', business);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء النشاط التجاري بنجاح',
      data: business
    });
  } catch (error) {
    console.error('Create business error:', error);
    console.error('Error details:', {
      userId: req.user?._id,
      userRole: req.user?.role,
      requestBody: req.body,
      errorMessage: error.message,
      errorStack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء النشاط التجاري',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update business
// @route   PUT /api/businesses/:businessId
// @access  Private (Business owners only)
router.put('/:businessId', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم النشاط التجاري يجب أن يكون بين 2 و 100 حرف'),
  body('category')
    .optional()
    .isIn([
      'clinic', 'salon', 'spa', 'gym', 'restaurant', 
      'consultation', 'education', 'other'
    ])
    .withMessage('فئة النشاط التجاري غير صحيحة'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('يرجى إدخال رقم هاتف صحيح'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { businessId } = req.params;

    // Check if user owns the business
    const business = await Business.findOne({
      _id: businessId,
      ownerId: req.user._id
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود أو غير مصرح لك بتعديله'
      });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('ownerId', 'name email phone');

    res.json({
      success: true,
      message: 'تم تحديث النشاط التجاري بنجاح',
      data: updatedBusiness
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث النشاط التجاري'
    });
  }
});

// @desc    Get user's business
// @route   GET /api/businesses/my-business
// @access  Private (Business owners only)
router.get('/my-business', [
  protect
], async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id })
      .populate('ownerId', 'name email phone');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد نشاط تجاري مسجل'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Get my business error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب النشاط التجاري'
    });
  }
});

// @desc    Get business statistics
// @route   GET /api/businesses/:businessId/stats
// @access  Private (Business owners only)
router.get('/:businessId/stats', [
  protect
], async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user owns the business
    const business = await Business.findOne({
      _id: businessId,
      ownerId: req.user._id
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه الإحصائيات'
      });
    }

    // Booking and Service are already imported at the top

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Get booking statistics
    const totalBookings = await Booking.countDocuments({
      businessId,
      ...dateFilter
    });

    const confirmedBookings = await Booking.countDocuments({
      businessId,
      status: 'confirmed',
      ...dateFilter
    });

    const cancelledBookings = await Booking.countDocuments({
      businessId,
      status: 'cancelled',
      ...dateFilter
    });

    const completedBookings = await Booking.countDocuments({
      businessId,
      status: 'completed',
      ...dateFilter
    });

    // Get revenue statistics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          businessId: business._id,
          status: { $in: ['confirmed', 'completed'] },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          avgBookingValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // Get service statistics
    const serviceStats = await Booking.aggregate([
      {
        $match: {
          businessId: business._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$serviceId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $project: {
          serviceName: '$service.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const stats = {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      avgBookingValue: revenueData[0]?.avgBookingValue || 0,
      topServices: serviceStats,
      conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get business stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
});

export default router;
