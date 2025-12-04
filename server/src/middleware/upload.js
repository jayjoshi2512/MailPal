import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const baseUploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(baseUploadsDir)) {
    fs.mkdirSync(baseUploadsDir, { recursive: true });
}

/**
 * =====================================================
 * HUMAN-READABLE EMAIL TRACKING UPLOAD SYSTEM
 * =====================================================
 * 
 * Structure (using actual email addresses for easy browsing):
 * 
 * uploads/
 * ├── senders/
 * │   └── {sender_email}/                         # e.g., "john_at_gmail_com"
 * │       └── sent_to/
 * │           └── {recipient_email}/              # e.g., "jane_at_company_com"
 * │               └── {YYYY-MM-DD_HH-MM-SS}/      # Timestamp folder
 * │                   ├── email_info.json         # Subject, body, sent time
 * │                   └── attachments/            # Actual files sent
 * │                       ├── report.pdf
 * │                       └── data.xlsx
 * │
 * ├── campaigns/
 * │   └── {campaign_name}_{id}/                   # e.g., "Summer_Sale_2024_123"
 * │       ├── campaign_info.json
 * │       ├── shared_attachments/                 # Files sent to all recipients
 * │       └── recipients/
 * │           └── {recipient_email}/
 * │               └── {YYYY-MM-DD_HH-MM-SS}/
 * │                   ├── email_info.json
 * │                   └── attachments/
 * │
 * └── temp/                                       # Temporary uploads before sending
 *     └── {sender_email}/
 *         └── {timestamp}/
 *             └── attachments/
 * 
 * EXAMPLES:
 * - uploads/senders/jay_at_gmail_com/sent_to/client_at_company_com/2024-12-04_14-30-25/
 * - uploads/campaigns/Newsletter_Jan_45/recipients/user_at_domain_com/2024-12-04_10-00-00/
 */

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Convert email to folder-safe name (human readable)
 * john@gmail.com -> john_at_gmail_com
 */
export const emailToFolder = (email) => {
    if (!email) return 'unknown';
    return email.toLowerCase()
        .replace(/@/g, '_at_')
        .replace(/\./g, '_')
        .replace(/[^a-z0-9_-]/g, '')
        .substring(0, 100);
};

/**
 * Get timestamp string for folder: YYYY-MM-DD_HH-MM-SS
 */
export const getTimestampFolder = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `${date}_${time}`;
};

/**
 * Get date string: YYYY-MM-DD
 */
const getDateString = () => new Date().toISOString().split('T')[0];

/**
 * Format file size for display
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Ensure directory exists
 */
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
};

/**
 * Write JSON file
 */
const writeJson = (filePath, data) => {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * Read JSON file
 */
const readJson = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        return null;
    }
};

// =====================================================
// DIRECTORY PATH BUILDERS
// =====================================================

/**
 * Get sender's base directory
 * uploads/senders/{sender_email}/
 */
export const getSenderDir = (senderEmail) => {
    return ensureDir(path.join(baseUploadsDir, 'senders', emailToFolder(senderEmail)));
};

/**
 * Get directory for emails sent from sender to specific recipient
 * uploads/senders/{sender_email}/sent_to/{recipient_email}/
 */
export const getSenderToRecipientDir = (senderEmail, recipientEmail) => {
    return ensureDir(path.join(
        getSenderDir(senderEmail),
        'sent_to',
        emailToFolder(recipientEmail)
    ));
};

/**
 * Create timestamped folder for a specific email send
 * uploads/senders/{sender_email}/sent_to/{recipient_email}/{timestamp}/
 */
export const createEmailSendDir = (senderEmail, recipientEmail, timestamp = null) => {
    const ts = timestamp || getTimestampFolder();
    const emailDir = ensureDir(path.join(
        getSenderToRecipientDir(senderEmail, recipientEmail),
        ts
    ));
    const attachmentsDir = ensureDir(path.join(emailDir, 'attachments'));
    return { emailDir, attachmentsDir, timestamp: ts };
};

/**
 * Get temp upload directory for sender
 * uploads/temp/{sender_email}/{timestamp}/attachments/
 */
export const getTempUploadDir = (senderEmail, timestamp = null) => {
    const ts = timestamp || getTimestampFolder();
    const tempDir = ensureDir(path.join(
        baseUploadsDir, 
        'temp', 
        emailToFolder(senderEmail),
        ts,
        'attachments'
    ));
    return { tempDir, timestamp: ts };
};

