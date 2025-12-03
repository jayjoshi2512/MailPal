import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite
} from '../controllers/templateController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/templates - Get all templates (public + user's own)
router.get('/', getTemplates);

// GET /api/templates/:id - Get a single template
router.get('/:id', getTemplateById);

// POST /api/templates - Create a new template
router.post('/', createTemplate);

// PUT /api/templates/:id - Update a template
router.put('/:id', updateTemplate);

// PATCH /api/templates/:id/favorite - Toggle favorite status
router.patch('/:id/favorite', toggleFavorite);

// DELETE /api/templates/:id - Delete a template (soft delete)
router.delete('/:id', deleteTemplate);

export default router;
