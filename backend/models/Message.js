import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'موضوع الرسالة مطلوب'],
    trim: true,
    maxlength: [200, 'موضوع الرسالة لا يمكن أن يتجاوز 200 حرف']
  },
  content: {
    type: String,
    required: [true, 'محتوى الرسالة مطلوب'],
    trim: true,
    maxlength: [2000, 'محتوى الرسالة لا يمكن أن يتجاوز 2000 حرف']
  },
  messageType: {
    type: String,
    enum: ['inquiry', 'booking_related', 'general', 'support'],
    default: 'general'
  },
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  relatedServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String], // For categorizing messages
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ relatedBookingId: 1 });
messageSchema.index({ relatedServiceId: 1 });

// Virtual for message status
messageSchema.virtual('status').get(function() {
  if (this.isDeleted) return 'deleted';
  if (this.isRead) return 'read';
  return 'unread';
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

// Pre-save middleware to set threadId if replyTo exists
messageSchema.pre('save', function(next) {
  if (this.replyTo && !this.threadId) {
    this.threadId = this.replyTo;
  }
  next();
});

export default mongoose.model('Message', messageSchema);

