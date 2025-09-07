const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    required: [true, 'تاريخ الحجز مطلوب']
  },
  startTime: {
    type: String,
    required: [true, 'وقت بداية الحجز مطلوب'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة']
  },
  endTime: {
    type: String,
    required: [true, 'وقت نهاية الحجز مطلوب'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet'],
    default: 'cash'
  },
  paymentId: String, // For payment gateway reference
  notes: {
    customer: String, // ملاحظات العميل
    business: String  // ملاحظات صاحب النشاط
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['customer', 'business', 'system']
  },
  cancellationTime: Date,
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewDate: Date,
  isRescheduled: {
    type: Boolean,
    default: false
  },
  originalBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ businessId: 1, date: 1, status: 1 });
bookingSchema.index({ customerId: 1, date: 1 });
bookingSchema.index({ date: 1, startTime: 1, status: 1 });
bookingSchema.index({ status: 1, date: 1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    return Math.round((end - start) / (1000 * 60)); // Duration in minutes
  }
  return 0;
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate booking time
bookingSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    
    if (end <= start) {
      return next(new Error('وقت النهاية يجب أن يكون بعد وقت البداية'));
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
