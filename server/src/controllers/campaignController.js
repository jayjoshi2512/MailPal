import { query, transaction } from '../config/database.js';

/**
 * Get all campaigns for the authenticated user
 */
export const getCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT 
        c.*,
        COUNT(DISTINCT se.id) as total_sent
      FROM campaigns c
      LEFT JOIN sent_emails se ON c.id = se.campaign_id
      WHERE c.user_id = $1
    `;

    const params = [userId];

    if (status) {
      queryText += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += `
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        campaigns: result.rows,
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
    });
  }
};

/**
 * Get a single campaign by ID
 */
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`[getCampaignById] Campaign ID: ${id}, User ID: ${userId}`);

    const result = await query(
      `SELECT * FROM campaigns WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const campaign = result.rows[0];
    console.log(`[getCampaignById] Campaign status: ${campaign.status}`);
    
    // Always fetch sent emails for campaign, not just when completed
    const sentResult = await query(
      `SELECT id, recipient_email, recipient_name, subject, sent_at 
       FROM sent_emails 
       WHERE campaign_id = $1 AND user_id = $2
       ORDER BY sent_at DESC`,
      [id, userId]
    );
    const sentEmails = sentResult.rows;
    console.log(`[getCampaignById] Sent emails found: ${sentEmails.length}`, sentEmails);

    res.json({
      success: true,
      data: { 
        campaign,
        sentEmails 
      },
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign',
    });
  }
};

/**
 * Create a new campaign
 */
export const createCampaign = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      subject,
      body,
    } = req.body;

    const result = await query(
      `INSERT INTO campaigns 
       (user_id, name, subject, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        userId,
        name,
        subject,
        body,
      ]
    );

    res.status(201).json({
      success: true,
      data: { campaign: result.rows[0] },
      message: 'Campaign created successfully',
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
    });
  }
};

/**
 * Update a campaign
 */
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'name',
      'subject',
      'body',
      'status',
      'daily_limit',
      'delay_min',
      'delay_max',
      'track_opens',
      'track_clicks',
    ];

    const setClause = [];
    const params = [id, userId];
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
      `UPDATE campaigns 
       SET ${setClause.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      data: { campaign: result.rows[0] },
      message: 'Campaign updated successfully',
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign',
    });
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign',
    });
  }
};

/**
 * Get campaign analytics
 */
export const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify campaign ownership
    const campaignCheck = await query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Get analytics from view
    const result = await query(
      'SELECT * FROM campaign_analytics WHERE campaign_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: { analytics: result.rows[0] || {} },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
};