// =====================================================
// CAMPAIGN DIRECTORY BUILDERS
// =====================================================

/**
 * Get campaign directory with human-readable name
 * uploads/campaigns/{campaign_name}_{id}/
 */
export const getCampaignDir = (campaignId, campaignName = null) => {
    const safeName = campaignName 
        ? `${campaignName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}_${campaignId}`
        : `campaign_${campaignId}`;
    return ensureDir(path.join(baseUploadsDir, 'campaigns', safeName));
};

/**
 * Get campaign shared attachments directory
 */
export const getCampaignAttachmentsDir = (campaignId, campaignName = null) => {
    return ensureDir(path.join(getCampaignDir(campaignId, campaignName), 'shared_attachments'));
};

/**
 * Get campaign recipient directory
 * uploads/campaigns/{campaign}/recipients/{recipient_email}/
 */
export const getCampaignRecipientDir = (campaignId, recipientEmail, campaignName = null) => {
    return ensureDir(path.join(
        getCampaignDir(campaignId, campaignName),
        'recipients',
        emailToFolder(recipientEmail)
    ));
};

/**
 * Create timestamped email folder for campaign recipient
 */
export const createCampaignEmailDir = (campaignId, recipientEmail, campaignName = null, timestamp = null) => {
    const ts = timestamp || getTimestampFolder();
    const emailDir = ensureDir(path.join(
        getCampaignRecipientDir(campaignId, recipientEmail, campaignName),
        ts
    ));
    const attachmentsDir = ensureDir(path.join(emailDir, 'attachments'));
    return { emailDir, attachmentsDir, timestamp: ts };
};

// =====================================================
// EMAIL RECORD MANAGEMENT
// =====================================================

/**
 * Save email info when email is sent from sender to recipient
 * Creates: uploads/senders/{sender}/sent_to/{recipient}/{timestamp}/email_info.json
 */
export const recordSentEmail = (senderEmail, recipientEmail, emailData, attachmentPaths = []) => {
    const { emailDir, attachmentsDir, timestamp } = createEmailSendDir(senderEmail, recipientEmail);
    
    const emailInfo = {
        sender: senderEmail,
        recipient: recipientEmail,
        subject: emailData.subject || 'No Subject',
        body: emailData.body || '',
        sentAt: new Date().toISOString(),
        timestamp,
        messageId: emailData.messageId || null,
        attachments: attachmentPaths.map(p => {
            const stat = fs.existsSync(p) ? fs.statSync(p) : { size: 0 };
            return {
                filename: path.basename(p),
                path: p,
                size: stat.size,
                sizeFormatted: formatFileSize(stat.size)
            };
        }),
        status: 'sent'
    };
    
    writeJson(path.join(emailDir, 'email_info.json'), emailInfo);
    
    // Copy attachments to this email's folder
    for (const srcPath of attachmentPaths) {
        if (fs.existsSync(srcPath)) {
            const destPath = path.join(attachmentsDir, path.basename(srcPath));
            fs.copyFileSync(srcPath, destPath);
        }
    }
    
    return { emailDir, emailInfo, timestamp };
};

/**
 * Record email sent to multiple recipients at once
 */
export const recordBulkSentEmail = (senderEmail, recipientEmails, emailData, attachmentPaths = []) => {
    const results = [];
    const timestamp = getTimestampFolder(); // Same timestamp for all
    
    for (const recipientEmail of recipientEmails) {
        const result = recordSentEmail(senderEmail, recipientEmail, emailData, attachmentPaths);
        results.push(result);
    }
    
    return results;
};

/**
 * Get all emails sent by a sender to a specific recipient
 */
export const getSentEmails = (senderEmail, recipientEmail) => {
    const recipientDir = path.join(
        baseUploadsDir, 
        'senders', 
        emailToFolder(senderEmail),
        'sent_to',
        emailToFolder(recipientEmail)
    );
    
    if (!fs.existsSync(recipientDir)) return [];
    
    const emails = [];
    const timestampFolders = fs.readdirSync(recipientDir).sort().reverse();
    
    for (const ts of timestampFolders) {
        const infoPath = path.join(recipientDir, ts, 'email_info.json');
        const info = readJson(infoPath);
        if (info) {
            // Get actual attachment files
            const attachDir = path.join(recipientDir, ts, 'attachments');
            if (fs.existsSync(attachDir)) {
                info.attachmentFiles = fs.readdirSync(attachDir);
            }
            emails.push(info);
        }
    }
    
    return emails;
};

