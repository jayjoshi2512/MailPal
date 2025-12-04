import { query } from '../config/database.js';

/**
 * Campaign Contacts Controller
 * Manages contacts for campaigns (stored in campaign_contacts table)
 * These are separate from personal contacts in the contacts table
 */

/**
 * Get all contacts for a campaign
 */
export const getContacts = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const userId = req.user.id;
        const { status, limit = 100, offset = 0 } = req.query;

        // Verify campaign ownership
        const campaignCheck = await query(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found',
            });
        }

        let queryText = 'SELECT * FROM campaign_contacts WHERE campaign_id = $1 AND is_active = true';
        const params = [campaignId];

        if (status) {
            queryText += ` AND status = $${params.length + 1}`;
            params.push(status);
        }

        queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await query(queryText, params);

        // Get total count
        const countResult = await query(
            'SELECT COUNT(*) as total FROM campaign_contacts WHERE campaign_id = $1 AND is_active = true',
            [campaignId]
        );

        res.json({
            success: true,
            data: {
                contacts: result.rows,
                total: parseInt(countResult.rows[0].total),
            },
        });
    } catch (error) {
        console.error('Get campaign contacts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contacts',
        });
    }
};

/**
 * Add a single contact to a campaign
 */
export const addContact = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const userId = req.user.id;
        const { email, name, first_name, last_name, company, job_title, custom_fields } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        // Verify campaign ownership
        const campaignCheck = await query(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found',
            });
        }

        // Build name if not provided
        const contactName = name || [first_name, last_name].filter(Boolean).join(' ') || null;

        const result = await query(
            `INSERT INTO campaign_contacts 
             (campaign_id, user_id, email, name, first_name, last_name, company, job_title, custom_fields)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [campaignId, userId, email, contactName, first_name || null, last_name || null, company || null, job_title || null, custom_fields || {}]
        );

        res.status(201).json({
            success: true,
            data: { contact: result.rows[0] },
            message: 'Contact added successfully',
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'Contact already exists in this campaign',
            });
        }
        console.error('Add campaign contact error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add contact',
        });
    }
};

/**
 * Bulk add contacts to a campaign
 */
export const bulkAddContacts = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const userId = req.user.id;
        const { contacts } = req.body;

        if (!Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Contacts array is required',
            });
        }

        // Verify campaign ownership
        const campaignCheck = await query(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found',
            });
        }

        // Build bulk insert query
        const values = [];
        const placeholders = [];
        let paramIndex = 1;

        contacts.forEach((contact) => {
            const name = contact.name || [contact.first_name, contact.last_name].filter(Boolean).join(' ') || null;
            
            placeholders.push(
                `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, $${paramIndex + 8})`
            );

            values.push(
                campaignId,
                userId,
                contact.email,
                name,
                contact.first_name || null,
                contact.last_name || null,
                contact.company || null,
                contact.job_title || null,
                contact.custom_fields || {}
            );

            paramIndex += 9;
        });

        const result = await query(
            `INSERT INTO campaign_contacts 
             (campaign_id, user_id, email, name, first_name, last_name, company, job_title, custom_fields)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT (campaign_id, email) DO NOTHING
             RETURNING *`,
            values
        );

        res.status(201).json({
            success: true,
            data: {
                contacts: result.rows,
                added: result.rowCount,
                skipped: contacts.length - result.rowCount,
            },
            message: `${result.rowCount} contacts added successfully`,
        });
    } catch (error) {
        console.error('Bulk add campaign contacts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add contacts',
        });
    }
};

/**
 * Update a campaign contact
 */
export const updateContact = async (req, res) => {
    try {
        const { campaignId, contactId } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        // Verify campaign ownership
        const campaignCheck = await query(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found',
            });
        }

        const allowedFields = ['email', 'name', 'first_name', 'last_name', 'company', 'job_title', 'custom_fields', 'status'];

        const setClause = [];
        const params = [contactId, campaignId];
        let paramIndex = 3;

        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = $${paramIndex}`);
                params.push(updates[key]);
                paramIndex++;
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update',
            });
        }

        const result = await query(
            `UPDATE campaign_contacts 
             SET ${setClause.join(', ')}
             WHERE id = $1 AND campaign_id = $2
             RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Contact not found',
            });
        }

        res.json({
            success: true,
            data: { contact: result.rows[0] },
            message: 'Contact updated successfully',
        });
    } catch (error) {
        console.error('Update campaign contact error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update contact',
        });
    }
};

/**
 * Delete a campaign contact (soft delete)
 */
export const deleteContact = async (req, res) => {
    try {
        const { campaignId, contactId } = req.params;
        const userId = req.user.id;

        // Verify campaign ownership
        const campaignCheck = await query(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found',
            });
        }

        const result = await query(
            'UPDATE campaign_contacts SET is_active = false WHERE id = $1 AND campaign_id = $2 RETURNING id',
            [contactId, campaignId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Contact not found',
            });
        }

        res.json({
            success: true,
            message: 'Contact deleted successfully',
        });
    } catch (error) {
        console.error('Delete campaign contact error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete contact',
        });
    }
};
