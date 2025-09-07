const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Business = require('../models/Business');
const { protect, authorize, checkBookingAccess } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings for a business
// @route   GET /api/bookings/business/:businessId
// @access  Private (Business owners only)
router.get('/business/:businessId', protect, async (req, res) => {
  try {
    const { businessId } = req.params;
    const { status, date, page = 1, limit = 20 } = req.query;

    // Check if user owns the business
    const business = await Business.findOne({
      _id: businessId,
      ownerId: req.user._id
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى حجوزات هذا النشاط التجاري'
      });
    }

    // Build query
    const query = { businessId };
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price duration')
      .populate('staffId', 'name')
      .sort({ date: -1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: bookings
    });
  } catch (error) {
    console.error('Get business bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الحجوزات'
    });
  }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', [
  protect,
  body('businessId')
    .isMongoId()
    .withMessage('معرف النشاط التجاري غير صحيح'),
  body('serviceId')
    .isMongoId()
    .withMessage('معرف الخدمة غير صحيح'),
  body('date')
    .isISO8601()
    .withMessage('تاريخ الحجز غير صحيح'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('وقت البداية غير صحيح'),
  body('notes.customer')
    .optional()
    .isLength({ max: 500 })
    .withMessage('ملاحظات العميل لا يمكن أن تتجاوز 500 حرف')
], async (req, res) => {
  try {
    console.log('Booking creation request:', {
      userId: req.user?._id,
      body: req.body,
      userRole: req.user?.role
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'بيانات الحجز غير صحيحة',
        errors: errors.array()
      });
    }

    const { businessId, serviceId, date, startTime, staffId, notes } = req.body;
    
    // Additional validation for required fields
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'معرف النشاط التجاري مطلوب'
      });
    }
    
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الخدمة مطلوب'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ الحجز مطلوب'
      });
    }
    
    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: 'وقت الحجز مطلوب'
      });
    }
    
    if (!req.user?._id) {
      return res.status(400).json({
        success: false,
        message: 'معرف العميل مطلوب'
      });
    }
    
    console.log('Processing booking creation:', { businessId, serviceId, date, startTime });

    // Check if service exists and is active
    const service = await Service.findOne({
      _id: serviceId,
      businessId,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة أو غير متاحة'
      });
    }

    // Check if business exists and is active
    const business = await Business.findOne({
      _id: businessId,
      isActive: true
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود أو غير متاح'
      });
    }

    // Calculate end time based on service duration
    const startDateTime = new Date(`2000-01-01T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Check if the requested time slot is available
    const bookingDate = new Date(date);
    
    // Validate booking date
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ الحجز غير صحيح'
      });
    }
    
    // Check if booking date is in the past
    const now = new Date();
    if (bookingDate < now) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن الحجز في تاريخ ماضي'
      });
    }
    
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    console.log('Booking date:', bookingDate, 'Day of week:', dayOfWeek);
    console.log('Business working hours:', business.workingHours);
    
    // Check if business is open on this day
    if (!business.workingHours[dayOfWeek]?.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'النشاط التجاري مغلق في هذا اليوم'
      });
    }

    // Check if time is within business hours
    const businessOpenTime = business.workingHours[dayOfWeek].open;
    const businessCloseTime = business.workingHours[dayOfWeek].close;
    
    console.log('Time validation:', {
      startTime,
      endTime,
      businessOpenTime,
      businessCloseTime,
      dayOfWeek
    });
    
    if (!businessOpenTime || !businessCloseTime) {
      return res.status(400).json({
        success: false,
        message: 'ساعات العمل غير محددة لهذا اليوم'
      });
    }
    
    if (startTime < businessOpenTime || endTime > businessCloseTime) {
      return res.status(400).json({
        success: false,
        message: `وقت الحجز خارج ساعات العمل (${businessOpenTime} - ${businessCloseTime})`
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      businessId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingBooking) {
      console.log('Conflicting booking found:', conflictingBooking);
      return res.status(400).json({
        success: false,
        message: `هذا الوقت محجوز مسبقاً (${conflictingBooking.startTime} - ${conflictingBooking.endTime})`
      });
    }

    // Create booking
    const booking = await Booking.create({
      businessId,
      serviceId,
      customerId: req.user._id,
      staffId,
      date: bookingDate,
      startTime,
      endTime,
      totalPrice: service.price,
      currency: service.currency,
      notes: {
        customer: notes?.customer || ''
      }
    });

    // Populate related data
    await booking.populate([
      { path: 'businessId', select: 'name address phone' },
      { path: 'serviceId', select: 'name duration price' },
      { path: 'customerId', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحجز بنجاح',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
      body: req.body
    });
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'بيانات الحجز غير صحيحة',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف غير صحيح',
        field: error.path
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'هذا الحجز موجود مسبقاً'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الحجز',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all bookings for a business
// @route   GET /api/bookings/business/:businessId
// @access  Private (Business owners only)
router.get('/business/:businessId', [
  protect,
  authorize('business')
], async (req, res) => {
  try {
    const { businessId } = req.params;
    const { status, date, page = 1, limit = 20 } = req.query;

    // Check if user owns the business
    const business = await Business.findOne({
      _id: businessId,
      ownerId: req.user._id
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه الحجوزات'
      });
    }

    // Build query
    const query = { businessId };
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate([
        { path: 'customerId', select: 'name email phone' },
        { path: 'serviceId', select: 'name duration price' },
        { path: 'staffId', select: 'name' }
      ])
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: bookings
    });
  } catch (error) {
    console.error('Get business bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الحجوزات'
    });
  }
});



// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { customerId: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate([
        { path: 'businessId', select: 'name address phone' },
        { path: 'serviceId', select: 'name duration price' }
      ])
      .sort({ date: -1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الحجوزات'
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:bookingId
// @access  Private
router.get('/:bookingId', protect, checkBookingAccess, async (req, res) => {
  try {
    await req.booking.populate([
      { path: 'businessId', select: 'name address phone workingHours' },
      { path: 'serviceId', select: 'name duration price description' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'staffId', select: 'name' }
    ]);

    res.json({
      success: true,
      data: req.booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الحجز'
    });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:bookingId/status
// @access  Private
router.put('/:bookingId/status', [
  protect,
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('حالة الحجز غير صحيحة'),
  body('notes.business')
    .optional()
    .isLength({ max: 500 })
    .withMessage('ملاحظات صاحب النشاط لا يمكن أن تتجاوز 500 حرف')
], checkBookingAccess, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;
    const updateData = { status };

    // Add cancellation details if cancelling
    if (status === 'cancelled') {
      updateData.cancellationTime = new Date();
      updateData.cancelledBy = req.user.role === 'business' ? 'business' : 'customer';
      if (notes?.business) {
        updateData.notes = { ...req.booking.notes, business: notes.business };
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      updateData,
      { new: true }
    ).populate([
      { path: 'businessId', select: 'name address phone' },
      { path: 'serviceId', select: 'name duration price' },
      { path: 'customerId', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'تم تحديث حالة الحجز بنجاح',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة الحجز'
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:bookingId/cancel
// @access  Private
router.put('/:bookingId/cancel', [
  protect,
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('سبب الإلغاء لا يمكن أن يتجاوز 200 حرف')
], checkBookingAccess, async (req, res) => {
  try {
    const { reason } = req.body;

    // Check if booking can be cancelled
    if (req.booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'الحجز ملغي مسبقاً'
      });
    }

    if (req.booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء حجز مكتمل'
      });
    }

    // Check cancellation policy
    const bookingDate = new Date(req.booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

    if (hoursUntilBooking < req.business.settings.cancellationHours) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن إلغاء الحجز قبل ${req.business.settings.cancellationHours} ساعة من الموعد`
      });
    }

    const updateData = {
      status: 'cancelled',
      cancellationTime: new Date(),
      cancelledBy: req.user.role === 'business' ? 'business' : 'customer'
    };

    if (reason) {
      updateData.cancellationReason = reason;
    }

    const cancelledBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      updateData,
      { new: true }
    ).populate([
      { path: 'businessId', select: 'name address phone' },
      { path: 'serviceId', select: 'name duration price' },
      { path: 'customerId', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'تم إلغاء الحجز بنجاح',
      data: cancelledBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الحجز'
    });
  }
});



