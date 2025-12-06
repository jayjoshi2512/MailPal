import mongoose from 'mongoose';

const campaignContactSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced', 'replied'],
    default: 'pending',
    index: true
  },
  sentAt: {
    type: Date
  },
  errorMessage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound unique index - same email can only be added once per campaign
campaignContactSchema.index({ campaignId: 1, email: 1 }, { unique: true });

// Index for common queries
campaignContactSchema.index({ campaignId: 1, isActive: 1, status: 1 });

const CampaignContact = mongoose.model('CampaignContact', campaignContactSchema);

export default CampaignContact;
