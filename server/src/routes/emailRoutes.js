import express from 'express';
import { body } from 'express-validator';
import {
  sendTestEmail,
  sendCampaignEmails,
  testConnection,
  getComposeHistory,
  getEmailJobStatus,
} from '../controllers/emailController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { emailLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules - Updated to accept array of emails
const sendTestEmailValidation = [
  body('to').custom((value) => {
    // Accept both single email and array of emails
    if (Array.isArray(value)) {
      if (value.length === 0) throw new Error('At least one recipient is required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of value) {
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid email: ${email}`);
        }
      }
      return true;
    }
    // Single email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Valid recipient email is required');
    }
    return true;
  }),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('body').trim().notEmpty().withMessage('Email body is required'),
];

// Routes
router.post('/test', emailLimiter, sendTestEmailValidation, validate, sendTestEmail);
router.get('/job/:jobId', getEmailJobStatus); // New: Check job status
router.post('/campaign/:campaignId/send', emailLimiter, sendCampaignEmails);
router.get('/test-connection', testConnection);
router.get('/compose-history', getComposeHistory);

export default router;
