import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getFileInfo } from '../middleware/upload.js';

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

        const fileInfo = getFileInfo(req.file);

        res.json({
            success: true,
            data: {
                file: {
                    id: fileInfo.filename,
                    name: fileInfo.originalName,
                    size: fileInfo.size,
                    type: fileInfo.mimetype,
                    path: fileInfo.path
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

        const filesInfo = req.files.map(file => {
            const info = getFileInfo(file);
            return {
                id: info.filename,
                name: info.originalName,
                size: info.size,
                type: info.mimetype,
                path: info.path
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
        const filePath = path.join(__dirname, '../../uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found',
                message: 'The requested file does not exist'
            });
        }

        fs.unlinkSync(filePath);

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
