import express from 'express';
import { body } from 'express-validator';
import {
  getContacts,
  addContact,
  bulkAddContacts,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// Validation rules
const addContactValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('company').optional().trim(),
  body('job_title').optional().trim(),
  body('custom_fields').optional().isObject(),
];

const bulkAddValidation = [
  body('contacts').isArray({ min: 1 }).withMessage('Contacts array is required'),
  body('contacts.*.email').isEmail().withMessage('Valid email is required'),
];

// Routes
router.get('/', getContacts);
router.post('/', addContactValidation, validate, addContact);
router.post('/bulk', bulkAddValidation, validate, bulkAddContacts);
router.patch('/:contactId', updateContact);
router.delete('/:contactId', deleteContact);

export default router;
