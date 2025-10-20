import { query, transaction } from '../config/database.js';

/**
 * Get all campaigns for the authenticated user
 */
export const getCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT c.*, 
             COUNT(DISTINCT co.id) as total_contacts,
             COUNT(DISTINCT se.id) as total_sent
      FROM campaigns c
      LEFT JOIN contacts co ON c.id = co.campaign_id
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

    const result = await query(
      `SELECT c.*, 
              COUNT(DISTINCT co.id) as total_contacts,
              COUNT(DISTINCT se.id) as total_sent
       FROM campaigns c
       LEFT JOIN contacts co ON c.id = co.campaign_id
       LEFT JOIN sent_emails se ON c.id = se.campaign_id
       WHERE c.id = $1 AND c.user_id = $2
       GROUP BY c.id`,
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
      data: { campaign: result.rows[0] },
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
      daily_limit = 50,
      delay_min = 5,
      delay_max = 15,
      track_opens = true,
      track_clicks = true,
    } = req.body;

    const result = await query(
      `INSERT INTO campaigns 
       (user_id, name, subject, body, daily_limit, delay_min, delay_max, track_opens, track_clicks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        name,
        subject,
        body,
        daily_limit,
        delay_min,
        delay_max,
        track_opens,
        track_clicks,
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
