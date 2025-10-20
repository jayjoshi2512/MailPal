import express from 'express';
import { uploadFile, uploadFiles, deleteUploadedFile } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/upload/single
 * @desc    Upload single file
 * @access  Private
 */
router.post('/single', authenticate, uploadSingle, handleUploadError, uploadFile);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple', authenticate, uploadMultiple, handleUploadError, uploadFiles);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', authenticate, deleteUploadedFile);

export default router;
