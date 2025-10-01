import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users (for business owners)
// @route   GET /api/users
// @access  Private (Business owners only)
router.get('/', [
  protect,
  authorize('business')
], async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { isActive: true };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدمين'
    });
  }
});

// @desc    Search users by name
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    console.log('🔍 Search request received:', req.query);
    console.log('👤 User making request:', req.user?.email || 'Unknown user');
    
    // Extract and validate query parameters
    const { q: query, limit = 10, role } = req.query;
    
    // Validate query parameter
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معامل البحث مطلوب',
        users: []
      });
    }
    
    // Sanitize and validate query
    const sanitizedQuery = query.trim();
    if (sanitizedQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يكون البحث على الأقل حرفين',
        users: []
      });
    }
    
    if (sanitizedQuery.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'البحث طويل جداً (الحد الأقصى 100 حرف)',
        users: []
      });
    }
    
    console.log('🔍 Sanitized query:', sanitizedQuery);
    console.log('🔍 Limit:', limit);
    console.log('🔍 Role filter:', role);
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'قاعدة البيانات غير متصلة',
        users: []
      });
    }
    
    // Build search query
    const searchQuery = {
      _id: { $ne: req.user._id }, // Exclude current user
      $or: [
        { name: { $regex: sanitizedQuery, $options: 'i' } },
        { email: { $regex: sanitizedQuery, $options: 'i' } }
      ],
      isActive: true
    };
    
    // Add role filter if provided
    if (role && ['customer', 'business'].includes(role)) {
      searchQuery.role = role;
    }
    
    console.log('🔍 Database query:', JSON.stringify(searchQuery, null, 2));
    
    // Execute search
    const users = await User.find(searchQuery)
      .select('name email role phone avatar')
      .limit(parseInt(limit))
      .sort({ name: 1 })
      .lean();
    
    console.log('✅ Search successful. Found users:', users.length);
    console.log('👥 Users found:', users.map(u => ({ name: u.name, email: u.email, role: u.role })));
    
    res.json({
      success: true,
      users: users,
      count: users.length,
      query: sanitizedQuery
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
    
    // Handle specific database errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معامل البحث غير صحيح',
        users: []
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'خطأ في التحقق من البيانات',
        users: []
      });
    }
    
    // General error
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث',
      users: []
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own profile or business owners can view any user
    if (req.user._id.toString() !== userId && req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المورد'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدم'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private
router.put('/:userId', [
  protect,
  body('name').optional().isLength({ min: 2, max: 50 }).withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('phone').optional().isMobilePhone('ar-SA').withMessage('رقم الهاتف غير صحيح'),
  body('avatar').optional().isURL().withMessage('رابط الصورة غير صحيح')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { name, phone, avatar } = req.body;

    // Users can only update their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا الملف الشخصي'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المستخدم'
    });
  }
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:userId
// @access  Private (Business owners only)
router.delete('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only business owners can delete users
    if (req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف المستخدمين'
      });
    }

    // Prevent self-deletion
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف حسابك الخاص'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المستخدم'
    });
  }
});


// @desc    Test database connection
// @route   GET /api/users/test-db
// @access  Private
router.get('/test-db', protect, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      message: 'Database connection successful',
      userCount
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// @desc    Create test users for development
// @route   POST /api/users/create-test-users
// @access  Private
router.post('/create-test-users', protect, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Not allowed in production'
      });
    }

    const testUsers = [
      {
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        password: 'password123',
        role: 'customer',
        phone: '+966501234567'
      },
      {
        name: 'فاطمة علي',
        email: 'fatima@test.com',
        password: 'password123',
        role: 'customer',
        phone: '+966501234568'
      },
      {
        name: 'محمد التاجر',
        email: 'merchant@test.com',
        password: 'password123',
        role: 'business',
        phone: '+966501234569'
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    }

    res.json({
      success: true,
      message: `تم إنشاء ${createdUsers.length} مستخدم جديد`,
      users: createdUsers
    });
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المستخدمين التجريبيين',
      error: error.message
    });
  }
});

// @desc    Get user statistics (for business owners)
// @route   GET /api/users/stats
// @access  Private (Business owners only)
router.get('/stats', [
  protect,
  authorize('business')
], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalBusinesses = await User.countDocuments({ role: 'business', isActive: true });
    
    const recentUsers = await User.find({ isActive: true })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalBusinesses,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المستخدمين'
    });
  }
});

// @desc    Test endpoint to check database connection and users (no auth required)
// @route   GET /api/users/test-db
// @access  Public (for debugging only)
router.get('/test-db', async (req, res) => {
  try {
    console.log('🧪 Test DB endpoint called');
    
    // Check mongoose connection
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log('🔌 Database connection state:', connectionStates[connectionState]);
    
    if (connectionState !== 1) {
      return res.json({
        success: false,
        message: 'Database not connected',
        connectionState: connectionStates[connectionState],
        users: []
      });
    }
    
    // Count users
    const userCount = await User.countDocuments();
    console.log('👥 Total users in database:', userCount);
    
    // Get sample users
    const sampleUsers = await User.find()
      .select('name email role isActive')
      .limit(5)
      .lean();
    
    console.log('👥 Sample users:', sampleUsers);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      connectionState: connectionStates[connectionState],
      userCount,
      sampleUsers
    });
    
  } catch (error) {
    console.error('❌ Test DB error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// @desc    Create test users for debugging (no auth required)
// @route   POST /api/users/create-test-users
// @access  Public (for debugging only)
router.post('/create-test-users', async (req, res) => {
  try {
    console.log('🧪 Create test users endpoint called');
    
    // Check if test users already exist
    const existingUsers = await User.find({
      email: { $in: ['ahmed@test.com', 'fatima@test.com', 'merchant@test.com', 'sara@test.com'] }
    });
    
    if (existingUsers.length > 0) {
      return res.json({
        success: true,
        message: 'Users already exist',
        existingUsers: existingUsers.length
      });
    }
    
    // Create test users
    const testUsers = [
      {
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        password: 'password123',
        role: 'customer',
        phone: '+966501234567',
        isActive: true
      },
      {
        name: 'فاطمة أحمد',
        email: 'fatima@test.com',
        password: 'password123',
        role: 'customer',
        phone: '+966501234568',
        isActive: true
      },
      {
        name: 'محمد التاجر',
        email: 'merchant@test.com',
        password: 'password123',
        role: 'business',
        phone: '+966501234569',
        isActive: true
      },
      {
        name: 'سارة علي',
        email: 'sara@test.com',
        password: 'password123',
        role: 'customer',
        phone: '+966501234570',
        isActive: true
      }
    ];
    
    const createdUsers = await User.insertMany(testUsers);
    console.log('✅ Created test users:', createdUsers.length);
    
    res.json({
      success: true,
      message: 'Test users created successfully',
      users: createdUsers.map(u => ({ name: u.name, email: u.email, role: u.role }))
    });
    
  } catch (error) {
    console.error('❌ Create test users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test users',
      error: error.message
    });
  }
});

module.exports = router;
