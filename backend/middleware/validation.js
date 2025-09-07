const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Enhanced validation middleware with custom validators
 */

// Custom validators
const customValidators = {
  // Check if value is a valid MongoDB ObjectId
  isMongoId: (value) => {
    return mongoose.Types.ObjectId.isValid(value);
  },

  // Check if date is in the future
  isFutureDate: (value) => {
    const date = new Date(value);
    return date > new Date();
  },

  // Check if time is in valid format (HH:MM)
  isValidTime: (value) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value);
  },

  // Check if time is within business hours
  isWithinBusinessHours: (value, { req }) => {
    if (!req.body.businessId) return true;
    
    // This would need to be implemented based on business working hours
    // For now, return true as placeholder
    return true;
  },

  // Check if phone number is valid Saudi format
  isValidSaudiPhone: (value) => {
    if (!value) return false;
    // More flexible phone validation - allow various formats
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
    return phoneRegex.test(value);
  },

  // Check if value is not empty after trimming
  isNotEmpty: (value) => {
    return value && value.toString().trim().length > 0;
  },

  // Check if array has unique values
  hasUniqueValues: (value) => {
    if (!Array.isArray(value)) return false;
    return new Set(value).size === value.length;
  }
};

// Sanitization functions
const sanitizers = {
  // Trim and normalize strings
  normalizeString: (value) => {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ');
    }
    return value;
  },

  // Normalize phone number
  normalizePhone: (value) => {
    if (typeof value === 'string') {
      return value.replace(/[\s\-\(\)]/g, '');
    }
    return value;
  },

  // Convert to lowercase
  toLowerCase: (value) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  }
};

// Common validation rules
const commonValidations = {
  // User validation
  user: {
    name: body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف')
      .custom(customValidators.isNotEmpty)
      .withMessage('الاسم مطلوب'),

    email: body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('يرجى إدخال بريد إلكتروني صحيح'),

    password: body('password')
      .isLength({ min: 6 })
      .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),

    phone: body('phone')
      .custom(customValidators.isValidSaudiPhone)
      .withMessage('يرجى إدخال رقم هاتف صحيح')
      .customSanitizer(sanitizers.normalizePhone),

    role: body('role')
      .isIn(['business', 'customer'])
      .withMessage('الدور يجب أن يكون إما business أو customer')
  },

  // Business validation
  business: {
    name: body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('اسم النشاط التجاري يجب أن يكون بين 2 و 100 حرف')
      .custom(customValidators.isNotEmpty)
      .withMessage('اسم النشاط التجاري مطلوب'),

    category: body('category')
      .isIn([
        'clinic', 'salon', 'spa', 'gym', 'restaurant', 
        'consultation', 'education', 'other'
      ])
      .withMessage('فئة النشاط التجاري غير صحيحة'),

    phone: body('phone')
      .custom(customValidators.isValidSaudiPhone)
      .withMessage('يرجى إدخال رقم هاتف صحيح')
      .customSanitizer(sanitizers.normalizePhone),

    email: body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('يرجى إدخال بريد إلكتروني صحيح'),

    address: {
      city: body('address.city')
        .trim()
        .notEmpty()
        .withMessage('المدينة مطلوبة')
        .customSanitizer(sanitizers.normalizeString),

      street: body('address.street')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('اسم الشارع لا يمكن أن يتجاوز 200 حرف')
        .customSanitizer(sanitizers.normalizeString)
    },

    workingHours: body('workingHours')
      .custom((value) => {
        if (!value || typeof value !== 'object') return false;
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.every(day => {
          const dayHours = value[day];
          return dayHours && 
                 typeof dayHours.isOpen === 'boolean' &&
                 (!dayHours.isOpen || (dayHours.open && dayHours.close));
        });
      })
      .withMessage('ساعات العمل يجب أن تحتوي على جميع أيام الأسبوع مع تحديد الأوقات')
  },

  // Service validation
  service: {
    name: body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('اسم الخدمة يجب أن يكون بين 2 و 100 حرف')
      .custom(customValidators.isNotEmpty)
      .withMessage('اسم الخدمة مطلوب'),

    duration: body('duration')
      .isInt({ min: 15, max: 480 })
      .withMessage('مدة الخدمة يجب أن تكون بين 15 و 480 دقيقة'),

    price: body('price')
      .isFloat({ min: 0 })
      .withMessage('السعر يجب أن يكون رقم موجب'),

    category: body('category')
      .isIn([
        'haircut', 'hair_styling', 'hair_coloring', 'manicure', 
        'pedicure', 'facial', 'massage', 'consultation', 
        'treatment', 'training', 'other'
      ])
      .withMessage('فئة الخدمة غير صحيحة')
  },

  // Booking validation
  booking: {
    businessId: body('businessId')
      .custom(customValidators.isMongoId)
      .withMessage('معرف النشاط التجاري غير صحيح'),

    serviceId: body('serviceId')
      .custom(customValidators.isMongoId)
      .withMessage('معرف الخدمة غير صحيح'),

    date: body('date')
      .isISO8601()
      .withMessage('تاريخ الحجز غير صحيح')
      .custom(customValidators.isFutureDate)
      .withMessage('تاريخ الحجز يجب أن يكون في المستقبل'),

    startTime: body('startTime')
      .custom(customValidators.isValidTime)
      .withMessage('وقت البداية غير صحيح')
      .custom(customValidators.isWithinBusinessHours)
      .withMessage('وقت الحجز خارج ساعات العمل'),

    notes: body('notes.customer')
      .optional()
      .isLength({ max: 500 })
      .withMessage('ملاحظات العميل لا يمكن أن تتجاوز 500 حرف')
      .customSanitizer(sanitizers.normalizeString)
  }
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Export validation rules and middleware
module.exports = {
  customValidators,
  sanitizers,
  commonValidations,
  handleValidationErrors,
  
  // Pre-built validation chains
  validateUser: [
    commonValidations.user.name,
    commonValidations.user.email,
    commonValidations.user.password,
    commonValidations.user.phone,
    commonValidations.user.role,
    handleValidationErrors
  ],

  validateBusiness: [
    commonValidations.business.name,
    commonValidations.business.category,
    commonValidations.business.phone,
    commonValidations.business.email,
    commonValidations.business.address.city,
    commonValidations.business.address.street,
    commonValidations.business.workingHours,
    handleValidationErrors
  ],

  validateService: [
    commonValidations.service.name,
    commonValidations.service.duration,
    commonValidations.service.price,
    commonValidations.service.category,
    handleValidationErrors
  ],

  validateBooking: [
    commonValidations.booking.businessId,
    commonValidations.booking.serviceId,
    commonValidations.booking.date,
    commonValidations.booking.startTime,
    commonValidations.booking.notes,
    handleValidationErrors
  ]
};
