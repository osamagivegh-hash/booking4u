const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const Business = require('../models/Business');
const Review = require('../models/Review');
const { protect, authorize, checkBusinessOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/apiResponse');
const { uploadMultiple, handleUploadError, getFileUrl } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all services (public)
// @route   GET /api/services
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    location,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    businessId
  } = req.query;

  // Build query
  let query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (businessId) {
    query.businessId = businessId;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const services = await Service.find(query)
    .populate('businessId', 'name ownerId location contactInfo')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Service.countDocuments(query);

  return ApiResponse.success(res, {
    services,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  }, 'تم جلب الخدمات بنجاح');
}));

// @desc    Get services for the authenticated business owner
// @route   GET /api/services/my-services
// @access  Private (Business owners only)
router.get('/my-services', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find the business owned by this user
    const business = await Business.findOne({ ownerId: userId });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }
    
    // Get all services for this business
    const services = await Service.find({ businessId: business._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخدمات'
    });
  }
});

// @desc    Get single service
// @route   GET /api/services/:businessId/:serviceId
// @access  Public
router.get('/:businessId/:serviceId', async (req, res) => {
  try {
    const { businessId, serviceId } = req.params;

    const service = await Service.findOne({
      _id: serviceId,
      businessId,
      isActive: true
    }).populate('businessId', 'name category address phone');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخدمة'
    });
  }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (All authenticated users with business)
router.post('/', [
  protect,
  uploadMultiple('serviceImages', 5),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم الخدمة يجب أن يكون بين 2 و 100 حرف'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('مدة الخدمة يجب أن تكون بين 15 و 480 دقيقة'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('السعر يجب أن يكون رقم موجب'),
  body('category')
    .isIn([
      'haircut', 'hair_styling', 'hair_coloring', 'manicure', 
      'pedicure', 'facial', 'massage', 'consultation', 
      'treatment', 'training', 'other'
    ])
    .withMessage('فئة الخدمة غير صحيحة')
], handleUploadError, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    console.log('Creating service by user:', req.user._id);

    // Find the business owned by this user
    const business = await Business.findOne({ ownerId: req.user._id });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'يجب إنشاء نشاط تجاري أولاً قبل إضافة الخدمات',
        code: 'NO_BUSINESS'
      });
    }

    // Check if business is active
    if (!business.isActive) {
      return res.status(400).json({
        success: false,
        message: 'النشاط التجاري معطل حالياً'
      });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files:', req.files.length);
      images = req.files.map((file, index) => {
        const imageUrl = getFileUrl(req, `services/${file.filename}`);
        console.log(`Image ${index + 1}: ${file.filename} -> ${imageUrl}`);
        return {
          url: imageUrl,
          alt: req.body.imageAlts ? req.body.imageAlts[index] : '',
          isPrimary: index === 0 // First image is primary
        };
      });
    }

    const serviceData = {
      ...req.body,
      businessId: business._id,
      images: images
    };

    // Set primary image if no images uploaded
    if (images.length === 0 && req.body.image) {
      serviceData.image = req.body.image;
    } else if (images.length > 0) {
      serviceData.image = images[0].url; // Set first image as primary
    }

    const service = await Service.create(serviceData);

    await service.populate('businessId', 'name category');

    console.log('Service created successfully:', service._id);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الخدمة بنجاح',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    console.error('Error details:', {
      userId: req.user?._id,
      userRole: req.user?.role,
      requestBody: req.body,
      errorMessage: error.message,
      errorStack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الخدمة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:serviceId
