import { google } from 'googleapis';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { getValidOAuth2Client } from '../controllers/authController.js';
import User from '../models/User.js';
import SentEmail from '../models/SentEmail.js';
import Campaign from '../models/Campaign.js';
import CampaignContact from '../models/CampaignContact.js';
import Contact from '../models/Contact.js';

/**
 * Email Service - Handles sending emails via Gmail API
 * Uses automatic token refresh - users never need to reconnect!
 */

/**
 * Convert HTML to plain text
 */
const htmlToPlainText = (html) => {
  if (!html) return '';
  
  if (!html.includes('<') && !html.includes('>')) {
    return html;
  }
  
  let text = html;
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/?ul>/gi, '\n');
  text = text.replace(/<\/?ol>/gi, '\n');
  text = text.replace(/<li>/gi, '• ');
  text = text.replace(/<\/?(?:b|strong)>/gi, '');
  text = text.replace(/<\/?(?:i|em)>/gi, '');
  text = text.replace(/<\/?u>/gi, '');
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '$2 ($1)');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  
  return text;
};

/**
 * Check if content contains HTML
 */
const isHTML = (str) => {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

/**
 * Create email message in RFC 2822 format with attachments
 * Attachments can be either:
 * - base64: { filename, mimetype, content (base64 string) } - from frontend
 * - file path: { filename, path } - legacy support
 */
const createMessage = async (to, subject, body, from = 'me', attachments = []) => {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const plainTextBody = isHTML(body) ? htmlToPlainText(body) : body;
  
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
  ];

  if (attachments && attachments.length > 0) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    headers.push('');

    const parts = [`--${boundary}`];

    parts.push(
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      plainTextBody
    );

    for (const attachment of attachments) {
      try {
        let base64Content;
        let contentType;
        
        // Check if attachment has base64 content directly (from frontend)
        if (attachment.content) {
          // Base64 content sent directly from frontend - NO FILE STORAGE
          base64Content = attachment.content;
          contentType = attachment.mimetype || 'application/octet-stream';
          logger.info(`Using base64 attachment: ${attachment.filename} (${contentType})`);
        } else if (attachment.path) {
          // Legacy: file path (for backwards compatibility)
          const fs = await import('fs/promises');
          const path = await import('path');
          
          logger.info(`Reading attachment from file: ${attachment.path}`);
          const fileContent = await fs.readFile(attachment.path);
          base64Content = fileContent.toString('base64');
          
          const ext = path.extname(attachment.filename).toLowerCase();
          contentType = getContentType(ext);
        } else {
          logger.warn(`Skipping attachment ${attachment.filename}: no content or path`);
          continue;
        }

        parts.push(
          `--${boundary}`,
          `Content-Type: ${contentType}; name="${attachment.filename}"`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          '',
          base64Content
        );
      } catch (fileError) {
        logger.error(`Error processing attachment ${attachment.filename}:`, fileError);
      }
    }

    parts.push(`--${boundary}--`);

    const message = headers.concat(parts).join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  } else {
    const parts = [
      ...headers,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      plainTextBody
    ].join('\n');

    const encodedMessage = Buffer.from(parts)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  }
};

/**
 * Get MIME content type based on file extension
 */
const getContentType = (ext) => {
  const types = {
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.zip': 'application/zip',
    '.csv': 'text/csv',
  };
  return types[ext] || 'application/octet-stream';
};

/**
 * Replace template variables in email content
 */
const replaceVariables = (template, variables) => {
  let result = template;

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'gi');
    result = result.replace(regex, variables[key] || '');
  });

  return result;
};

/**
 * Send a single email with automatic token refresh
 */
