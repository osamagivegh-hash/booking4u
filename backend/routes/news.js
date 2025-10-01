import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import News from '../models/News.js';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all published news (public)
// @route   GET /api/news
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
    search,
    featured,
    breaking,
    language = 'ar'
  } = req.query;

  // Build query
  let query = { isPublished: true, language };
  
  if (category) {
    query.category = category;
  }
  
  if (featured === 'true') {
    query.isFeatured = true;
  }
  
  if (breaking === 'true') {
    query.isBreaking = true;
  }
  
  if (search && search.trim()) {
    const searchTerm = search.trim();
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const news = await News.find(query)
    .populate('author', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-content'); // Exclude full content for list view

  const total = await News.countDocuments(query);

  return ApiResponse.success(res, {
    news,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  }, 'تم جلب الأخبار بنجاح');
}));

// @desc    Get featured news (public)
// @route   GET /api/news/featured
// @access  Public
router.get('/featured', asyncHandler(async (req, res) => {
  const { limit = 5, language = 'ar' } = req.query;

  const news = await News.find({ 
    isPublished: true, 
    isFeatured: true,
    language 
  })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .select('-content');

  return ApiResponse.success(res, { news }, 'تم جلب الأخبار المميزة بنجاح');
}));

// @desc    Get breaking news (public)
// @route   GET /api/news/breaking
// @access  Public
router.get('/breaking', asyncHandler(async (req, res) => {
  const { limit = 3, language = 'ar' } = req.query;

  const news = await News.find({ 
    isPublished: true, 
    isBreaking: true,
    language 
  })
    .populate('author', 'name avatar')
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .select('-content');

  return ApiResponse.success(res, { news }, 'تم جلب الأخبار العاجلة بنجاح');
}));

// @desc    Get news categories (public)
// @route   GET /api/news/categories
// @access  Public
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [
    { value: 'general', label: 'عام', icon: '📰' },
    { value: 'business', label: 'أعمال', icon: '💼' },
    { value: 'health', label: 'صحة', icon: '🏥' },
    { value: 'beauty', label: 'جمال', icon: '💄' },
    { value: 'technology', label: 'تكنولوجيا', icon: '💻' },
    { value: 'lifestyle', label: 'نمط حياة', icon: '🌟' },
    { value: 'promotions', label: 'عروض', icon: '🎉' },
    { value: 'announcements', label: 'إعلانات', icon: '📢' }
  ];

  // Get count for each category
  const categoryCounts = await Promise.all(
    categories.map(async (category) => {
      const count = await News.countDocuments({ 
        category: category.value, 
        isPublished: true 
      });
      return { ...category, count };
    })
  );

  return ApiResponse.success(res, { categories: categoryCounts }, 'تم جلب فئات الأخبار بنجاح');
}));

// @desc    Get single news article (public)
// @route   GET /api/news/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const news = await News.findOne({ 
    _id: req.params.id, 
    isPublished: true 
  }).populate('author', 'name avatar bio');

  if (!news) {
    return ApiResponse.error(res, 'الخبر غير موجود', 404);
  }

  // Increment views
  await news.incrementViews();

  return ApiResponse.success(res, { news }, 'تم جلب الخبر بنجاح');
}));

// @desc    Like a news article (public)
// @route   POST /api/news/:id/like
// @access  Public
router.post('/:id/like', asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    return ApiResponse.error(res, 'الخبر غير موجود', 404);
  }

  await news.incrementLikes();

  return ApiResponse.success(res, { 
    likes: news.likes + 1 
  }, 'تم تسجيل الإعجاب بنجاح');
}));

// @desc    Share a news article (public)
// @route   POST /api/news/:id/share
// @access  Public
router.post('/:id/share', asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    return ApiResponse.error(res, 'الخبر غير موجود', 404);
  }

  await news.incrementShares();

  return ApiResponse.success(res, { 
    shares: news.shares + 1 
  }, 'تم تسجيل المشاركة بنجاح');
}));

// @desc    Create news article (admin only)
// @route   POST /api/news
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('title').notEmpty().withMessage('عنوان الخبر مطلوب'),
  body('content').notEmpty().withMessage('محتوى الخبر مطلوب'),
  body('category').isIn(['general', 'business', 'health', 'beauty', 'technology', 'lifestyle', 'promotions', 'announcements']).withMessage('فئة غير صحيحة')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, errors.array()[0].msg, 400);
  }

  const newsData = {
    ...req.body,
    author: req.user.id
  };

  const news = await News.create(newsData);

  return ApiResponse.success(res, { news }, 'تم إنشاء الخبر بنجاح', 201);
}));

// @desc    Update news article (admin only)
// @route   PUT /api/news/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    return ApiResponse.error(res, 'الخبر غير موجود', 404);
  }

  const updatedNews = await News.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'name avatar');

  return ApiResponse.success(res, { news: updatedNews }, 'تم تحديث الخبر بنجاح');
}));

// @desc    Delete news article (admin only)
// @route   DELETE /api/news/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  
  if (!news) {
    return ApiResponse.error(res, 'الخبر غير موجود', 404);
  }

  await News.findByIdAndDelete(req.params.id);

  return ApiResponse.success(res, null, 'تم حذف الخبر بنجاح');
}));

// @desc    Get all news for admin (admin only)
// @route   GET /api/news/admin/all
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    status,
    search
  } = req.query;

  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (status === 'published') {
    query.isPublished = true;
  } else if (status === 'draft') {
    query.isPublished = false;
  }
  
  if (search && search.trim()) {
    const searchTerm = search.trim();
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const news = await News.find(query)
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await News.countDocuments(query);

  return ApiResponse.success(res, {
    news,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  }, 'تم جلب جميع الأخبار بنجاح');
}));

export default router;