// @access  Private (Business owners only)
router.put('/:serviceId', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم الخدمة يجب أن يكون بين 2 و 100 حرف'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('مدة الخدمة يجب أن تكون بين 15 و 480 دقيقة'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('السعر يجب أن يكون رقم موجب'),
  body('category')
    .optional()
    .isIn([
      'haircut', 'hair_styling', 'hair_coloring', 'manicure', 
      'pedicure', 'facial', 'massage', 'consultation', 
      'treatment', 'training', 'other'
    ])
    .withMessage('فئة الخدمة غير صحيحة')
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

    const { serviceId } = req.params;

    // Find service and check ownership
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    // Check if user owns the business
    const business = await Business.findById(service.businessId);
    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذه الخدمة'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'تم تحديث الخدمة بنجاح',
      data: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الخدمة'
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:serviceId
// @access  Private (Business owners only)
router.delete('/:serviceId', [
  protect
], async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find service and check ownership
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    // Check if user owns the business
    const business = await Business.findById(service.businessId);
    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذه الخدمة'
      });
    }

    // Soft delete - just mark as inactive
    await Service.findByIdAndUpdate(serviceId, { isActive: false });

    res.json({
      success: true,
      message: 'تم حذف الخدمة بنجاح'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الخدمة'
    });
  }
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { city, limit = 20 } = req.query;

    let query = { category, isActive: true };
    
    // If city is provided, filter by business location
    if (city) {
      const businesses = await Business.find({
        'address.city': { $regex: city, $options: 'i' },
        isActive: true
      }).select('_id');
      
      query.businessId = { $in: businesses.map(b => b._id) };
    }

    const services = await Service.find(query)
      .populate('businessId', 'name category address rating')
      .limit(parseInt(limit))
      .sort({ isPopular: -1, price: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخدمات'
    });
  }
});

// @desc    Get latest services (added in last 24 hours)
// @route   GET /api/services/latest
// @access  Public
router.get('/latest', async (req, res) => {
  try {
    const { limit = 10, city } = req.query;
    
    // Calculate date 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let query = { 
      isActive: true,
      createdAt: { $gte: twentyFourHoursAgo }
    };
    
    // If city is provided, filter by business location
    if (city) {
      const businesses = await Business.find({
        'address.city': { $regex: city, $options: 'i' },
        isActive: true
      }).select('_id');
      
      query.businessId = { $in: businesses.map(b => b._id) };
    }

    const services = await Service.find(query)
      .populate('businessId', 'name category address rating phone')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get latest services error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أحدث الخدمات'
    });
  }
});

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, city, limit = 20 } = req.query;

    let query = { isActive: true };

    // Text search using regex
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // City filter
    if (city) {
      const businesses = await Business.find({
        'address.city': { $regex: city, $options: 'i' },
        isActive: true
      }).select('_id');
      
      query.businessId = { $in: businesses.map(b => b._id) };
    }

    const services = await Service.find(query)
      .populate('businessId', 'name category address rating')
      .limit(parseInt(limit))
      .sort({ isPopular: -1, price: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث عن الخدمات'
    });
  }
});

// @desc    Get services for the authenticated business owner
// @route   GET /api/services/my-services
// @access  Private (Business owners only)
router.get('/my-services', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find the business owned by this user
    const business = await Business.findOne({ ownerId: userId });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }
    
    // Get all services for this business
    const services = await Service.find({ businessId: business._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخدمات'
    });
  }
});

