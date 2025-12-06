import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  refreshToken: {
    type: String,
    required: true
  },
  accessToken: {
    type: String
  },
  tokenExpiresAt: {
    type: Date
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Add index for common queries
userSchema.index({ isActive: 1, email: 1 });

const User = mongoose.model('User', userSchema);

export default User;
