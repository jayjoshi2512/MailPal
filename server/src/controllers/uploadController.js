import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
    getFileInfo, 
    getUserUploads, 
    deleteFile,
    // Email tracking with actual emails
    recordSentEmail,
    recordBulkSentEmail,
    getSentEmails,
    getSenderRecipients,
    getSenderEmailHistory,
    // Campaign tracking
    recordCampaignEmail,
    getCampaignRecipientEmails,
    getCampaignAllRecipients,
    getCampaignDir,
    getCampaignAttachmentsDir,
    emailToFolder
} from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadsDir = path.join(__dirname, '../../uploads');

/**
 * Upload single file (to temp folder)
 */
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const senderEmail = req.user?.email || 'anonymous';
        const fileInfo = getFileInfo(req.file, senderEmail);

        res.json({
            success: true,
            data: {
                file: {
                    id: fileInfo.filename,
                    name: fileInfo.originalName,
                    size: fileInfo.size,
                    sizeFormatted: fileInfo.sizeFormatted,
                    type: fileInfo.mimetype,
                    path: fileInfo.path,
                    uploadedBy: senderEmail,
                    uploadedAt: fileInfo.uploadedAt
                }
            },
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
            message: error.message
        });
    }
};

/**
 * Upload multiple files (to temp folder)
 */
export const uploadFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const senderEmail = req.user?.email || 'anonymous';

        const filesInfo = req.files.map(file => {
            const info = getFileInfo(file, senderEmail);
            return {
                id: info.filename,
                name: info.originalName,
                size: info.size,
                sizeFormatted: info.sizeFormatted,
                type: info.mimetype,
                path: info.path,
                uploadedBy: senderEmail,
                uploadedAt: info.uploadedAt
            };
        });

        res.json({
            success: true,
            data: {
                files: filesInfo,
                count: filesInfo.length
            },
            message: `${filesInfo.length} file(s) uploaded successfully`
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
            message: error.message
        });
    }
};

// =====================================================
// EMAIL TRACKING WITH ACTUAL EMAIL ADDRESSES
// =====================================================

/**
 * Record a sent email - Creates folder structure:
 * uploads/senders/{sender}/sent_to/{recipient}/{timestamp}/
 */
export const recordEmail = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { recipientEmail, subject, body, attachmentPaths = [] } = req.body;

        if (!recipientEmail) {
            return res.status(400).json({
                success: false,
                error: 'Recipient email is required'
            });
        }

        const result = recordSentEmail(senderEmail, recipientEmail, { subject, body }, attachmentPaths);

        res.json({
            success: true,
            data: result,
            message: `Email recorded: ${senderEmail} -> ${recipientEmail}`
        });
    } catch (error) {
        console.error('Error recording email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record email',
            message: error.message
        });
    }
};

/**
 * Record bulk email to multiple recipients
 */
export const recordBulkEmail = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { recipientEmails, subject, body, attachmentPaths = [] } = req.body;

        if (!Array.isArray(recipientEmails) || recipientEmails.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Recipient emails array is required'
            });
        }

        const results = recordBulkSentEmail(senderEmail, recipientEmails, { subject, body }, attachmentPaths);

        res.json({
            success: true,
            data: {
                results,
                count: results.length
            },
            message: `Recorded ${results.length} emails from ${senderEmail}`
        });
    } catch (error) {
        console.error('Error recording bulk email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record emails',
            message: error.message
        });
    }
};

/**
 * Get all emails sent to a specific recipient
 */
export const getEmailsToRecipient = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { recipientEmail } = req.params;
        const emails = getSentEmails(senderEmail, decodeURIComponent(recipientEmail));

        res.json({
            success: true,
            data: {
                sender: senderEmail,
                recipient: decodeURIComponent(recipientEmail),
                emails,
                count: emails.length
            }
        });
    } catch (error) {
        console.error('Error getting emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get emails',
            message: error.message
        });
    }
};

/**
 * Get all recipients the sender has emailed
 */
export const getMyRecipients = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const recipients = getSenderRecipients(senderEmail);

        res.json({
            success: true,
            data: {
                sender: senderEmail,
                recipients,
                count: recipients.length
            }
        });
    } catch (error) {
        console.error('Error getting recipients:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recipients',
            message: error.message
        });
    }
};

/**
 * Get sender's complete email history
 */
export const getEmailHistory = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { limit = 100 } = req.query;
        const emails = getSenderEmailHistory(senderEmail, parseInt(limit));

        res.json({
            success: true,
            data: {
                sender: senderEmail,
                emails,
                count: emails.length
            }
        });
    } catch (error) {
        console.error('Error getting email history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get email history',
            message: error.message
        });
    }
};

// =====================================================
// CAMPAIGN EMAIL TRACKING
// =====================================================

/**
 * Record campaign email to recipient - Creates:
 * uploads/campaigns/{campaign}/recipients/{recipient}/{timestamp}/
 */
