import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  subject: {
    type: String
  },
  body: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  dailyLimit: {
    type: Number,
    default: 50
  },
  delayMin: {
    type: Number,
    default: 5  // Min seconds between emails
  },
  delayMax: {
    type: Number,
    default: 15  // Max seconds between emails
  },
  trackOpens: {
    type: Boolean,
    default: false
  },
  trackClicks: {
    type: Boolean,
    default: false
  },
  attachments: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  scheduledAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for common queries
campaignSchema.index({ userId: 1, isActive: 1, status: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
