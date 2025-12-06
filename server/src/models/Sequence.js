import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  stepNumber: {
    type: Number,
    required: true
  },
  delayDays: {
    type: Number,
    required: true,
    default: 1
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  stopOnReply: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index - unique step number per campaign
sequenceSchema.index({ campaignId: 1, stepNumber: 1 }, { unique: true });

const Sequence = mongoose.model('Sequence', sequenceSchema);

export default Sequence;
