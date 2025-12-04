import { google } from 'googleapis';
import { query } from '../config/database.js';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { getValidOAuth2Client } from '../controllers/authController.js';
import { recordSentEmail, recordCampaignEmail } from '../middleware/upload.js';

/**
 * Email Service - Handles sending emails via Gmail API
 * Uses automatic token refresh - users never need to reconnect!
 */

/**
 * Convert HTML to plain text
 * Handles common HTML tags from rich text editors
 */
const htmlToPlainText = (html) => {
    if (!html) return '';
    
    // If it's already plain text (no HTML tags), return as is
    if (!html.includes('<') && !html.includes('>')) {
        return html;
    }
    
    let text = html;
    
    // Replace <br> and <br/> with newlines
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Replace </div>, </p>, </li> with newlines
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<\/li>/gi, '\n');
    
    // Replace <ul> and <ol> tags
    text = text.replace(/<\/?ul>/gi, '\n');
    text = text.replace(/<\/?ol>/gi, '\n');
    
    // Handle list items - add bullet points
    text = text.replace(/<li>/gi, '• ');
    
    // Handle bold/strong - keep the text
    text = text.replace(/<\/?(?:b|strong)>/gi, '');
    
    // Handle italic/em - keep the text
    text = text.replace(/<\/?(?:i|em)>/gi, '');
    
    // Handle underline - keep the text
    text = text.replace(/<\/?u>/gi, '');
    
    // Handle links - extract text and URL
    text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '$2 ($1)');
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&apos;/g, "'");
    
    // Clean up multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
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
 * DEPRECATED: Old method - keeping for backward compatibility
 * Use getValidOAuth2Client() instead which handles auto-refresh
 */
const createOAuth2Client = (refreshToken, accessToken = null) => {
    const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUri
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken,
        access_token: accessToken,
    });

    return oauth2Client;
};

/**
 * Create email message in RFC 2822 format with attachments
 */
