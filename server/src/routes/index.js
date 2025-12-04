import express from 'express';
import authRoutes from './authRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import contactRoutes from './contactRoutes.js';
import contactsGeneralRoutes from './contacts.js';
import emailRoutes from './emailRoutes.js';
import uploadRoutes from './upload.js';
import dashboardRoutes from './dashboardRoutes.js';
import aiRoutes from './aiRoutes.js';
import templateRoutes from './templates.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'mailpal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/campaigns/:campaignId/contacts', contactRoutes);
router.use('/contacts', contactsGeneralRoutes); // General contacts management
router.use('/templates', templateRoutes);
router.use('/emails', emailRoutes);
router.use('/upload', uploadRoutes);
router.use('/ai', aiRoutes);

export default router;
