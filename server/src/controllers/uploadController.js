import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
    getFileInfo, 
    getUserUploads, 
    deleteFile,
    clearUserUploads
} from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload Controller
 * 
 * Handles temporary file uploads for email attachments.
 * Files are stored temporarily and cleaned up after email is sent.
 */

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

        const fileInfo = getFileInfo(req.file);

        res.json({
            success: true,
            data: {
                file: {
                    id: fileInfo.id,
                    name: fileInfo.originalName,
                    filename: fileInfo.filename,
                    size: fileInfo.size,
                    sizeFormatted: fileInfo.sizeFormatted,
                    type: fileInfo.mimetype,
                    path: fileInfo.path,
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

        const filesInfo = req.files.map(file => {
            const info = getFileInfo(file);
            return {
                id: info.id,
                name: info.originalName,
                filename: info.filename,
                size: info.size,
                sizeFormatted: info.sizeFormatted,
                type: info.mimetype,
                path: info.path,
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

/**
 * Delete uploaded file
 */
export const deleteUploadedFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Search in user's temp folder
        const userUploads = getUserUploads(userId);
        const foundFile = userUploads.find(f => f.filename === filename || f.id === filename);
        
        if (!foundFile) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        const deleted = deleteFile(foundFile.path);

        res.json({
            success: deleted,
            message: deleted ? 'File deleted successfully' : 'Failed to delete file'
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
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const uploads = getUserUploads(userId);

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
 * Clear all temp uploads for current user
 */
export const clearMyUploads = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = clearUserUploads(userId);

        res.json({
            success: true,
            data: result,
            message: `${result.deleted} file(s) cleared`
        });
    } catch (error) {
        console.error('Error clearing uploads:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear uploads',
            message: error.message
        });
    }
};
