import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../config/index.js';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Validate that userId is a valid MongoDB ObjectId
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token format. Please log out and log in again.',
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId)
      .select('_id googleId email name profilePicture isActive')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    // Check if user is soft-deleted
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Account has been deleted. Please log in again to create a new account.',
      });
    }

    // Attach user to request object (also add id for backwards compatibility)
    req.user = { ...user, id: user._id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }

    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token format. Please log out and log in again.',
      });
    }

    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    // Validate that userId is a valid MongoDB ObjectId
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return next();
    }

    const user = await User.findById(decoded.userId)
      .select('_id googleId email name profilePicture')
      .lean();

    if (user) {
      req.user = { ...user, id: user._id };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
