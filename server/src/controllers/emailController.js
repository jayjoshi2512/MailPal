import emailService from '../services/emailService.js';
import logger from '../config/logger.js';

/**
 * Send a test email
 */
export const sendTestEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, subject, body, attachments = [] } = req.body;

    // Support multiple recipients
    const recipients = Array.isArray(to) ? to : [to];
    
    // Send to all recipients with attachments
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        emailService.sendEmail(userId, recipient, subject, body, null, null, attachments)
      )
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
