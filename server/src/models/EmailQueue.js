import mongoose from 'mongoose';

const emailQueueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  campaignContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampaignContact',
    required: true
  },
  sequenceStep: {
    type: Number,
    default: 1
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  errorMessage: {
    type: String
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for queue processing
emailQueueSchema.index({ scheduledFor: 1, status: 1 });
emailQueueSchema.index({ userId: 1, status: 1 });

const EmailQueue = mongoose.model('EmailQueue', emailQueueSchema);

export default EmailQueue;