export const sendEmail = async (userId, to, subject, body, campaignId = null, contactId = null, attachments = [], recipientName = null) => {
  try {
    const user = await User.findById(userId).select('email').lean();

    if (!user) {
      throw new Error('User not found');
    }

    const { email: userEmail } = user;

    // Get valid OAuth2 client (auto-refreshes token if needed)
    const oauth2Client = await getValidOAuth2Client(userId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create email message with attachments
    const encodedMessage = await createMessage(to, subject, body, userEmail, attachments);

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    logger.info(`Email sent successfully to ${to}`, {
      messageId: response.data.id,
      userId,
      campaignId,
    });

    // Track sent email in database
    await SentEmail.create({
      campaignId,
      contactId,
      userId,
      gmailMessageId: response.data.id,
      subject,
      body,
      recipientEmail: to,
      recipientName: recipientName || to.split('@')[0],
      sentAt: new Date()
    });

    logger.info(`Tracked email in database - Campaign: ${campaignId}, Recipient: ${to}`);

    // Update contact status if contact exists
    if (contactId) {
      await Contact.findByIdAndUpdate(contactId, { status: 'sent' });
    }

    return {
      success: true,
      messageId: response.data.id,
      to,
    };
  } catch (error) {
    logger.error('Error sending email:', error);

    if (contactId) {
      await Contact.findByIdAndUpdate(contactId, { status: 'failed' });
    }

    throw error;
  }
};

/**
 * Send bulk emails for a campaign
 */
export const sendCampaignEmails = async (campaignId, userId) => {
  try {
    const campaign = await Campaign.findOne({ _id: campaignId, userId }).lean();

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get pending contacts
    const contacts = await CampaignContact.find({
      campaignId,
      status: 'pending'
    }).limit(campaign.dailyLimit || 50).lean();

    const results = {
      total: contacts.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const contact of contacts) {
      try {
        const variables = {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          company: contact.company,
          jobTitle: contact.jobTitle,
          ...contact.customFields,
        };

        const personalizedSubject = replaceVariables(campaign.subject, variables);
        const personalizedBody = replaceVariables(campaign.body, variables);

        await sendEmail(
          userId,
          contact.email,
          personalizedSubject,
          personalizedBody,
          campaignId,
          contact._id
        );

        // Update contact status
        await CampaignContact.findByIdAndUpdate(contact._id, {
          status: 'sent',
          sentAt: new Date()
        });

        results.sent++;

        if (campaign.delayMin && campaign.delayMax) {
          const delay = Math.random() * (campaign.delayMax - campaign.delayMin) + campaign.delayMin;
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          contact: contact.email,
          error: error.message,
        });

        await CampaignContact.findByIdAndUpdate(contact._id, {
          status: 'failed',
          errorMessage: error.message
        });

        logger.error(`Failed to send email to ${contact.email}:`, error);
      }
    }

    logger.info(`Campaign ${campaignId} completed:`, results);
    return results;
  } catch (error) {
    logger.error('Error in sendCampaignEmails:', error);
    throw error;
  }
};

/**
 * Test email connection with automatic token refresh
 */
export const testEmailConnection = async (userId) => {
  try {
    const user = await User.findById(userId).select('email').lean();

    if (!user) {
      throw new Error('User not found');
    }

    const oauth2Client = await getValidOAuth2Client(userId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const profile = await gmail.users.getProfile({ userId: 'me' });

    return {
      success: true,
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
    };
  } catch (error) {
    logger.error('Email connection test failed:', error);
    throw error;
  }
};

/**
 * Send admin authentication code
 */
export const sendAdminCode = async (adminEmail, code) => {
  try {
    const user = await User.findOne({ refreshToken: { $ne: null } })
      .sort({ createdAt: 1 })
      .lean();

    if (!user) {
      throw new Error('No valid sender available. Please ensure at least one user is connected.');
    }

    const senderId = user._id;
    const senderEmail = user.email;

    const oauth2Client = await getValidOAuth2Client(senderId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const subject = 'MailPal Admin Authentication Code';
    const body = `
Your admin authentication code is:

${code}

This code will expire in 10 minutes.

⚠️ Do not share this code with anyone.
If you did not request this code, please ignore this email.

---
MailPal Admin System
    `.trim();

    const messageParts = [
      `From: ${senderEmail}`,
      `To: ${adminEmail}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ];
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    logger.info(`Admin code sent to ${adminEmail} from ${senderEmail}`);
    return { success: true };
  } catch (error) {
    logger.error('Failed to send admin code:', error);
    throw error;
  }
};

export default {
  sendEmail,
  sendCampaignEmails,
  testEmailConnection,
  sendAdminCode,
};
