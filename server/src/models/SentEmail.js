import mongoose from 'mongoose';

const sentEmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    index: true
  },
  campaignContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampaignContact'
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  sequenceStep: {
    type: Number,
    default: 1
  },
  gmailMessageId: {
    type: String,
    index: true
  },
  threadId: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String
  },
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  recipientName: {
    type: String,
    trim: true
  },
  attachments: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
    default: 'sent',
    index: true
  },
  isCompose: {
    type: Boolean,
    default: false,
    index: true
  },
  errorMessage: {
    type: String
  },
  openedAt: {
    type: Date
  },
  clickedAt: {
    type: Date
  },
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
sentEmailSchema.index({ userId: 1, sentAt: -1 });
sentEmailSchema.index({ userId: 1, campaignId: 1, sentAt: -1 });
sentEmailSchema.index({ userId: 1, isCompose: 1, sentAt: -1 });

const SentEmail = mongoose.model('SentEmail', sentEmailSchema);

export default SentEmail;
