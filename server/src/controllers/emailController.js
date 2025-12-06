import emailService from '../services/emailService.js';
import logger from '../config/logger.js';
import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import SentEmail from '../models/SentEmail.js';
import EmailQueue from '../models/EmailQueue.js';

// In-memory tracking for active email jobs (for real-time status)
const activeJobs = new Map();

/**
 * Get or create default "Manual Emails" campaign for compose page emails
 */
const getOrCreateManualCampaign = async (userId) => {
  try {
    let campaign = await Campaign.findOne({ userId, name: 'Manual Emails' });

    if (campaign) {
      return campaign._id;
    }

    campaign = await Campaign.create({
      userId,
      name: 'Manual Emails',
      status: 'active'
    });

    return campaign._id;
  } catch (error) {
    logger.error('Error getting/creating manual campaign:', error);
    return null;
  }
};

/**
 * Get or create contact for email recipient (compose contacts ONLY)
 * This should ONLY be used for manual emails from compose page
 * Campaign recipients should NOT be added to personal contacts
 */
const getOrCreateContact = async (userId, email, name = null, campaignId = null) => {
  try {
    // If this is a campaign email, DON'T create a personal contact
    // Campaign recipients are tracked separately via SentEmail model
    if (campaignId) {
      // Check if this is the "Manual Emails" campaign (compose page)
      const campaign = await Campaign.findById(campaignId);
      if (campaign && campaign.name !== 'Manual Emails') {
        // This is a real campaign, not manual compose - don't create contact
        return null;
      }
    }
    
    // Only create contact for manual/compose emails
    let contact = await Contact.findOne({ userId, email, isActive: true });

    if (contact) {
      return contact._id;
    }

    contact = await Contact.create({
      userId,
      email,
      name: name || email.split('@')[0],
      isActive: true
    });

    return contact._id;
  } catch (error) {
    logger.error('Error getting/creating contact:', error);
    return null;
  }
};

/**
 * Process emails sequentially with delay to avoid rate limits
 * This runs in the background after response is sent
 */
