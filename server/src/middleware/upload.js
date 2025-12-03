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
 * Sanitize email for use as folder name
 * Replaces @ and . with safe characters
 */
const sanitizeEmail = (email) => {
    if (!email) return 'anonymous';
    return email.toLowerCase().replace(/@/g, '_at_').replace(/\./g, '_');
};

/**
 * Get current date formatted as YYYY-MM-DD
 */
const getDateFolder = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get formatted timestamp for filename
 */
const getTimestamp = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}${minutes}${seconds}_${ms}`;
};

/**
 * Create user-specific upload directory
 * Structure: uploads/user-email/YYYY-MM-DD/
 */
const ensureUserDirectory = (userEmail) => {
    const sanitizedEmail = sanitizeEmail(userEmail);
    const dateFolder = getDateFolder();
    const userDir = path.join(baseUploadsDir, sanitizedEmail, dateFolder);
    
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
        console.log(`📁 Created upload directory: ${userDir}`);
    }
    
    return userDir;
};

// Configure storage with dynamic user-based paths
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get user email from authenticated request
        const userEmail = req.user?.email || 'anonymous';
        const uploadDir = ensureUserDirectory(userEmail);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: originalname_timestamp.ext
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, '_') // Sanitize filename
            .substring(0, 50); // Limit length
        const timestamp = getTimestamp();
        const uniqueId = Math.random().toString(36).substring(2, 8);
        cb(null, `${basename}_${timestamp}_${uniqueId}${ext}`);
    }
});

// File filter - validate file types
const fileFilter = (req, file, cb) => {
    // Allowed mime types
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: images, PDF, Office documents, text files, and ZIP.`), false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB max file size (Gmail limit)
        files: 10 // Max 10 files per upload
    }
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple files upload
export const uploadMultiple = upload.array('files', 10);

// Middleware to handle multer errors
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large',
                message: 'File size cannot exceed 25MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files',
                message: 'Cannot upload more than 10 files at once'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected field',
                message: 'Unexpected file field in request'
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Upload error',
            message: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            error: 'Upload failed',
            message: err.message
        });
    }
    
    next();
};

// Helper function to delete file
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🗑️ File deleted:', filePath);
            
            // Try to clean up empty parent directories
            cleanupEmptyDirectories(path.dirname(filePath));
        }
    } catch (error) {
        console.error('❌ Error deleting file:', error);
    }
};

/**
 * Clean up empty parent directories up to base uploads folder
 */
const cleanupEmptyDirectories = (dirPath) => {
    try {
        // Don't delete base uploads directory
        if (dirPath === baseUploadsDir || !dirPath.startsWith(baseUploadsDir)) {
            return;
        }
        
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
            fs.rmdirSync(dirPath);
            console.log('📁 Removed empty directory:', dirPath);
            // Recursively check parent
            cleanupEmptyDirectories(path.dirname(dirPath));
        }
    } catch (error) {
        // Ignore errors - directory might not be empty or accessible
    }
};

// Helper function to delete multiple files
export const deleteFiles = (filePaths) => {
    filePaths.forEach(filePath => deleteFile(filePath));
};

// Helper function to get file info with full details
export const getFileInfo = (file, userEmail = null) => {
    // Extract relative path from full path
    const relativePath = file.path.replace(baseUploadsDir, '').replace(/^[\/\\]/, '');
    
    return {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        relativePath: relativePath,
        mimetype: file.mimetype,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        userEmail: userEmail,
        uploadedAt: new Date().toISOString()
    };
};

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get all uploads for a specific user
 */
export const getUserUploads = (userEmail) => {
    const sanitizedEmail = sanitizeEmail(userEmail);
    const userDir = path.join(baseUploadsDir, sanitizedEmail);
    const uploads = [];
    
    if (!fs.existsSync(userDir)) {
        return uploads;
    }
    
    // Recursively get all files
    const getFilesRecursively = (dir, basePath = '') => {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(basePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                getFilesRecursively(fullPath, relativePath);
            } else {
                uploads.push({
                    filename: item,
                    path: fullPath,
                    relativePath: relativePath,
                    size: stat.size,
                    sizeFormatted: formatFileSize(stat.size),
                    uploadedAt: stat.birthtime,
                    modifiedAt: stat.mtime
                });
            }
        }
    };
    
    getFilesRecursively(userDir);
    return uploads;
};

export default upload;
