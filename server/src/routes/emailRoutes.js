import express from 'express';
import { body } from 'express-validator';
import {
  sendTestEmail,
  sendCampaignEmails,
  testConnection,
  getComposeHistory,
} from '../controllers/emailController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { emailLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const sendTestEmailValidation = [
  body('to').isEmail().withMessage('Valid recipient email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('body').trim().notEmpty().withMessage('Email body is required'),
];

// Routes
router.post('/test', emailLimiter, sendTestEmailValidation, validate, sendTestEmail);
router.post('/campaign/:campaignId/send', emailLimiter, sendCampaignEmails);
router.get('/test-connection', testConnection);
router.get('/compose-history', getComposeHistory);

export default router;
