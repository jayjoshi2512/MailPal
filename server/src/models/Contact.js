import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
  }
}, {
  timestamps: true
});

// Compound unique index - each user can only have one contact per email
contactSchema.index({ userId: 1, email: 1 }, { unique: true });

// Index for common queries
contactSchema.index({ userId: 1, isActive: 1, isFavorite: -1, createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
