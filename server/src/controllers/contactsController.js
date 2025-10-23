import { query } from '../config/database.js';
import Papa from 'papaparse';

/**
 * Get all contacts for the authenticated user
 */
export const getAllContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    let queryText = 'SELECT * FROM contacts WHERE user_id = $1';
    let queryParams = [userId];

    // Add search filter if provided
    if (search) {
      queryText += ' AND (email ILIKE $2 OR name ILIKE $2)';
      queryParams.push(`%${search}%`);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: {
        contacts: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
};

/**
 * Create a single contact
 */
export const createContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, name, company } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if contact already exists
    const existingContact = await query(
      'SELECT * FROM contacts WHERE user_id = $1 AND email = $2',
      [userId, email]
    );

    if (existingContact.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Contact with this email already exists'
      });
    }

    // Create contact
    const result = await query(
      `INSERT INTO contacts (user_id, email, name, company)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, email, name || null, company || null]
    );

    res.json({
      success: true,
      data: { contact: result.rows[0] }
    });
  } catch (error) {
    console.error('❌ Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact'
    });
  }
};

/**
 * Upload contacts from CSV file
 */
export const uploadContactsCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required'
      });
    }

    // Parse CSV
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim()
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse CSV file',
        details: parsed.errors
      });
    }

    const contacts = parsed.data;
    let added = 0;
    let skipped = 0;
    let errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const contact of contacts) {
      const email = contact.email?.trim();
      const name = contact.name?.trim() || null;
      const company = contact.company?.trim() || null;

      // Skip if no email
      if (!email) {
        skipped++;
        continue;
      }

      // Validate email format
      if (!emailRegex.test(email)) {
        skipped++;
        errors.push({ email, reason: 'Invalid email format' });
        continue;
      }

      try {
        // Check if contact exists
        const existingContact = await query(
          'SELECT * FROM contacts WHERE user_id = $1 AND email = $2',
          [userId, email]
        );

        if (existingContact.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insert contact
        await query(
          `INSERT INTO contacts (user_id, email, name, company)
           VALUES ($1, $2, $3, $4)`,
          [userId, email, name, company]
        );

        added++;
      } catch (err) {
        console.error('Error inserting contact:', err);
        skipped++;
        errors.push({ email, reason: err.message });
      }
    }

    res.json({
      success: true,
      data: {
        added,
        skipped,
        total: contacts.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('❌ Error uploading contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload contacts'
    });
  }
};

/**
 * Delete a contact
 */
export const deleteContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Delete contact (ensure it belongs to the user)
    const result = await query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { deleted: true }
    });
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
};

/**
 * Update a contact
 */
export const updateContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { email, name, company } = req.body;

    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Check if email already exists for another contact
      const existingContact = await query(
        'SELECT * FROM contacts WHERE user_id = $1 AND email = $2 AND id != $3',
        [userId, email, id]
      );

      if (existingContact.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Another contact with this email already exists'
        });
      }
    }

    // Update contact
    const result = await query(
      `UPDATE contacts
       SET email = COALESCE($1, email),
           name = COALESCE($2, name),
           company = COALESCE($3, company),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [email, name, company, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { contact: result.rows[0] }
    });
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};
