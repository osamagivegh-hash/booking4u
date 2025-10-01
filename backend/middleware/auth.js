const jwt = require('jsonwebtoken');
import User from '../models/User.js';

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذا المورد'
    });
  }

  try {
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      console.log('❌ User not found for token:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (!req.user.isActive) {
      console.log('❌ User account is inactive:', req.user.email);
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل'
      });
    }

    console.log('✅ User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذا المورد'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `دور المستخدم ${req.user.role} غير مصرح له بالوصول إلى هذا المورد`
      });
    }
    next();
  };
};

// Check if user owns the business
exports.checkBusinessOwnership = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const business = await Business.findById(req.params.businessId || req.body.businessId);
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }

    if (business.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا النشاط التجاري'
      });
    }

    req.business = business;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من ملكية النشاط التجاري'
    });
  }
};

// Check if user owns the booking or is business owner
exports.checkBookingAccess = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'الحجز غير موجود'
      });
    }

    // Check if user is the customer who made the booking
    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    
    // Check if user is the business owner
    const Business = require('../models/Business');
    const business = await Business.findById(booking.businessId);
    const isBusinessOwner = business && business.ownerId.toString() === req.user._id.toString();

    if (!isCustomer && !isBusinessOwner) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا الحجز'
      });
    }

    req.booking = booking;
    req.business = business;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من صلاحية الوصول للحجز'
    });
  }
};
