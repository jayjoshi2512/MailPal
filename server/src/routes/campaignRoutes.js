import express from 'express';
import { body } from 'express-validator';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignAnalytics,
} from '../controllers/campaignController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createCampaignValidation = [
  body('name').trim().notEmpty().withMessage('Campaign name is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('body').trim().notEmpty().withMessage('Email body is required'),
  body('daily_limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Daily limit must be between 1 and 500'),
  body('delay_min')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Min delay must be positive'),
  body('delay_max')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max delay must be positive'),
];

// Routes
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaignValidation, validate, createCampaign);
router.patch('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);
router.get('/:id/analytics', getCampaignAnalytics);

export default router;
