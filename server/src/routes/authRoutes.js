import express from 'express';
import {
  getGoogleAuthUrl,
  googleCallback,
  getCurrentUser,
  logout,
  refreshToken,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/google', authLimiter, getGoogleAuthUrl);
router.get('/google/callback', authLimiter, googleCallback);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, refreshToken);

export default router;
