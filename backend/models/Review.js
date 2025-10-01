import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'التقييم مطلوب'],
    min: [1, 'التقييم يجب أن يكون 1 على الأقل'],
    max: [5, 'التقييم لا يمكن أن يتجاوز 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'عنوان التقييم لا يمكن أن يتجاوز 100 حرف']
  },
  comment: {
    type: String,
    required: [true, 'تعليق التقييم مطلوب'],
    trim: true,
    maxlength: [1000, 'تعليق التقييم لا يمكن أن يتجاوز 1000 حرف']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    comment: String,
    editedAt: Date,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportCount: {
    type: Number,
    default: 0
  },
  reportedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: Date
  }],
  response: {
    businessResponse: String,
    businessResponseAt: Date,
    businessResponseBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  tags: [String], // For categorizing reviews (e.g., "quality", "service", "cleanliness")
  photos: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    caption: String
  }],
  anonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
reviewSchema.index({ businessId: 1, createdAt: -1 });
reviewSchema.index({ serviceId: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, businessId: 1 });
reviewSchema.index({ isVerified: 1, isPublic: 1 });
reviewSchema.index({ businessId: 1, rating: 1, createdAt: -1 });

// Virtual for review status
reviewSchema.virtual('status').get(function() {
  if (this.isPublic === false) return 'hidden';
  if (this.reportCount >= 5) return 'flagged';
  return 'active';
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate one review per booking
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      bookingId: this.bookingId,
      customerId: this.customerId
    });
    
    if (existingReview) {
      return next(new Error('يمكن كتابة تقييم واحد فقط لكل حجز'));
    }
  }
  next();
});

// Static method to calculate average rating for a business
reviewSchema.statics.getAverageRating = async function(businessId) {
  const result = await this.aggregate([
    {
      $match: {
        businessId: businessId,
        isPublic: true,
        isVerified: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const ratingDistribution = result[0].ratingDistribution.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    ratingDistribution
  };
};

export default mongoose.model('Review', reviewSchema);

