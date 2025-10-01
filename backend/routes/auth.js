import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
const { protect } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/apiResponse');
const { logInfo, logError } = require('../utils/logger');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUser, asyncHandler(async (req, res) => {
    console.log('🔍 AUTH REGISTER: Request received', {
      body: { ...req.body, password: '[HIDDEN]' },
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    const { name, email, password, phone, role } = req.body;

    // Log registration attempt
    logInfo('Registration attempt', {
      email,
      role,
      hasName: !!name,
      hasPassword: !!password,
      hasPhone: !!phone
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.conflict(res, 'البريد الإلكتروني مسجل مسبقاً');
    }

    // Create user
    console.log('🔍 AUTH REGISTER: Creating user in database');
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });
    console.log('🔍 AUTH REGISTER: User created successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Create token
    console.log('🔍 AUTH REGISTER: Generating JWT token');
    const token = user.getSignedJwtToken();
    console.log('🔍 AUTH REGISTER: Token generated', {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });

    // Log successful registration
    logInfo('User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      token
    };

    console.log('🔍 AUTH REGISTER: Sending response', {
      userId: responseData.user.id,
      userEmail: responseData.user.email,
      tokenLength: responseData.token.length
    });

    return ApiResponse.created(res, responseData, 'تم التسجيل بنجاح');
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
], asyncHandler(async (req, res) => {
    console.log('🔍 AUTH LOGIN: Request received', {
      body: { ...req.body, password: '[HIDDEN]' },
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🔍 AUTH LOGIN: Validation errors', errors.array());
      return ApiResponse.validationError(res, errors.array(), 'بيانات غير صحيحة');
    }

    // Check if user exists
    console.log('🔍 AUTH LOGIN: Looking up user in database');
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('🔍 AUTH LOGIN: User not found');
      return ApiResponse.unauthorized(res, 'بيانات الدخول غير صحيحة');
    }
    console.log('🔍 AUTH LOGIN: User found', {
      userId: user._id,
      email: user.email,
      isActive: user.isActive
    });

    // Check if password matches
    console.log('🔍 AUTH LOGIN: Checking password');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('🔍 AUTH LOGIN: Password mismatch');
      return ApiResponse.unauthorized(res, 'بيانات الدخول غير صحيحة');
    }
    console.log('🔍 AUTH LOGIN: Password verified');

    // Check if user is active
    if (!user.isActive) {
      console.log('🔍 AUTH LOGIN: User account is inactive');
      return ApiResponse.unauthorized(res, 'الحساب معطل');
    }

    // Create token
    console.log('🔍 AUTH LOGIN: Generating JWT token');
    const token = user.getSignedJwtToken();
    console.log('🔍 AUTH LOGIN: Token generated', {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });

    // Log successful login
    logInfo('User logged in successfully', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      token
    };

    console.log('🔍 AUTH LOGIN: Sending response', {
      userId: responseData.user.id,
      userEmail: responseData.user.email,
      tokenLength: responseData.token.length
    });

    return ApiResponse.success(res, responseData, 'تم تسجيل الدخول بنجاح');
}));

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  console.log('🔍 AUTH ME: Request received', {
    userId: req.user._id,
    timestamp: new Date().toISOString()
  });

  const user = await User.findById(req.user._id);
  console.log('🔍 AUTH ME: User found', {
    userId: user._id,
    email: user.email,
    isActive: user.isActive
  });

  const responseData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt
    }
  };

  console.log('🔍 AUTH ME: Sending response', {
    userId: responseData.user.id,
    userEmail: responseData.user.email
  });

  return ApiResponse.success(res, responseData, 'تم جلب بيانات المستخدم بنجاح');
}));

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, asyncHandler(async (req, res) => {
  console.log('🔍 AUTH REFRESH: Request received', {
    userId: req.user._id,
    timestamp: new Date().toISOString()
  });

  const user = await User.findById(req.user._id);
  if (!user) {
    console.log('🔍 AUTH REFRESH: User not found');
    return ApiResponse.unauthorized(res, 'المستخدم غير موجود');
  }

  if (!user.isActive) {
    console.log('🔍 AUTH REFRESH: User account is inactive');
    return ApiResponse.unauthorized(res, 'الحساب معطل');
  }

  // Generate new token
  console.log('🔍 AUTH REFRESH: Generating new JWT token');
  const token = user.getSignedJwtToken();
  console.log('🔍 AUTH REFRESH: New token generated', {
    tokenLength: token.length,
    tokenPreview: token.substring(0, 20) + '...'
  });

  const responseData = {
    token
  };

  console.log('🔍 AUTH REFRESH: Sending response', {
    userId: user._id,
    tokenLength: responseData.token.length
  });

  return ApiResponse.success(res, responseData, 'تم تحديث الرمز المميز بنجاح');
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('يرجى إدخال رقم هاتف صحيح')
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

    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.phone) fieldsToUpdate.phone = req.body.phone;
    if (req.body.avatar) fieldsToUpdate.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الملف الشخصي'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير كلمة المرور'
    });
  }
});

module.exports = router;
