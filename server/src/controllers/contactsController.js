import { query } from '../config/database.js';
import Papa from 'papaparse';

/**
 * Get all contacts for the authenticated user
 * Only returns personal contacts (source = 'compose'), not campaign recipients
 */
export const getAllContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    // First, check which columns exist in the contacts table
    const columnCheck = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name IN ('source', 'campaign_id', 'is_active', 'is_favorite')
    `);
    
    const existingColumns = columnCheck.rows.map(r => r.column_name);
    const hasSource = existingColumns.includes('source');
    const hasCampaignId = existingColumns.includes('campaign_id');
    const hasIsActive = existingColumns.includes('is_active');
    const hasIsFavorite = existingColumns.includes('is_favorite');

    // Build query dynamically based on existing columns
    let queryText = `SELECT * FROM contacts WHERE user_id = $1`;
    let queryParams = [userId];

    // Add source filter if column exists
    if (hasSource) {
      queryText += ` AND (source = 'compose' OR source IS NULL)`;
    }

    // Add campaign_id filter if column exists
    if (hasCampaignId) {
      queryText += ` AND campaign_id IS NULL`;
    }

    // Add is_active filter if column exists
    if (hasIsActive) {
      queryText += ` AND (is_active = true OR is_active IS NULL)`;
    }

    // Add search filter if provided
    if (search) {
      queryText += ' AND (email ILIKE $2 OR name ILIKE $2)';
      queryParams.push(`%${search}%`);
    }

    // Order by favorites first (if column exists), then by created_at
    if (hasIsFavorite) {
      queryText += ' ORDER BY COALESCE(is_favorite, false) DESC, created_at DESC';
    } else {
      queryText += ' ORDER BY created_at DESC';
    }

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
 * Create a single contact (personal contact for compose)
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
      `SELECT * FROM contacts WHERE user_id = $1 AND email = $2`,
      [userId, email]
    );

    if (existingContact.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Contact with this email already exists'
      });
    }

    // Create contact - try with source column, fallback without it
    let result;
    try {
      result = await query(
        `INSERT INTO contacts (user_id, email, name, company, source)
         VALUES ($1, $2, $3, $4, 'compose')
         RETURNING *`,
        [userId, email, name || null, company || null]
      );
    } catch (insertError) {
      // If source column doesn't exist, insert without it
      if (insertError.code === '42703') {
        result = await query(
          `INSERT INTO contacts (user_id, email, name, company)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, email, name || null, company || null]
        );
      } else {
        throw insertError;
      }
    }

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
 * Upload contacts from CSV file (personal contacts for compose)
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
        // Check if contact exists (only among compose contacts)
        const existingContact = await query(
          `SELECT * FROM contacts WHERE user_id = $1 AND email = $2
           AND (source = 'compose' OR source IS NULL)
           AND (is_active = true OR is_active IS NULL)`,
          [userId, email]
        );

        if (existingContact.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insert contact with source = 'compose'
        await query(
          `INSERT INTO contacts (user_id, email, name, company, source)
           VALUES ($1, $2, $3, $4, 'compose')`,
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
 * Delete a contact (soft delete if is_active column exists, otherwise hard delete)
 */
export const deleteContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Try soft delete first
    let result;
    try {
      result = await query(
        `UPDATE contacts 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
      );
    } catch (updateError) {
      // If is_active column doesn't exist, do hard delete
      if (updateError.code === '42703') {
        result = await query(
          'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *',
          [id, userId]
        );
      } else {
        throw updateError;
      }
    }

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

/**
 * Toggle favorite status for a contact
 * Note: Requires is_favorite column. Returns error if column doesn't exist.
 */
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if is_favorite column exists
    const columnCheck = await query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'contacts' AND column_name = 'is_favorite'`
    );

    if (columnCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Favorite feature not available. Please run database migrations.'
      });
    }

    // Toggle is_favorite
    const result = await query(
      `UPDATE contacts
       SET is_favorite = NOT COALESCE(is_favorite, false),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
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
      data: { contact: result.rows[0] }
    });
  } catch (error) {
    console.error('❌ Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle favorite'
    });
  }
};
