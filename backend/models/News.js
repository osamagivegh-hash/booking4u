const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان الخبر مطلوب'],
    trim: true,
    maxlength: [200, 'عنوان الخبر لا يمكن أن يتجاوز 200 حرف']
  },
  content: {
    type: String,
    required: [true, 'محتوى الخبر مطلوب'],
    maxlength: [2000, 'محتوى الخبر لا يمكن أن يتجاوز 2000 حرف']
  },
  summary: {
    type: String,
    maxlength: [500, 'ملخص الخبر لا يمكن أن يتجاوز 500 حرف']
  },
  category: {
    type: String,
    required: [true, 'فئة الخبر مطلوبة'],
    enum: [
      'general',      // عام
      'business',     // أعمال
      'health',       // صحة
      'beauty',       // جمال
      'technology',   // تكنولوجيا
      'lifestyle',    // نمط حياة
      'promotions',   // عروض
      'announcements' // إعلانات
    ],
    default: 'general'
  },
  image: {
    type: String,
    default: 'default-news-image.png'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  language: {
    type: String,
    default: 'ar',
    enum: ['ar', 'en']
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Index for efficient queries
newsSchema.index({ isPublished: 1, publishedAt: -1 });
newsSchema.index({ category: 1, isPublished: 1 });
newsSchema.index({ isFeatured: 1, isPublished: 1 });
newsSchema.index({ isBreaking: 1, isPublished: 1 });
newsSchema.index({ title: 'text', content: 'text', summary: 'text' }); // Text search index
newsSchema.index({ tags: 1 });

// Virtual for formatted published date
newsSchema.virtual('formattedPublishedAt').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to increment views
newsSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment likes
newsSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Method to increment shares
newsSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Pre-save middleware to set publishedAt when isPublished becomes true
newsSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('News', newsSchema);