const processEmailQueue = async (jobId, userId, recipients, subject, body, attachments, campaignId) => {
  const job = activeJobs.get(jobId);
  if (!job) return;

  const DELAY_BETWEEN_EMAILS = 1000; // 1 second delay between emails to avoid rate limits
  const BATCH_SIZE = 10; // Process in batches
  const BATCH_DELAY = 5000; // 5 second delay between batches

  logger.info(`📧 Starting email job ${jobId}: ${recipients.length} recipients`);

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      // Get or create contact (only for manual emails, not campaigns)
      const contactId = await getOrCreateContact(userId, recipient, null, campaignId);
      
      // Send the email
      await emailService.sendEmail(
        userId,
        recipient,
        subject,
        body,
        campaignId,
        contactId,
        attachments,
        null
      );

      job.sent++;
      job.processed++;
      logger.info(`[${job.processed}/${job.total}] Email sent to ${recipient}`);

    } catch (error) {
      job.failed++;
      job.processed++;
      job.errors.push({ email: recipient, error: error.message });
      logger.error(`❌ [${job.processed}/${job.total}] Failed to send to ${recipient}: ${error.message}`);
    }

    // Update job status
    job.status = job.processed === job.total ? 'completed' : 'processing';

    // Add delay between emails
    if (i < recipients.length - 1) {
      // Longer delay after each batch
      if ((i + 1) % BATCH_SIZE === 0) {
        logger.info(`⏳ Batch completed, waiting ${BATCH_DELAY/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      } else {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS));
      }
    }
  }

  job.completedAt = new Date();
  logger.info(`📧 Email job ${jobId} completed: ${job.sent} sent, ${job.failed} failed`);

  // No file cleanup needed - attachments sent as base64 from browser memory

  // Keep job in memory for 5 minutes for status checking, then remove
  setTimeout(() => {
    activeJobs.delete(jobId);
  }, 5 * 60 * 1000);
};

/**
 * Get compose email history
 */
export const getComposeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Get Manual Emails campaign
    const manualCampaign = await Campaign.findOne({ userId, name: 'Manual Emails' });

    const query = {
      userId,
      $or: [
        { campaignId: manualCampaign?._id },
        { campaignId: null }
      ]
    };

    if (search) {
      query.$and = [{
        $or: [
          { subject: { $regex: search, $options: 'i' } },
          { recipientEmail: { $regex: search, $options: 'i' } },
          { recipientName: { $regex: search, $options: 'i' } }
        ]
      }];
    }

    const [emails, total] = await Promise.all([
      SentEmail.find(query)
        .sort({ sentAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      SentEmail.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        emails: emails.map(row => ({
          id: row._id,
          subject: row.subject || 'No Subject',
          body: row.body,
          recipientEmail: row.recipientEmail,
          recipientName: row.recipientName,
          sentAt: row.sentAt,
          status: row.status || 'sent'
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get compose history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compose history',
      message: error.message
    });
  }
};

/**
 * Send a test email - NOW WITH BACKGROUND PROCESSING
 * For bulk emails (>1 recipient), returns immediately and processes in background
 */
export const sendTestEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { to, subject, body, attachments = [], campaignId = null, recipientName = null } = req.body;

    const effectiveCampaignId = campaignId || await getOrCreateManualCampaign(userId);
    const recipients = Array.isArray(to) ? to : [to];

    // For single email, send synchronously (fast)
    if (recipients.length === 1) {
      const contactId = await getOrCreateContact(userId, recipients[0], recipientName, effectiveCampaignId);
      
      try {
        const result = await emailService.sendEmail(
          userId,
          recipients[0],
          subject,
          body,
          effectiveCampaignId,
          contactId,
          attachments,
          recipientName
        );

        // No file cleanup needed - attachments sent as base64 from browser memory

        return res.json({
          success: true,
          data: {
            sent: 1,
            failed: 0,
            total: 1,
            immediate: true
          },
          message: `Email sent to ${recipients[0]}`,
        });
      } catch (error) {
        logger.error('Single email send error:', error);
        
        return res.status(500).json({
          success: false,
          error: 'Failed to send email',
          message: error.message,
        });
      }
    }

    // For bulk emails (>1 recipient), process in background
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job tracking
    const job = {
      id: jobId,
      userId: userId.toString(),
      status: 'queued',
      total: recipients.length,
      sent: 0,
      failed: 0,
      processed: 0,
      errors: [],
      startedAt: new Date(),
      completedAt: null
    };
    activeJobs.set(jobId, job);

    // Start processing in background (don't await!)
    processEmailQueue(jobId, userId, recipients, subject, body, attachments, effectiveCampaignId)
      .catch(err => {
        logger.error(`Background email job ${jobId} failed:`, err);
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = err.message;
        }
      });

    // Return immediately with job ID
    logger.info(`📧 Bulk email job ${jobId} queued: ${recipients.length} recipients`);
    
    res.json({
      success: true,
      data: {
        jobId,
        total: recipients.length,
        status: 'queued',
        immediate: false
      },
      message: `Sending ${recipients.length} emails in background. Check status with job ID.`,
    });

  } catch (error) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue emails',
      message: error.message,
    });
  }
};

/**
 * Get email job status
 */
export const getEmailJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id.toString();

    const job = activeJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or expired',
        message: 'Job status is only available for 5 minutes after completion'
      });
    }

    // Security: Only allow user to see their own jobs
    if (job.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        total: job.total,
        sent: job.sent,
        failed: job.failed,
        processed: job.processed,
        progress: Math.round((job.processed / job.total) * 100),
        errors: job.errors.slice(-10), // Last 10 errors
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }
    });
  } catch (error) {
    logger.error('Get job status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job status'
    });
  }
};

/**
 * Send campaign emails
 */
export const sendCampaignEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { campaignId } = req.params;

    const results = await emailService.sendCampaignEmails(campaignId, userId);

    res.json({
      success: true,
      data: results,
      message: `Campaign emails sent: ${results.sent} successful, ${results.failed} failed`,
    });
  } catch (error) {
    logger.error('Send campaign emails error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send campaign emails',
      message: error.message,
    });
  }
};

/**
 * Test email connection
 */
export const testConnection = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await emailService.testEmailConnection(userId);

    res.json({
      success: true,
      data: result,
      message: 'Email connection is working',
    });
  } catch (error) {
    logger.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Email connection test failed',
      message: error.message,
    });
  }
};

export default {
  sendTestEmail,
  sendCampaignEmails,
  testConnection,
  getComposeHistory,
  getEmailJobStatus,
};
