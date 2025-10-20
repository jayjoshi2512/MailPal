import express from 'express';
import authRoutes from './authRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import contactRoutes from './contactRoutes.js';
import emailRoutes from './emailRoutes.js';
import uploadRoutes from './upload.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MailKar API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/campaigns/:campaignId/contacts', contactRoutes);
router.use('/emails', emailRoutes);
router.use('/upload', uploadRoutes);

export default router;