/**
 * Get all recipients a sender has emailed
 */
export const getSenderRecipients = (senderEmail) => {
    const sentToDir = path.join(
        baseUploadsDir,
        'senders',
        emailToFolder(senderEmail),
        'sent_to'
    );
    
    if (!fs.existsSync(sentToDir)) return [];
    
    const recipients = [];
    const recipientFolders = fs.readdirSync(sentToDir);
    
    for (const folder of recipientFolders) {
        const recipientPath = path.join(sentToDir, folder);
        const timestampFolders = fs.readdirSync(recipientPath).sort().reverse();
        
        if (timestampFolders.length > 0) {
            const latestInfo = readJson(path.join(recipientPath, timestampFolders[0], 'email_info.json'));
            recipients.push({
                folderName: folder,
                email: latestInfo?.recipient || folder.replace(/_at_/g, '@').replace(/_/g, '.'),
                emailCount: timestampFolders.length,
                lastSentAt: latestInfo?.sentAt || null,
                latestSubject: latestInfo?.subject || null
            });
        }
    }
    
    return recipients.sort((a, b) => new Date(b.lastSentAt) - new Date(a.lastSentAt));
};

/**
 * Get complete email history for a sender
 */
export const getSenderEmailHistory = (senderEmail, limit = 100) => {
    const sentToDir = path.join(
        baseUploadsDir,
        'senders',
        emailToFolder(senderEmail),
        'sent_to'
    );
    
    if (!fs.existsSync(sentToDir)) return [];
    
    const allEmails = [];
    const recipientFolders = fs.readdirSync(sentToDir);
    
    for (const folder of recipientFolders) {
        const recipientPath = path.join(sentToDir, folder);
        const timestampFolders = fs.readdirSync(recipientPath);
        
        for (const ts of timestampFolders) {
            const info = readJson(path.join(recipientPath, ts, 'email_info.json'));
            if (info) allEmails.push(info);
        }
    }
    
    return allEmails
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
        .slice(0, limit);
};

// =====================================================
// CAMPAIGN EMAIL RECORDING
// =====================================================

/**
 * Record campaign email sent to recipient
 */
export const recordCampaignEmail = (campaignId, senderEmail, recipientEmail, emailData, attachmentPaths = [], campaignName = null) => {
    const { emailDir, attachmentsDir, timestamp } = createCampaignEmailDir(campaignId, recipientEmail, campaignName);
    
    const emailInfo = {
        campaignId,
        campaignName: campaignName || `Campaign ${campaignId}`,
        sender: senderEmail,
        recipient: recipientEmail,
        subject: emailData.subject || 'No Subject',
        body: emailData.body || '',
        sentAt: new Date().toISOString(),
        timestamp,
        messageId: emailData.messageId || null,
        attachments: attachmentPaths.map(p => ({
            filename: path.basename(p),
            path: p
        })),
        status: 'sent'
    };
    
    writeJson(path.join(emailDir, 'email_info.json'), emailInfo);
    
    // Copy attachments
    for (const srcPath of attachmentPaths) {
        if (fs.existsSync(srcPath)) {
            const destPath = path.join(attachmentsDir, path.basename(srcPath));
            fs.copyFileSync(srcPath, destPath);
        }
    }
    
    // Also record in sender's folder for their personal history
    recordSentEmail(senderEmail, recipientEmail, emailData, attachmentPaths);
    
    return { emailDir, emailInfo, timestamp };
};

/**
 * Get all emails sent in a campaign to a specific recipient
 */
export const getCampaignRecipientEmails = (campaignId, recipientEmail, campaignName = null) => {
    const recipientDir = getCampaignRecipientDir(campaignId, recipientEmail, campaignName);
    if (!fs.existsSync(recipientDir)) return [];
    
    const emails = [];
    const timestampFolders = fs.readdirSync(recipientDir).filter(f => {
        return fs.statSync(path.join(recipientDir, f)).isDirectory();
    }).sort().reverse();
    
    for (const ts of timestampFolders) {
        const info = readJson(path.join(recipientDir, ts, 'email_info.json'));
        if (info) {
            const attachDir = path.join(recipientDir, ts, 'attachments');
            if (fs.existsSync(attachDir)) {
                info.attachmentFiles = fs.readdirSync(attachDir);
            }
            emails.push(info);
        }
    }
    
    return emails;
};

