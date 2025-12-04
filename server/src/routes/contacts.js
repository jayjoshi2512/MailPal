import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAllContacts,
  createContact,
  uploadContactsCSV,
  deleteContact,
  updateContact,
  toggleFavorite,
  bulkFavorite,
  bulkDelete
} from '../controllers/contactsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/contacts - Get all contacts
router.get('/', getAllContacts);

// POST /api/contacts - Create a single contact
router.post('/', createContact);

// POST /api/contacts/upload-csv - Upload contacts from CSV
router.post('/upload-csv', uploadContactsCSV);

// POST /api/contacts/bulk-favorite - Bulk toggle favorite
router.post('/bulk-favorite', bulkFavorite);

// POST /api/contacts/bulk-delete - Bulk delete contacts
router.post('/bulk-delete', bulkDelete);

// PUT /api/contacts/:id - Update a contact
router.put('/:id', updateContact);

// PATCH /api/contacts/:id/favorite - Toggle favorite
router.patch('/:id/favorite', toggleFavorite);

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', deleteContact);

export default router;
