import express from 'express';
import { 
    uploadFile, 
    uploadFiles, 
    deleteUploadedFile, 
    getMyUploads,
    clearMyUploads
} from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * =====================================================
 * TEMPORARY UPLOAD ROUTES
 * =====================================================
 * 
 * Files are stored temporarily and cleaned up after email send.
 * 
 * Flow:
 * 1. Upload files → stored in temp/{userId}/
 * 2. Send email with attachments
 * 3. Files automatically deleted after successful send
 * 4. Background cleanup removes orphaned files (older than 1 hour)
 * 
 * Structure:
 * uploads/
 * └── temp/
 *     └── {user_id}/
 *         ├── file1.pdf
 *         └── file2.xlsx
 */

/**
 * @route   POST /api/upload/single
 * @desc    Upload single file (to temp folder)
 * @files   file
 * @access  Private
 */
router.post('/single', authenticate, uploadSingle, handleUploadError, uploadFile);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files (to temp folder)
 * @files   files[]
 * @access  Private
 */
router.post('/multiple', authenticate, uploadMultiple, handleUploadError, uploadFiles);

/**
 * @route   GET /api/upload/my-uploads
 * @desc    Get all current temp uploads for user
 * @access  Private
 */
router.get('/my-uploads', authenticate, getMyUploads);

/**
 * @route   DELETE /api/upload/clear
 * @desc    Clear all temp uploads for user
 * @access  Private
 */
router.delete('/clear', authenticate, clearMyUploads);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete specific uploaded file
 * @access  Private
 */
router.delete('/:filename', authenticate, deleteUploadedFile);

export default router;