export const recordCampaignEmailController = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { campaignId, recipientEmail } = req.params;
        const { subject, body, attachmentPaths = [], campaignName } = req.body;

        const result = recordCampaignEmail(
            campaignId,
            senderEmail,
            decodeURIComponent(recipientEmail),
            { subject, body },
            attachmentPaths,
            campaignName
        );

        res.json({
            success: true,
            data: result,
            message: `Campaign email recorded to ${decodeURIComponent(recipientEmail)}`
        });
    } catch (error) {
        console.error('Error recording campaign email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record campaign email',
            message: error.message
        });
    }
};

/**
 * Get emails sent to a recipient in a campaign
 */
export const getCampaignRecipientEmailsController = async (req, res) => {
    try {
        const { campaignId, recipientEmail } = req.params;
        const { campaignName } = req.query;

        const emails = getCampaignRecipientEmails(
            campaignId,
            decodeURIComponent(recipientEmail),
            campaignName
        );

        res.json({
            success: true,
            data: {
                campaignId,
                recipient: decodeURIComponent(recipientEmail),
                emails,
                count: emails.length
            }
        });
    } catch (error) {
        console.error('Error getting campaign recipient emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get emails',
            message: error.message
        });
    }
};

/**
 * Get all recipients in a campaign with email history
 */
export const getCampaignRecipientsController = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { campaignName } = req.query;

        const recipients = getCampaignAllRecipients(campaignId, campaignName);

        res.json({
            success: true,
            data: {
                campaignId,
                recipients,
                count: recipients.length,
                totalEmailsSent: recipients.reduce((sum, r) => sum + r.emailCount, 0)
            }
        });
    } catch (error) {
        console.error('Error getting campaign recipients:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recipients',
            message: error.message
        });
    }
};

// =====================================================
// FILE MANAGEMENT
// =====================================================

/**
 * Delete uploaded file
 */
export const deleteUploadedFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const senderEmail = req.user?.email;
        
        let filePath = null;
        
        // Search in user's temp folder
        if (senderEmail) {
            const userUploads = getUserUploads(senderEmail);
            const foundFile = userUploads.find(f => f.filename === filename);
            if (foundFile) {
                filePath = foundFile.path;
            }
        }

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        deleteFile(filePath);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            error: 'Delete failed',
            message: error.message
        });
    }
};

/**
 * Get all uploads for current user (from temp folder)
 */
export const getMyUploads = async (req, res) => {
    try {
        const senderEmail = req.user?.email;
        
        if (!senderEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const uploads = getUserUploads(senderEmail);

        res.json({
            success: true,
            data: {
                uploads,
                count: uploads.length
            }
        });
    } catch (error) {
        console.error('Error getting uploads:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get uploads',
            message: error.message
        });
    }
};

/**
 * Browse folder structure
 */
export const browseUploads = async (req, res) => {
    try {
        const { folderPath } = req.query;
        const senderEmail = req.user?.email;
        
        let targetPath = baseUploadsDir;
        
        if (folderPath) {
            // Sanitize and validate path
            const safePath = folderPath.replace(/\.\./g, '').replace(/^[\/\\]/, '');
            targetPath = path.join(baseUploadsDir, safePath);
        }
        
        // Security: ensure path is within uploads directory
        if (!targetPath.startsWith(baseUploadsDir)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({
                success: false,
                error: 'Folder not found'
            });
        }

        const stat = fs.statSync(targetPath);
        
        if (stat.isFile()) {
            // Return file info
            return res.json({
                success: true,
                data: {
                    type: 'file',
                    name: path.basename(targetPath),
                    size: stat.size,
                    modified: stat.mtime
                }
            });
        }

        // List directory contents
        const items = fs.readdirSync(targetPath).map(item => {
            const itemPath = path.join(targetPath, item);
            const itemStat = fs.statSync(itemPath);
            return {
                name: item,
                type: itemStat.isDirectory() ? 'folder' : 'file',
                size: itemStat.isDirectory() ? null : itemStat.size,
                modified: itemStat.mtime
            };
        });

        res.json({
            success: true,
            data: {
                type: 'folder',
                path: targetPath.replace(baseUploadsDir, '').replace(/^[\/\\]/, '') || '/',
                items,
                count: items.length
            }
        });
    } catch (error) {
        console.error('Error browsing uploads:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to browse',
            message: error.message
        });
    }
};

// Legacy compatibility exports
export const createSession = async (req, res) => {
    res.json({ success: true, data: { session: { sessionId: `session_${Date.now()}` } } });
};

export const addRecipient = async (req, res) => {
    res.json({ success: true, data: {} });
};

export const getMySessions = async (req, res) => {
    res.json({ success: true, data: { sessions: [], count: 0 } });
};

export const getSession = async (req, res) => {
    res.json({ success: true, data: { session: null } });
};

export const markEmailSent = async (req, res) => {
    res.json({ success: true, message: 'Use recordEmail endpoint instead' });
};

export const createEmailRecord = async (req, res) => {
    return recordEmail(req, res);
};
