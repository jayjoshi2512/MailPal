import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
    // NULL for system templates
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['campaign', 'compose', 'general'],
    default: 'general',
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  variables: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  useCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for common queries
templateSchema.index({ userId: 1, isActive: 1, category: 1 });
templateSchema.index({ isPublic: 1, isActive: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
