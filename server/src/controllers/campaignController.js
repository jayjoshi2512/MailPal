import Campaign from '../models/Campaign.js';
import SentEmail from '../models/SentEmail.js';

/**
 * Get all campaigns for the authenticated user
 * Excludes "Manual Emails" system campaign used for compose page tracking
 */
export const getCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50, offset = 0 } = req.query;

    const query = {
      userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
      name: { $ne: 'Manual Emails' }
    };

    if (status) {
      query.status = status;
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    // Get sent count for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const sentCount = await SentEmail.countDocuments({ campaignId: campaign._id });
        return { 
          ...campaign, 
          id: campaign._id, // Add id alias for frontend compatibility
          total_sent: sentCount 
        };
      })
    );

    res.json({
      success: true,
      data: {
        campaigns: campaignsWithStats,
        total: campaignsWithStats.length,
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
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId }).lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    // Get sent emails for this campaign
    const sentEmails = await SentEmail.find({ campaignId: id, userId })
      .select('recipientEmail recipientName subject sentAt')
      .sort({ sentAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { 
        campaign: {
          ...campaign,
          id: campaign._id // Add id alias for frontend compatibility
        },
        sentEmails: sentEmails.map(email => ({
          ...email,
          id: email._id
        }))
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
    const userId = req.user._id;
    const { name, subject, body, attachments } = req.body;

    const campaign = await Campaign.create({
      userId,
      name,
      subject,
      body,
      attachments: attachments || [],
    });

    res.status(201).json({
      success: true,
      data: { 
        campaign: {
          ...campaign.toObject(),
          id: campaign._id
        }
      },
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
    const userId = req.user._id;
    const updates = req.body;

    const allowedFields = [
      'name', 'subject', 'body', 'status', 'dailyLimit',
      'delayMin', 'delayMax', 'trackOpens', 'trackClicks', 'attachments'
    ];

    const updateData = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      data: { 
        campaign: {
          ...campaign.toObject(),
          id: campaign._id
        }
      },
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
 * Delete a campaign (soft delete)
 */
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!campaign) {
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
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const CampaignContact = (await import('../models/CampaignContact.js')).default;
    
    const [totalContacts, sentCount, failedCount, pendingCount, emailsSent] = await Promise.all([
      CampaignContact.countDocuments({ campaignId: id, isActive: true }),
      CampaignContact.countDocuments({ campaignId: id, isActive: true, status: 'sent' }),
      CampaignContact.countDocuments({ campaignId: id, isActive: true, status: 'failed' }),
      CampaignContact.countDocuments({ campaignId: id, isActive: true, status: 'pending' }),
      SentEmail.countDocuments({ campaignId: id })
    ]);

    res.json({
      success: true,
      data: {
        analytics: {
          campaign_id: id,
          campaign_name: campaign.name,
          status: campaign.status,
          total_contacts: totalContacts,
          sent_count: sentCount,
          failed_count: failedCount,
          pending_count: pendingCount,
          emails_sent: emailsSent
        }
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
};
