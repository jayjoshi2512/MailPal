import { query } from '../config/database.js';
import Papa from 'papaparse';

/**
 * Personal Contacts Controller
 * Manages contacts for the Compose page (personal contacts only)
 * Campaign contacts are handled separately in contactController.js
 */

/**
 * Get all personal contacts for the authenticated user
 */
export const getAllContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        let queryText = `
            SELECT * FROM contacts 
            WHERE user_id = $1 AND is_active = true
        `;
        let queryParams = [userId];

        // Add search filter if provided
        if (search) {
            queryText += ` AND (
                email ILIKE $2 
                OR name ILIKE $2 
                OR first_name ILIKE $2 
                OR last_name ILIKE $2
                OR company ILIKE $2
            )`;
            queryParams.push(`%${search}%`);
        }

        // Order by favorites first, then by created_at
        queryText += ` ORDER BY is_favorite DESC, created_at DESC`;

        const result = await query(queryText, queryParams);

        // Transform data to ensure consistent name field
        const contacts = result.rows.map(contact => {
            if (!contact.name && (contact.first_name || contact.last_name)) {
                contact.name = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
            }
            return contact;
        });

        res.json({
            success: true,
            data: {
                contacts: contacts,
                total: contacts.length
            }
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contacts'
        });
    }
};

/**
 * Create a single personal contact
 */
export const createContact = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, name, first_name, last_name, company, job_title, phone, notes } = req.body;

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
            `SELECT id FROM contacts WHERE user_id = $1 AND email = $2 AND is_active = true`,
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
            `INSERT INTO contacts (user_id, email, name, first_name, last_name, company, job_title, phone, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [userId, email, name || null, first_name || null, last_name || null, company || null, job_title || null, phone || null, notes || null]
        );

        res.json({
            success: true,
            data: { contact: result.rows[0] }
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create contact'
        });
    }
};

/**
 * Upload contacts from CSV file (personal contacts)
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
        let parsed;
        try {
            parsed = Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_')
            });
        } catch (parseError) {
            console.error('CSV parse error:', parseError);
            return res.status(400).json({
                success: false,
                error: 'Invalid CSV format'
            });
        }

        const contacts = parsed.data;
        
        if (!contacts || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No contacts found in CSV. Make sure your CSV has headers and data rows.'
            });
        }
        
        let added = 0;
        let skipped = 0;
        let errors = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (const contact of contacts) {
            // Try multiple email field names
            const email = (
                contact.email || 
                contact.e_mail || 
                contact['e-mail'] ||
                contact.mail ||
                contact.email_address
            )?.toString().trim();
            
            // Try multiple name field names
            let name = (
                contact.name || 
                contact.full_name || 
                contact.fullname
            )?.toString().trim() || null;
            
            const firstName = (
                contact.first_name || 
                contact.firstname || 
                contact.first
            )?.toString().trim() || null;
            
            const lastName = (
                contact.last_name || 
                contact.lastname || 
                contact.last
            )?.toString().trim() || null;
            
            const company = (
                contact.company || 
                contact.organization || 
                contact.org
            )?.toString().trim() || null;

            // Build name from first + last if name not provided
            if (!name && (firstName || lastName)) {
                name = [firstName, lastName].filter(Boolean).join(' ');
            }

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
                // Check if contact exists - handle case where is_active column might not exist
                let existingContact;
                try {
                    existingContact = await query(
                        `SELECT id FROM contacts WHERE user_id = $1 AND email = $2 AND is_active = true`,
                        [userId, email]
                    );
                } catch (queryError) {
                    // If is_active column doesn't exist, try without it
                    if (queryError.code === '42703') {
                        existingContact = await query(
                            `SELECT id FROM contacts WHERE user_id = $1 AND email = $2`,
                            [userId, email]
                        );
                    } else {
                        throw queryError;
                    }
                }

                if (existingContact.rows.length > 0) {
                    skipped++;
                    continue;
                }

                // Insert contact
                await query(
                    `INSERT INTO contacts (user_id, email, name, first_name, last_name, company)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [userId, email, name, firstName, lastName, company]
                );
                added++;
            } catch (err) {
                // Handle unique constraint violation
                if (err.code === '23505') {
                    skipped++;
                } else {
                    console.error('Insert error for', email, ':', err.message);
                    skipped++;
                    errors.push({ email, reason: err.message });
                }
            }
        }

        res.json({
            success: true,
            data: {
                added,
                skipped,
                total: contacts.length,
                errors: errors.length > 0 && errors.length <= 10 ? errors : undefined
            }
        });
    } catch (error) {
        console.error('Error uploading contacts:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload contacts'
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
        const { email, name, first_name, last_name, company, job_title, phone, notes } = req.body;

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
                'SELECT id FROM contacts WHERE user_id = $1 AND email = $2 AND id != $3 AND is_active = true',
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
                 first_name = COALESCE($3, first_name),
                 last_name = COALESCE($4, last_name),
                 company = COALESCE($5, company),
                 job_title = COALESCE($6, job_title),
                 phone = COALESCE($7, phone),
                 notes = COALESCE($8, notes)
             WHERE id = $9 AND user_id = $10 AND is_active = true
             RETURNING *`,
            [email, name, first_name, last_name, company, job_title, phone, notes, id, userId]
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
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update contact'
        });
    }
};

/**
 * Delete a contact (soft delete)
 */
export const deleteContact = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await query(
            `UPDATE contacts 
             SET is_active = false
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
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
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete contact'
        });
    }
};

/**
 * Toggle favorite status for a contact
 */
export const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await query(
            `UPDATE contacts
             SET is_favorite = NOT is_favorite
             WHERE id = $1 AND user_id = $2 AND is_active = true
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
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle favorite'
        });
    }
};

/**
 * Bulk favorite contacts
 */
export const bulkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Contact IDs array is required'
            });
        }

        const result = await query(
            `UPDATE contacts
             SET is_favorite = true
             WHERE id = ANY($1) AND user_id = $2 AND is_active = true
             RETURNING *`,
            [ids, userId]
        );

        res.json({
            success: true,
            data: { 
                updated: result.rowCount,
                contacts: result.rows 
            }
        });
    } catch (error) {
        console.error('Error bulk favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update favorites'
        });
    }
};

/**
 * Bulk delete contacts (soft delete)
 */
export const bulkDelete = async (req, res) => {
    try {
        const userId = req.user.id;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Contact IDs array is required'
            });
        }

        const result = await query(
            `UPDATE contacts 
             SET is_active = false
             WHERE id = ANY($1) AND user_id = $2
             RETURNING id`,
            [ids, userId]
        );

        res.json({
            success: true,
            data: { 
                deleted: result.rowCount 
            }
        });
    } catch (error) {
        console.error('Error bulk delete:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete contacts'
        });
    }
};