// @desc    Get available time slots
// @route   GET /api/bookings/available-slots/:businessId/:serviceId
// @access  Public
router.get('/available-slots/:businessId/:serviceId', async (req, res) => {
  try {
    const { businessId, serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'التاريخ مطلوب'
      });
    }

    // Get service and business details
    const service = await Service.findOne({
      _id: serviceId,
      businessId,
      isActive: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'الخدمة غير موجودة'
      });
    }

    const business = await Business.findById(businessId);
    if (!business || !business.isActive) {
      return res.status(404).json({
        success: false,
        message: 'النشاط التجاري غير موجود'
      });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check if business is open on this day
    if (!business.workingHours[dayOfWeek]?.isOpen) {
      return res.json({
        success: true,
        data: [],
        message: 'النشاط التجاري مغلق في هذا اليوم'
      });
    }

    const openTime = business.workingHours[dayOfWeek].open;
    const closeTime = business.workingHours[dayOfWeek].close;

    // Generate time slots
    const timeSlots = [];
    const slotDuration = 30; // 30 minutes intervals
    const serviceDuration = service.duration;

    let currentTime = new Date(`2000-01-01T${openTime}:00`);
    const closeDateTime = new Date(`2000-01-01T${closeTime}:00`);

    while (currentTime < closeDateTime) {
      const startTime = currentTime.toTimeString().slice(0, 5);
      const endDateTime = new Date(currentTime.getTime() + serviceDuration * 60000);
      const endTime = endDateTime.toTimeString().slice(0, 5);

      // Check if this slot fits within business hours
      if (endDateTime <= closeDateTime) {
        timeSlots.push({
          startTime,
          endTime,
          available: true
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    // Check existing bookings for this date
    const existingBookings = await Booking.find({
      businessId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Mark conflicting slots as unavailable
    timeSlots.forEach(slot => {
      const hasConflict = existingBookings.some(booking => {
        return (
          (slot.startTime < booking.endTime && slot.endTime > booking.startTime)
        );
      });
      slot.available = !hasConflict;
    });

    res.json({
      success: true,
      data: timeSlots.filter(slot => slot.available)
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الأوقات المتاحة'
    });
  }
});

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '30d' } = req.query;
    
    console.log('Stats request:', { 
      userId, 
      userRole: req.user.role, 
      timeRange,
      userEmail: req.user.email,
      userRole: req.user.role
    });
    
    // Check database connection
    if (!mongoose.connection.readyState) {
      console.error('Database not connected, readyState:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'قاعدة البيانات غير متصلة',
        error: 'Database connection not ready'
      });
    }
    
    console.log('Database connection ready, readyState:', mongoose.connection.readyState);
    
    // Validate timeRange parameter
    const validTimeRanges = ['7d', '30d', '90d', '1y'];
    const validTimeRange = validTimeRanges.includes(timeRange) ? timeRange : '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (validTimeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Check if user is business owner or customer
    const userRole = req.user.role || 'customer'; // Default to customer if role is not set
    console.log('Processing stats for user role:', userRole);
    
    if (userRole === 'business') {
      // Get business stats
      const Business = require('../models/Business');
      const Service = require('../models/Service');
      const Review = require('../models/Review');
      
      const business = await Business.findOne({ ownerId: userId });
      
      if (!business) {
        console.log('No business found for user:', userId);
        // Return empty stats instead of 404 error
        const emptyStats = {
          totalBookings: 0,
          todayBookings: 0,
          monthlyBookings: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalServices: 0,
          totalCustomers: 0,
          pendingBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: 0,
          totalReviews: 0,
          conversionRate: 0,
          growthRate: 0
        };
        
        console.log('Returning empty stats for user without business');
        return res.json({
          success: true,
          data: emptyStats
        });
      }
      
      console.log('Business found:', business._id);
      
      // Get all bookings for the business with better error handling
      let allBookings = [];
      let recentBookings = [];
      let services = [];
      let reviews = [];
      
      try {
        allBookings = await Booking.find({ businessId: business._id });
        console.log(`Found ${allBookings.length} total bookings for business ${business._id}`);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        allBookings = [];
      }
      
      try {
        recentBookings = await Booking.find({ 
          businessId: business._id,
          createdAt: { $gte: startDate }
        });
        console.log(`Found ${recentBookings.length} recent bookings for business ${business._id}`);
      } catch (err) {
        console.error('Error fetching recent bookings:', err);
        recentBookings = [];
      }
      
      // Get services
      try {
        services = await Service.find({ businessId: business._id });
        console.log(`Found ${services.length} services for business ${business._id}`);
      } catch (err) {
        console.error('Error fetching services:', err);
        services = [];
      }
      const activeServices = services.filter(service => service.isActive);
      
      // Get reviews
      try {
        reviews = await Review.find({ businessId: business._id });
        console.log(`Found ${reviews.length} reviews for business ${business._id}`);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        reviews = [];
      }
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
        : 0;
      
      // Calculate revenue
      const completedBookings = allBookings.filter(booking => booking.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      
      const monthlyCompletedBookings = completedBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        const currentMonth = new Date();
        return bookingDate.getMonth() === currentMonth.getMonth() && 
               bookingDate.getFullYear() === currentMonth.getFullYear();
      });
      const monthlyRevenue = monthlyCompletedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      
      // Calculate growth rate (simplified)
      let growthRate = 0;
      try {
        const previousPeriodStart = new Date(startDate);
        const previousPeriodEnd = new Date(startDate);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() + (now - startDate) / (1000 * 60 * 60 * 24));
        
        const previousBookings = await Booking.find({
          businessId: business._id,
          createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
        });
        
        growthRate = previousBookings.length > 0 
          ? ((recentBookings.length - previousBookings.length) / previousBookings.length) * 100 
          : 0;
      } catch (err) {
        console.error('Error calculating growth rate:', err);
        growthRate = 0;
      }
      
      // Calculate conversion rate (bookings vs total inquiries - simplified)
      const conversionRate = allBookings.length > 0 ? 85 : 0; // Placeholder calculation
      
      const stats = {
        totalBookings: allBookings.length,
        todayBookings: allBookings.filter(booking => {
          const today = new Date();
          const bookingDate = new Date(booking.date);
          return today.toDateString() === bookingDate.toDateString() && 
                 ['pending', 'confirmed'].includes(booking.status);
        }).length,
        monthlyBookings: recentBookings.length,
        totalRevenue,
        monthlyRevenue,
        totalServices: activeServices.length,
        totalCustomers: [...new Set(allBookings.map(booking => booking.customerId?.toString()).filter(Boolean))].length,
        pendingBookings: allBookings.filter(booking => booking.status === 'pending').length,
        completedBookings: allBookings.filter(booking => booking.status === 'completed').length,
        cancelledBookings: allBookings.filter(booking => booking.status === 'cancelled').length,
        averageRating,
        totalReviews: reviews.length,
        conversionRate,
        growthRate
      };
      
      console.log('Business stats calculated:', stats);
      
      res.json({
        success: true,
        data: stats
      });
    } else {
      // Get customer stats with better error handling
      let allBookings = [];
      let recentBookings = [];
      
      try {
        allBookings = await Booking.find({ customerId: userId });
        console.log(`Found ${allBookings.length} total bookings for customer ${userId}`);
      } catch (err) {
        console.error('Error fetching customer bookings:', err);
        allBookings = [];
      }
      
      try {
        recentBookings = await Booking.find({ 
          customerId: userId,
          createdAt: { $gte: startDate }
        });
        console.log(`Found ${recentBookings.length} recent bookings for customer ${userId}`);
      } catch (err) {
        console.error('Error fetching recent customer bookings:', err);
        recentBookings = [];
      }
      
      // Calculate customer revenue (amount spent)
      const completedBookings = allBookings.filter(booking => booking.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      
      const monthlyCompletedBookings = completedBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        const currentMonth = new Date();
        return bookingDate.getMonth() === currentMonth.getMonth() && 
               bookingDate.getFullYear() === currentMonth.getFullYear();
      });
      const monthlyRevenue = monthlyCompletedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      
      const stats = {
        totalBookings: allBookings.length,
        todayBookings: allBookings.filter(booking => {
          const today = new Date();
          const bookingDate = new Date(booking.date);
          return today.toDateString() === bookingDate.toDateString() && 
                 ['pending', 'confirmed'].includes(booking.status);
        }).length,
        monthlyBookings: recentBookings.length,
        totalRevenue,
        monthlyRevenue,
        totalServices: 0, // Not applicable for customers
        totalCustomers: 0, // Not applicable for customers
        pendingBookings: allBookings.filter(booking => booking.status === 'pending').length,
        completedBookings: allBookings.filter(booking => booking.status === 'completed').length,
        cancelledBookings: allBookings.filter(booking => booking.status === 'cancelled').length,
        averageRating: 0, // Not applicable for customers
        totalReviews: 0, // Not applicable for customers
        conversionRate: 0, // Not applicable for customers
        growthRate: 0 // Not applicable for customers
      };
      
      console.log('Customer stats calculated:', stats);
      
      res.json({
        success: true,
        data: stats
      });
    }
    
  } catch (error) {
    console.error('Get stats error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
      userRole: req.user?.role,
      timeRange: req.query.timeRange
    });
    
    // Return 500 error with detailed information for debugging
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الحجوزات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        userId: req.user?._id,
        userRole: req.user?.role
      } : undefined
    });
  }
});

module.exports = router;