const createMessage = async (to, subject, body, from = 'me', attachments = []) => {
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Convert HTML to plain text if needed
    const plainTextBody = isHTML(body) ? htmlToPlainText(body) : body;
    
    // Build headers
    const headers = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
    ];

    // If we have attachments, use multipart/mixed
    if (attachments && attachments.length > 0) {
        headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        headers.push('');

        const parts = [`--${boundary}`];

        // Add body as first part (plain text)
        parts.push(
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 7bit',
            '',
            plainTextBody
        );

        // Add each attachment
        for (const attachment of attachments) {
            try {
                // Read file from disk
                const fs = await import('fs/promises');
                const path = await import('path');
                
                // Use the full path provided, or construct it if only filename is provided
                let filePath;
                if (attachment.path && attachment.path.includes('uploads')) {
                    // Full path provided
                    filePath = attachment.path;
                } else {
                    // Only filename provided, construct path
                    filePath = path.join(process.cwd(), 'uploads', path.basename(attachment.path || attachment.filename));
                }
                
                logger.info(`Reading attachment from: ${filePath}`);
                const fileContent = await fs.readFile(filePath);
                const base64Content = fileContent.toString('base64');

                // Detect content type based on file extension
                const ext = path.extname(attachment.filename).toLowerCase();
                const contentType = getContentType(ext);

                parts.push(
                    `--${boundary}`,
                    `Content-Type: ${contentType}; name="${attachment.filename}"`,
                    'Content-Transfer-Encoding: base64',
                    `Content-Disposition: attachment; filename="${attachment.filename}"`,
                    '',
                    base64Content
                );
            } catch (fileError) {
                logger.error(`Error reading attachment ${attachment.filename}:`, fileError);
                // Continue with other attachments
            }
        }

        // Close boundary
        parts.push(`--${boundary}--`);

        const message = headers.concat(parts).join('\n');
        
        // Encode message in base64url format
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        return encodedMessage;
    } else {
        // Simple message without attachments
        const parts = [
            ...headers,
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 7bit',
            '',
            plainTextBody
        ].join('\n');

        // Encode message in base64url format
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
        // Get user's email from database
        const userResult = await query(
            'SELECT email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const { email: userEmail } = userResult.rows[0];

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

        // Track sent email in database - always save with recipient info
        await query(
            `INSERT INTO sent_emails 
             (campaign_id, contact_id, user_id, gmail_message_id, subject, body, recipient_email, recipient_name, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [campaignId, contactId, userId, response.data.id, subject, body, to, recipientName || to.split('@')[0]]
        );

        logger.info(`Tracked email in database - Campaign: ${campaignId}, Recipient: ${to}`);

        // Also record to file system for easy browsing
        // Creates: uploads/senders/{sender}/sent_to/{recipient}/{timestamp}/
        try {
            const attachmentPaths = attachments.map(a => a.path).filter(Boolean);
            recordSentEmail(userEmail, to, {
                subject,
                body,
                messageId: response.data.id
            }, attachmentPaths);
            logger.info(`Recorded email to file system: ${userEmail} -> ${to}`);
        } catch (fileError) {
            // Non-critical error - don't fail the send
            logger.error('Error recording email to file system:', fileError);
        }

        // Update contact status if contact exists
        if (contactId) {
            await query(
                `UPDATE contacts SET status = 'sent', updated_at = NOW() WHERE id = $1`,
                [contactId]
            );
        }

        return {
            success: true,
            messageId: response.data.id,
            to,
        };
    } catch (error) {
        logger.error('Error sending email:', error);

        // Log failed email
        if (contactId) {
            await query(
                `UPDATE contacts SET status = 'failed', updated_at = NOW() WHERE id = $1`,
                [contactId]
            );
        }

        throw error;
    }
};

/**
 * Send bulk emails for a campaign
 */
export const sendCampaignEmails = async (campaignId, userId) => {
    try {
        // Get campaign details
        const campaignResult = await query(
            'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, userId]
        );

        if (campaignResult.rows.length === 0) {
            throw new Error('Campaign not found');
        }

        const campaign = campaignResult.rows[0];

        // Get pending contacts
        const contactsResult = await query(
            `SELECT * FROM contacts 
       WHERE campaign_id = $1 AND status = 'pending' 
       LIMIT $2`,
            [campaignId, campaign.daily_limit]
        );

        const contacts = contactsResult.rows;
        const results = {
            total: contacts.length,
            sent: 0,
            failed: 0,
            errors: [],
        };

        // Send emails to each contact
        for (const contact of contacts) {
            try {
                // Prepare variables for template
                const variables = {
                    firstName: contact.first_name,
                    lastName: contact.last_name,
                    email: contact.email,
                    company: contact.company,
                    jobTitle: contact.job_title,
                    ...contact.custom_fields,
                };

                // Replace variables in subject and body
                const personalizedSubject = replaceVariables(campaign.subject, variables);
                const personalizedBody = replaceVariables(campaign.body, variables);

                // Send email
                await sendEmail(
                    userId,
                    contact.email,
                    personalizedSubject,
                    personalizedBody,
                    campaignId,
                    contact.id
                );

                results.sent++;

                // Add delay between emails
                if (campaign.delay_min && campaign.delay_max) {
                    const delay =
                        Math.random() * (campaign.delay_max - campaign.delay_min) + campaign.delay_min;
                    await new Promise((resolve) => setTimeout(resolve, delay * 60 * 1000));
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    contact: contact.email,
                    error: error.message,
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
        const userResult = await query(
            'SELECT email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        // Get valid OAuth2 client (auto-refreshes token if needed)
        const oauth2Client = await getValidOAuth2Client(userId);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Test by getting user profile
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
 * Send admin authentication code via nodemailer (doesn't require user auth)
 * Uses SMTP for admin emails since we don't have user's OAuth
 */
export const sendAdminCode = async (adminEmail, code) => {
    try {
        // For admin emails, we need to use a system account or the first available user
        // Get the first user with valid tokens to send the email
        const userResult = await query(`
            SELECT id, email FROM users 
            WHERE refresh_token IS NOT NULL 
            ORDER BY created_at ASC 
            LIMIT 1
        `);

        if (userResult.rows.length === 0) {
            throw new Error('No valid sender available. Please ensure at least one user is connected.');
        }

        const senderId = userResult.rows[0].id;
        const senderEmail = userResult.rows[0].email;

        // Get valid OAuth2 client for the sender
        const oauth2Client = await getValidOAuth2Client(senderId);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Create the email
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

        // Create email message
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

        // Send email
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
