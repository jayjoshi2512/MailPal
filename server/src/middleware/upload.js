import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * =====================================================
 * MINIMAL UPLOAD MIDDLEWARE
 * =====================================================
 * 
 * This app uses ZERO server storage for email attachments!
 * Attachments are converted to base64 in the browser and sent
 * directly with the email request. Nothing is written to disk.
 * 
 * This middleware is kept minimal for:
 * - Potential future features (CSV imports via file, etc.)
 * - Backward compatibility with existing code
 * 
 * For free-tier deployment: Perfect! No storage costs.
 */

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// =====================================================
// MULTER - MEMORY STORAGE (no disk writes)
// =====================================================

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: memoryStorage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024, files: 10 }
});

// =====================================================
// MIDDLEWARE EXPORTS
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

export const getFileInfo = (file) => ({
    originalName: file.originalname,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    // For memory storage, file.buffer contains the data
    buffer: file.buffer
});

// =====================================================
// LEGACY NO-OP EXPORTS (for backward compatibility)
// =====================================================

export const deleteFile = () => {};
export const deleteFiles = () => {};
export const cleanupTempFiles = () => {};
export const cleanupAfterSend = () => {};
export const cleanupOldTempFiles = () => {};
export const clearUserUploads = () => ({ deleted: 0 });
export const getTempUploadDir = () => ({ tempDir: null, timestamp: null });
export const getTempDir = () => null;
export const recordSentEmail = () => {};
export const recordCampaignEmail = () => {};
export const recordBulkSentEmail = () => {};
export const emailToFolder = (email) => email?.replace(/@/g, '_at_').replace(/\./g, '_') || 'unknown';
export const getTimestampFolder = () => new Date().toISOString().replace(/[:.]/g, '-');
export const moveTempFilesToSentFolder = () => ({});
export const getSenderEmailHistory = () => [];
export const getSenderRecipients = () => [];
export const getSentEmails = () => [];
export const getCampaignRecipientEmails = () => [];
export const getCampaignAllRecipients = () => [];
export const getUserUploads = () => [];
export const createUploadSession = () => ({});
export const getUserSessions = () => [];
export const getSessionDetails = () => null;
export const recordEmailSent = () => true;
export const createRecipientDirectory = () => ({});
export const createCampaignDirectory = () => ({});
export const getCampaignDir = () => null;
export const getCampaignAttachmentsDir = () => null;
export const getCampaignRecipientDir = () => null;
export const createCampaignEmailDir = () => ({});
export const createEmailSendDir = () => ({});
export const getSenderDir = () => null;
export const getSenderToRecipientDir = () => null;

export default upload;
