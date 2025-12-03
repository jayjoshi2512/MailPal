import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getFileInfo, getUserUploads, deleteFile } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload single file
 */
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                message: 'Please select a file to upload'
            });
        }

        const userEmail = req.user?.email;
        const fileInfo = getFileInfo(req.file, userEmail);

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
                    relativePath: fileInfo.relativePath,
                    uploadedBy: userEmail,
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
 * Upload multiple files
 */
export const uploadFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded',
                message: 'Please select files to upload'
            });
        }

        const userEmail = req.user?.email;
        const filesInfo = req.files.map(file => {
            const info = getFileInfo(file, userEmail);
            return {
                id: info.filename,
                name: info.originalName,
                size: info.size,
                sizeFormatted: info.sizeFormatted,
                type: info.mimetype,
                path: info.path,
                relativePath: info.relativePath,
                uploadedBy: userEmail,
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
 * Now supports full path from user's folder structure
 */
export const deleteUploadedFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const userEmail = req.user?.email;
        
        // Build possible file paths
        const baseUploadsDir = path.join(__dirname, '../../uploads');
        let filePath = null;
        
        // First try direct path (for legacy files)
        const directPath = path.join(baseUploadsDir, filename);
        if (fs.existsSync(directPath)) {
            filePath = directPath;
        }
        
        // If not found, search in user's directory
        if (!filePath && userEmail) {
            const userUploads = getUserUploads(userEmail);
            const foundFile = userUploads.find(f => f.filename === filename);
            if (foundFile) {
                filePath = foundFile.path;
            }
        }

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
                message: 'The requested file does not exist'
            });
        }

        // Use the deleteFile helper which also cleans up empty directories
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
 * Get all uploads for current user
 */
export const getMyUploads = async (req, res) => {
    try {
        const userEmail = req.user?.email;
        
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const uploads = getUserUploads(userEmail);

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
