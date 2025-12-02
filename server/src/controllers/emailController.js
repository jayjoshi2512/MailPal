import emailService from '../services/emailService.js';
import logger from '../config/logger.js';
import { query } from '../config/database.js';

/**
 * Get or create default "Manual Emails" campaign for compose page emails
 */
const getOrCreateManualCampaign = async (userId) => {
  try {
    // Check if manual campaign exists
    let result = await query(
      `SELECT id FROM campaigns WHERE user_id = $1 AND name = 'Manual Emails' LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create manual campaign
    result = await query(
      `INSERT INTO campaigns (user_id, name, status, created_at, updated_at) 
       VALUES ($1, 'Manual Emails', 'active', NOW(), NOW()) 
       RETURNING id`,
      [userId]
    );

    return result.rows[0].id;
  } catch (error) {
    logger.error('Error getting/creating manual campaign:', error);
    return null;
  }
};

/**
 * Get or create contact for email recipient
 */
const getOrCreateContact = async (userId, email, name = null) => {
  try {
    // Check if contact exists
    let result = await query(
      `SELECT id FROM contacts WHERE user_id = $1 AND email = $2 LIMIT 1`,
      [userId, email]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create contact
    result = await query(
      `INSERT INTO contacts (user_id, email, name, status, created_at, updated_at) 
       VALUES ($1, $2, $3, 'active', NOW(), NOW()) 
       RETURNING id`,
      [userId, email, name || email.split('@')[0]]
    );

    return result.rows[0].id;
  } catch (error) {
    logger.error('Error getting/creating contact:', error);
    return null;
  }
};

/**
 * Send a test email
 */
export const sendTestEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, subject, body, attachments = [], campaignId = null, recipientName = null } = req.body;

    // If campaignId is provided, use it; otherwise get or create manual campaign
    const effectiveCampaignId = campaignId || await getOrCreateManualCampaign(userId);

    // Support multiple recipients
    const recipients = Array.isArray(to) ? to : [to];
    
    // Send to all recipients with attachments and tracking
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        // Get or create contact for this recipient
        const contactId = await getOrCreateContact(userId, recipient);
        
        // Send email with campaign and contact tracking
        return emailService.sendEmail(
          userId, 
          recipient, 
          subject, 
          body, 
          effectiveCampaignId, 
          contactId, 
          attachments,
          recipientName
        );
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      data: {
        sent: successful,
        failed: failed,
        total: recipients.length
      },
      message: `Email sent to ${successful} of ${recipients.length} recipients`,
    });
  } catch (error) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      message: error.message,
    });
  }
};

/**
 * Send campaign emails
 */
export const sendCampaignEmails = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;

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
};
