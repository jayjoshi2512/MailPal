import { query } from '../config/database.js';

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

    let queryText = 'SELECT * FROM contacts WHERE campaign_id = $1';
    const params = [campaignId];

    if (status) {
      queryText += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        contacts: result.rows,
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
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
    const { email, first_name, last_name, company, job_title, custom_fields } =
      req.body;

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

    // Add contact with source='campaign' and user_id
    const result = await query(
      `INSERT INTO contacts 
       (user_id, campaign_id, email, first_name, last_name, company, job_title, custom_fields, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'campaign')
       RETURNING *`,
      [
        userId,
        campaignId,
        email,
        first_name,
        last_name,
        company,
        job_title,
        custom_fields || {},
      ]
    );

    res.status(201).json({
      success: true,
      data: { contact: result.rows[0] },
      message: 'Contact added successfully',
    });
  } catch (error) {
    if (error.code === '23505') {
      // Unique violation
      return res.status(409).json({
        success: false,
        error: 'Contact already exists in this campaign',
      });
    }
    console.error('Add contact error:', error);
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

    // Build bulk insert query with source='campaign'
    const values = [];
    const placeholders = [];
    let paramIndex = 1;

    contacts.forEach((contact, index) => {
      placeholders.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${
          paramIndex + 3
        }, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, 'campaign')`
      );

      values.push(
        userId,
        campaignId,
        contact.email,
        contact.first_name || null,
        contact.last_name || null,
        contact.company || null,
        contact.job_title || null,
        contact.custom_fields || {}
      );

      paramIndex += 8;
    });

    const result = await query(
      `INSERT INTO contacts 
       (user_id, campaign_id, email, first_name, last_name, company, job_title, custom_fields, source)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT DO NOTHING
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
    console.error('Bulk add contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add contacts',
    });
  }
};

/**
 * Update a contact
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

    const allowedFields = [
      'email',
      'first_name',
      'last_name',
      'company',
      'job_title',
      'custom_fields',
      'status',
    ];

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
      `UPDATE contacts 
       SET ${setClause.join(', ')}, updated_at = NOW()
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
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact',
    });
  }
};

/**
 * Delete a contact
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
      'DELETE FROM contacts WHERE id = $1 AND campaign_id = $2 RETURNING id',
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
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact',
    });
  }
};