// @desc    Get recommended services based on user preferences and history
// @route   GET /api/services/recommended
// @access  Public
router.get('/recommended', asyncHandler(async (req, res) => {
  const { limit = 10, category, location } = req.query;
  
  let query = { isActive: true };
  
  // Filter by category if provided
  if (category) {
    query.category = category;
  }
  
  // Filter by location if provided
  if (location) {
    const businesses = await Business.find({
      'address.city': { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    query.businessId = { $in: businesses.map(b => b._id) };
  }
  
  // Get services with high ratings and popularity
  const services = await Service.find(query)
    .populate('businessId', 'name category address rating')
    .sort({ averageRating: -1, totalBookings: -1, isPopular: -1 })
    .limit(parseInt(limit));
  
  return ApiResponse.success(res, { services }, 'تم جلب الخدمات الموصى بها بنجاح');
}));

// @desc    Get most booked services
// @route   GET /api/services/most-booked
// @access  Public
router.get('/most-booked', asyncHandler(async (req, res) => {
  const { limit = 10, category, location } = req.query;
  
  let query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (location) {
    const businesses = await Business.find({
      'address.city': { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    query.businessId = { $in: businesses.map(b => b._id) };
  }
  
  const services = await Service.find(query)
    .populate('businessId', 'name category address rating')
    .sort({ totalBookings: -1, averageRating: -1 })
    .limit(parseInt(limit));
  
  return ApiResponse.success(res, { services }, 'تم جلب الخدمات الأكثر حجزاً بنجاح');
}));

// @desc    Get top rated services
// @route   GET /api/services/top-rated
// @access  Public
router.get('/top-rated', asyncHandler(async (req, res) => {
  const { limit = 10, category, location, minRating = 4 } = req.query;
  
  let query = { 
    isActive: true,
    averageRating: { $gte: parseFloat(minRating) }
  };
  
  if (category) {
    query.category = category;
  }
  
  if (location) {
    const businesses = await Business.find({
      'address.city': { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    query.businessId = { $in: businesses.map(b => b._id) };
  }
  
  const services = await Service.find(query)
    .populate('businessId', 'name category address rating')
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(parseInt(limit));
  
  return ApiResponse.success(res, { services }, 'تم جلب الخدمات الأعلى تقييماً بنجاح');
}));

// @desc    Get newest services
// @route   GET /api/services/newest
// @access  Public
router.get('/newest', asyncHandler(async (req, res) => {
  const { limit = 10, category, location } = req.query;
  
  let query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (location) {
    const businesses = await Business.find({
      'address.city': { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    query.businessId = { $in: businesses.map(b => b._id) };
  }
  
  const services = await Service.find(query)
    .populate('businessId', 'name category address rating')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  return ApiResponse.success(res, { services }, 'تم جلب أحدث الخدمات بنجاح');
}));

// @desc    Advanced search with multiple filters
// @route   GET /api/services/advanced-search
// @access  Public
router.get('/advanced-search', asyncHandler(async (req, res) => {
  const {
    q: searchQuery,
    category,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    location,
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = req.query;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let query = { isActive: true };
  
  // Text search
  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } }
    ];
  }
  
  // Category filter
  if (category) {
    query.category = category;
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  // Rating filter
  if (minRating || maxRating) {
    query.averageRating = {};
    if (minRating) query.averageRating.$gte = parseFloat(minRating);
    if (maxRating) query.averageRating.$lte = parseFloat(maxRating);
  }
  
  // Location filter
  if (location) {
    const businesses = await Business.find({
      'address.city': { $regex: location, $options: 'i' },
      isActive: true
    }).select('_id');
    query.businessId = { $in: businesses.map(b => b._id) };
  }
  
  // Sorting
  let sortOptions = {};
  switch (sortBy) {
    case 'price_low':
      sortOptions = { price: 1 };
      break;
    case 'price_high':
      sortOptions = { price: -1 };
      break;
    case 'rating':
      sortOptions = { averageRating: -1, totalReviews: -1 };
      break;
    case 'popularity':
      sortOptions = { totalBookings: -1, averageRating: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    default: // relevance
      sortOptions = { averageRating: -1, totalBookings: -1, isPopular: -1 };
  }
  
  const services = await Service.find(query)
    .populate('businessId', 'name category address rating')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Service.countDocuments(query);
  const totalPages = Math.ceil(total / parseInt(limit));
  
  return ApiResponse.success(res, {
    services,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalServices: total,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    }
  }, 'تم البحث في الخدمات بنجاح');
}));

// @desc    Get all services for a business
// @route   GET /api/services/:businessId
// @access  Public
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { category, isActive, showAll } = req.query;

    // Build query
    const query = { businessId };
    
    // Only filter by isActive if showAll is not true
    if (showAll !== 'true') {
      query.isActive = isActive !== undefined ? isActive === 'true' : true;
    }
    
    if (category) query.category = category;

    const services = await Service.find(query)
      .populate('businessId', 'name category')
      .sort({ isPopular: -1, name: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخدمات'
    });
  }
});

module.exports = router;
