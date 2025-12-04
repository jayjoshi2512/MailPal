import express from 'express';
import { 
    uploadFile, 
    uploadFiles, 
    deleteUploadedFile, 
    getMyUploads,
    // Email tracking with actual emails
    recordEmail,
    recordBulkEmail,
    getEmailsToRecipient,
    getMyRecipients,
    getEmailHistory,
    // Campaign email tracking
    recordCampaignEmailController,
    getCampaignRecipientEmailsController,
    getCampaignRecipientsController,
    // File management
    browseUploads,
    // Legacy
    createSession,
    addRecipient,
    getMySessions,
    getSession,
    markEmailSent
} from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * =====================================================
 * HUMAN-READABLE UPLOAD STRUCTURE
 * =====================================================
 * 
 * Folder Structure:
 * 
 * uploads/
 * ├── senders/
 * │   └── {sender_email}/                         # e.g., "john_at_gmail_com"
 * │       └── sent_to/
 * │           └── {recipient_email}/              # e.g., "client_at_company_com"
 * │               └── {YYYY-MM-DD_HH-MM-SS}/      # Timestamp folder
 * │                   ├── email_info.json         # Subject, body, sent time
 * │                   └── attachments/            # Actual files sent
 * │
 * ├── campaigns/
 * │   └── {campaign_name}_{id}/
 * │       └── recipients/
 * │           └── {recipient_email}/
 * │               └── {timestamp}/
 * │                   ├── email_info.json
 * │                   └── attachments/
 * │
 * └── temp/                                       # Before sending
 *     └── {sender_email}/
 *         └── {timestamp}/
 *             └── attachments/
 */

/**
 * =====================================================
 * EMAIL RECORD ROUTES (Uses actual email addresses)
 * =====================================================
 */

/**
 * @route   POST /api/upload/emails/record
 * @desc    Record a sent email (creates folder structure)
 * @body    { recipientEmail, subject, body, attachmentPaths }
 * @creates uploads/senders/{sender}/sent_to/{recipient}/{timestamp}/
 * @access  Private
 */
router.post('/emails/record', authenticate, recordEmail);

/**
 * @route   POST /api/upload/emails/record-bulk
 * @desc    Record bulk email to multiple recipients
 * @body    { recipientEmails: [], subject, body, attachmentPaths }
 * @access  Private
 */
router.post('/emails/record-bulk', authenticate, recordBulkEmail);

/**
 * @route   GET /api/upload/emails/history
 * @desc    Get sender's complete email history
 * @query   { limit: number }
 * @access  Private
 */
router.get('/emails/history', authenticate, getEmailHistory);

/**
 * @route   GET /api/upload/emails/recipients
 * @desc    Get all recipients the sender has emailed
 * @access  Private
 */
router.get('/emails/recipients', authenticate, getMyRecipients);

/**
 * @route   GET /api/upload/emails/to/:recipientEmail
 * @desc    Get all emails sent to a specific recipient
 * @access  Private
 */
router.get('/emails/to/:recipientEmail', authenticate, getEmailsToRecipient);

/**
 * =====================================================
 * CAMPAIGN EMAIL TRACKING ROUTES
 * =====================================================
 */

/**
 * @route   POST /api/upload/campaigns/:campaignId/emails/:recipientEmail
 * @desc    Record campaign email sent to recipient
 * @body    { subject, body, attachmentPaths, campaignName }
 * @creates uploads/campaigns/{campaign}/recipients/{recipient}/{timestamp}/
 * @access  Private
 */
router.post('/campaigns/:campaignId/emails/:recipientEmail', authenticate, recordCampaignEmailController);

/**
 * @route   GET /api/upload/campaigns/:campaignId/emails/:recipientEmail
 * @desc    Get all emails sent to recipient in campaign
 * @query   { campaignName }
 * @access  Private
 */
router.get('/campaigns/:campaignId/emails/:recipientEmail', authenticate, getCampaignRecipientEmailsController);

/**
 * @route   GET /api/upload/campaigns/:campaignId/recipients
 * @desc    Get all recipients in campaign with email history
 * @query   { campaignName }
 * @access  Private
 */
router.get('/campaigns/:campaignId/recipients', authenticate, getCampaignRecipientsController);

/**
 * =====================================================
 * FILE UPLOAD ROUTES
 * =====================================================
 */

/**
 * @route   POST /api/upload/single
 * @desc    Upload single file (to temp folder)
 * @files   file
 * @stores  uploads/temp/{sender_email}/{timestamp}/attachments/
 * @access  Private
 */
router.post('/single', authenticate, uploadSingle, handleUploadError, uploadFile);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files (to temp folder)
 * @files   files[]
 * @stores  uploads/temp/{sender_email}/{timestamp}/attachments/
 * @access  Private
 */
router.post('/multiple', authenticate, uploadMultiple, handleUploadError, uploadFiles);

/**
 * @route   GET /api/upload/my-uploads
 * @desc    Get all uploads for current user (from temp)
 * @access  Private
 */
router.get('/my-uploads', authenticate, getMyUploads);

/**
 * @route   GET /api/upload/browse
 * @desc    Browse upload folder structure
 * @query   { folderPath }
 * @access  Private
 */
router.get('/browse', authenticate, browseUploads);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', authenticate, deleteUploadedFile);

/**
 * =====================================================
 * LEGACY ROUTES (backward compatibility)
 * =====================================================
 */
router.post('/sessions', authenticate, createSession);
router.get('/sessions', authenticate, getMySessions);
router.get('/sessions/:sessionId', authenticate, getSession);
router.post('/sessions/:sessionId/recipients', authenticate, addRecipient);
router.post('/emails/:emailId/sent', authenticate, markEmailSent);

export default router;