/**
 * Get all recipients in a campaign with their email history
 */
export const getCampaignAllRecipients = (campaignId, campaignName = null) => {
    const campaignDir = getCampaignDir(campaignId, campaignName);
    const recipientsDir = path.join(campaignDir, 'recipients');
    
    if (!fs.existsSync(recipientsDir)) return [];
    
    const recipients = [];
    const recipientFolders = fs.readdirSync(recipientsDir);
    
    for (const folder of recipientFolders) {
        const recipientPath = path.join(recipientsDir, folder);
        const timestampFolders = fs.readdirSync(recipientPath).filter(f => {
            return fs.statSync(path.join(recipientPath, f)).isDirectory();
        }).sort().reverse();
        
        const emails = [];
        for (const ts of timestampFolders) {
            const info = readJson(path.join(recipientPath, ts, 'email_info.json'));
            if (info) emails.push(info);
        }
        
        if (emails.length > 0) {
            recipients.push({
                folderName: folder,
                email: emails[0].recipient,
                emailCount: emails.length,
                lastSentAt: emails[0].sentAt,
                emails
            });
        }
    }
    
    return recipients;
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const createStorage = () => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const senderEmail = req.user?.email || 'anonymous';
                const { tempDir } = getTempUploadDir(senderEmail);
                cb(null, tempDir);
            } catch (error) {
                cb(error);
            }
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9-_]/g, '_')
                .substring(0, 50);
            const timestamp = Date.now();
            cb(null, `${timestamp}_${basename}${ext}`);
        }
    });
};

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-zip-compressed'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: createStorage(),
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024, files: 10 }
});

// =====================================================
// EXPORTS
// =====================================================

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const errors = {
            'LIMIT_FILE_SIZE': 'File size cannot exceed 25MB',
            'LIMIT_FILE_COUNT': 'Cannot upload more than 10 files',
            'LIMIT_UNEXPECTED_FILE': 'Unexpected file field'
        };
        return res.status(400).json({ success: false, error: errors[err.code] || err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next();
};

export const getFileInfo = (file, senderEmail = null) => {
    return {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        senderEmail,
        uploadedAt: new Date().toISOString()
    };
};

/**
 * Move temp files to proper location after email is sent
 */
export const moveTempFilesToSentFolder = (senderEmail, recipientEmail, tempFilePaths) => {
    const { attachmentsDir, timestamp } = createEmailSendDir(senderEmail, recipientEmail);
    const movedPaths = [];
    
    for (const srcPath of tempFilePaths) {
        if (fs.existsSync(srcPath)) {
            const destPath = path.join(attachmentsDir, path.basename(srcPath));
            fs.copyFileSync(srcPath, destPath);
            movedPaths.push(destPath);
        }
    }
    
    return { attachmentsDir, movedPaths, timestamp };
};

/**
 * Clean up temp files after sending
 */
export const cleanupTempFiles = (filePaths) => {
    for (const filePath of filePaths) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.error('Failed to cleanup temp file:', e);
        }
    }
};

/**
 * Get user's uploads from temp folder
 */
export const getUserUploads = (senderEmail) => {
    const tempBase = path.join(baseUploadsDir, 'temp', emailToFolder(senderEmail));
    if (!fs.existsSync(tempBase)) return [];
    
    const uploads = [];
    const timestampFolders = fs.readdirSync(tempBase).sort().reverse();
    
    for (const ts of timestampFolders) {
        const attachDir = path.join(tempBase, ts, 'attachments');
        if (fs.existsSync(attachDir)) {
            const files = fs.readdirSync(attachDir);
            for (const file of files) {
                const filePath = path.join(attachDir, file);
                const stat = fs.statSync(filePath);
                uploads.push({
                    filename: file,
                    path: filePath,
                    size: stat.size,
                    sizeFormatted: formatFileSize(stat.size),
                    uploadedAt: stat.birthtime,
                    timestamp: ts
                });
            }
        }
    }
    
    return uploads;
};

export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

export const deleteFiles = (filePaths) => filePaths.forEach(deleteFile);

// Legacy compatibility exports
export const createUploadSession = () => ({ sessionId: `session_${Date.now()}` });
export const getUserSessions = () => [];
export const getSessionDetails = () => null;
export const recordEmailSent = () => true;
export const createRecipientDirectory = () => ({});
export const createCampaignDirectory = (campaignId) => ({ campaignDir: getCampaignDir(campaignId) });

export default upload;
