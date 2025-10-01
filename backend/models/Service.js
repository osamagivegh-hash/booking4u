import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: [true, 'اسم الخدمة مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الخدمة لا يمكن أن يتجاوز 100 حرف']
  },
  description: {
    type: String,
    maxlength: [500, 'الوصف لا يمكن أن يتجاوز 500 حرف']
  },
  duration: {
    type: Number,
    required: [true, 'مدة الخدمة مطلوبة'],
    min: [15, 'مدة الخدمة يجب أن تكون 15 دقيقة على الأقل'],
    max: [480, 'مدة الخدمة لا يمكن أن تتجاوز 8 ساعات']
  },
  price: {
    type: Number,
    required: [true, 'سعر الخدمة مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالب']
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  category: {
    type: String,
    required: [true, 'فئة الخدمة مطلوبة'],
    enum: [
      'haircut',       // قص شعر
      'hair_styling',  // تصفيف شعر
      'hair_coloring', // صبغ شعر
      'manicure',      // منيكير
      'pedicure',      // بديكير
      'facial',        // تنظيف بشرة
      'massage',       // مساج
      'consultation',  // استشارة
      'treatment',     // علاج
      'training',      // تدريب
      'other'          // أخرى
    ]
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  image: {
    type: String,
    default: 'default-service-image.png'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  maxBookingsPerDay: {
    type: Number,
    default: 10,
    min: 1
  },
  requiresStaff: {
    type: Boolean,
    default: false
  },
  staffIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  availableDays: {
    sunday: { type: Boolean, default: false },
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: true }
  },
  availableTimeSlots: [{
    startTime: String, // Format: "09:00"
    endTime: String,   // Format: "17:00"
    isActive: { type: Boolean, default: true }
  }],
  requirements: [String], // متطلبات خاصة بالخدمة
  notes: String // ملاحظات إضافية
}, {
  timestamps: true
});

// Index for efficient queries
serviceSchema.index({ businessId: 1, isActive: 1 });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' }); // Text search index

export default mongoose.model('Service', serviceSchema);
