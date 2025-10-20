import { google } from 'googleapis';
import { query } from '../config/database.js';
import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * Email Service - Handles sending emails via Gmail API
 */

/**
 * Create OAuth2 client with user's tokens
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
 * Create email message in RFC 2822 format with attachments support
 */
const createMessage = async (to, subject, body, from = 'me', attachments = []) => {
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
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

        // Add text body part
        const parts = [
            `--${boundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 7bit',
            '',
            body,
        ];

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
        // Simple text message without attachments
        const message = [
            ...headers,
            'Content-Type: text/plain; charset="UTF-8"',
            '',
            body,
        ].join('\n');

        // Encode message in base64url format
        const encodedMessage = Buffer.from(message)
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
 * Send a single email
 */
export const sendEmail = async (userId, to, subject, body, campaignId = null, contactId = null, attachments = []) => {
    try {
        // Get user's tokens from database
        const userResult = await query(
            'SELECT refresh_token, access_token, email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const { refresh_token, access_token, email: userEmail } = userResult.rows[0];

        // Create OAuth2 client
        const oauth2Client = createOAuth2Client(refresh_token, access_token);
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
        if (campaignId && contactId) {
            await query(
                `INSERT INTO sent_emails 
         (campaign_id, contact_id, user_id, gmail_message_id, subject, body, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [campaignId, contactId, userId, response.data.id, subject, body]
            );

            // Update contact status
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
        if (campaignId && contactId) {
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
 * Test email connection
 */
export const testEmailConnection = async (userId) => {
    try {
        const userResult = await query(
            'SELECT refresh_token, access_token, email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const { refresh_token, access_token } = userResult.rows[0];

        const oauth2Client = createOAuth2Client(refresh_token, access_token);
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

export default {
    sendEmail,
    sendCampaignEmails,
    testEmailConnection,
};
