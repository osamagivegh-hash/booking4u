import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'اسم النشاط مطلوب'],
    trim: true,
    maxlength: [100, 'اسم النشاط لا يمكن أن يتجاوز 100 حرف']
  },
  description: {
    type: String,
    maxlength: [500, 'الوصف لا يمكن أن يتجاوز 500 حرف']
  },
  category: {
    type: String,
    required: [true, 'فئة النشاط مطلوبة'],
    enum: [
      'clinic',        // عيادة
      'salon',         // صالون تجميل
      'spa',           // سبا
      'gym',           // صالة رياضية
      'restaurant',    // مطعم
      'consultation',  // استشارات
      'education',     // تعليم
      'other'          // أخرى
    ]
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب']
  },
  website: String,
  logo: {
    type: String,
    default: 'default-business-logo.png'
  },
  images: [String],
  workingHours: {
    sunday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: false } 
    },
    monday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    tuesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    wednesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    thursday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    friday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: false } 
    },
    saturday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      isOpen: { type: Boolean, default: true } 
    }
  },
  settings: {
    bookingAdvanceDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },
    maxBookingsPerDay: {
      type: Number,
      default: 50,
      min: 1
    },
    bookingDuration: {
      type: Number,
      default: 60, // minutes
      min: 15,
      max: 480
    },
    allowCancellation: {
      type: Boolean,
      default: true
    },
    cancellationHours: {
      type: Number,
      default: 24,
      min: 0
    },
    sendNotifications: {
      type: Boolean,
      default: true
    },
    requireConfirmation: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
businessSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text' 
});

export default mongoose.model('Business', businessSchema);
