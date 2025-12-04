import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp uploads directory only
const uploadsDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * =====================================================
 * TEMPORARY ATTACHMENT UPLOAD SYSTEM
 * =====================================================
 * 
 * Strategy: Temp storage + immediate cleanup after email send
 * This is efficient for serverless/low-storage hosting (Render, etc.)
 * 
 * Flow:
 * 1. User uploads attachments → stored in temp/{user}/
 * 2. User sends email → attachments encoded as base64 in email
 * 3. After successful send → temp files deleted immediately
 * 4. Periodic cleanup removes orphaned files (failed sends, etc.)
 * 
 * Structure:
 * uploads/
 * └── temp/
 *     └── {user_id}/
 *         ├── file1.pdf
 *         ├── file2.xlsx
 *         └── ...
 * 
 * Benefits:
 * - No permanent storage needed
 * - Works with Render's 256MB free tier
 * - Files cleaned up immediately after use
 * - Email attachments are stored in Gmail, not our server
 */

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

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
 * Get user's temp upload directory
 */
export const getUserTempDir = (userId) => {
    return ensureDir(path.join(uploadsDir, String(userId)));
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const createStorage = () => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const userId = req.user?.id || 'anonymous';
                const userDir = getUserTempDir(userId);
                cb(null, userDir);
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
            const random = Math.random().toString(36).substring(7);
            cb(null, `${timestamp}_${random}_${basename}${ext}`);
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

// =====================================================
// FILE OPERATIONS
// =====================================================

/**
 * Get file info for response
 */
export const getFileInfo = (file) => {
    return {
        id: path.basename(file.filename, path.extname(file.filename)),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        uploadedAt: new Date().toISOString()
    };
};

/**
 * Delete a single file
 */
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
    } catch (error) {
        console.error('Error deleting file:', filePath, error.message);
    }
    return false;
};

/**
 * Delete multiple files
 */
export const deleteFiles = (filePaths) => {
    let deleted = 0;
    for (const filePath of filePaths) {
        if (deleteFile(filePath)) deleted++;
    }
    return deleted;
};

/**
 * Clean up temp files after email is sent
 * This is the key function - called after successful email send
 */
export const cleanupTempFiles = (filePaths) => {
    const results = { deleted: 0, failed: 0 };
    for (const filePath of filePaths) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                results.deleted++;
            }
        } catch (e) {
            console.error('Failed to cleanup temp file:', filePath, e.message);
            results.failed++;
        }
    }
    return results;
};

/**
 * Get user's current temp uploads
 */
export const getUserUploads = (userId) => {
    const userDir = path.join(uploadsDir, String(userId));
    if (!fs.existsSync(userDir)) return [];
    
    const uploads = [];
    try {
        const files = fs.readdirSync(userDir);
        for (const file of files) {
            const filePath = path.join(userDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                uploads.push({
                    id: path.basename(file, path.extname(file)),
                    filename: file,
                    path: filePath,
                    size: stat.size,
                    sizeFormatted: formatFileSize(stat.size),
                    uploadedAt: stat.birthtime
                });
            }
        }
    } catch (error) {
        console.error('Error reading user uploads:', error.message);
    }
    
    return uploads.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

/**
 * Clear all temp files for a user
 */
export const clearUserUploads = (userId) => {
    const userDir = path.join(uploadsDir, String(userId));
    if (!fs.existsSync(userDir)) return { deleted: 0 };
    
    let deleted = 0;
    try {
        const files = fs.readdirSync(userDir);
        for (const file of files) {
            const filePath = path.join(userDir, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                deleted++;
            }
        }
    } catch (error) {
        console.error('Error clearing user uploads:', error.message);
    }
    
    return { deleted };
};

/**
 * Cleanup old temp files (for scheduled cleanup)
 * Deletes files older than maxAge (default: 1 hour)
 */
export const cleanupOldTempFiles = (maxAgeMs = 60 * 60 * 1000) => {
    const results = { scanned: 0, deleted: 0, errors: 0 };
    const now = Date.now();
    
    try {
        if (!fs.existsSync(uploadsDir)) return results;
        
        const userDirs = fs.readdirSync(uploadsDir);
        for (const userDir of userDirs) {
            const userPath = path.join(uploadsDir, userDir);
            if (!fs.statSync(userPath).isDirectory()) continue;
            
            const files = fs.readdirSync(userPath);
            for (const file of files) {
                const filePath = path.join(userPath, file);
                try {
                    const stat = fs.statSync(filePath);
                    if (!stat.isFile()) continue;
                    
                    results.scanned++;
                    const age = now - stat.mtimeMs;
                    
                    if (age > maxAgeMs) {
                        fs.unlinkSync(filePath);
                        results.deleted++;
                    }
                } catch (e) {
                    results.errors++;
                }
            }
            
            // Remove empty user directories
            try {
                const remaining = fs.readdirSync(userPath);
                if (remaining.length === 0) {
                    fs.rmdirSync(userPath);
                }
            } catch (e) {
                // Ignore
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error.message);
    }
    
    return results;
};

// =====================================================
// LEGACY EXPORTS (for backward compatibility)
// =====================================================

// These are kept for any existing code that might reference them
export const recordSentEmail = () => ({ success: true });
export const recordCampaignEmail = () => ({ success: true });
export const emailToFolder = (email) => email?.replace(/@/g, '_at_').replace(/\./g, '_') || 'unknown';
export const getTimestampFolder = () => new Date().toISOString().replace(/[:.]/g, '-');
export const getTempUploadDir = (email) => ({ tempDir: getUserTempDir(email), timestamp: getTimestampFolder() });

export default upload;
