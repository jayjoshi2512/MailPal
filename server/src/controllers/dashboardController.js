import SentEmail from '../models/SentEmail.js';
import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import logger from '../config/logger.js';

/**
 * Dashboard Controller - Analytics and statistics
 */

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      emailStats,
      campaignStats,
      recentActivity,
      emailTrends,
      campaignTrends,
      campaignPerformance
    ] = await Promise.all([
      getEmailStatistics(userId),
      getCampaignStatistics(userId),
      getRecentActivity(userId),
      getEmailTrends(userId),
      getCampaignTrends(userId),
      getCampaignPerformance(userId)
    ]);

    res.json({
      success: true,
      data: {
        emailStats,
        campaignStats,
        recentActivity,
        emailTrends,
        campaignTrends,
        campaignPerformance
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

/**
 * Get email statistics
 */
async function getEmailStatistics(userId) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalSent, sentThisWeek, sentToday] = await Promise.all([
      SentEmail.countDocuments({ userId, sentAt: { $ne: null } }),
      SentEmail.countDocuments({ userId, sentAt: { $gte: sevenDaysAgo } }),
      SentEmail.countDocuments({ userId, sentAt: { $gte: startOfToday } })
    ]);

    return {
      totalSent: totalSent || 0,
      sentThisWeek: sentThisWeek || 0,
      sentToday: sentToday || 0
    };
  } catch (error) {
    logger.error('Error fetching email statistics:', error);
    return { totalSent: 0, sentThisWeek: 0, sentToday: 0 };
  }
}

/**
 * Get campaign statistics
 */
async function getCampaignStatistics(userId) {
  try {
    const query = {
      userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
      name: { $ne: 'Manual Emails' }
    };

    const [totalCampaigns, activeCampaigns, completedCampaigns, draftCampaigns] = await Promise.all([
      Campaign.countDocuments(query),
      Campaign.countDocuments({ ...query, status: 'active' }),
      Campaign.countDocuments({ ...query, status: 'completed' }),
      Campaign.countDocuments({ ...query, status: 'draft' })
    ]);

    return {
      totalCampaigns: totalCampaigns || 0,
      activeCampaigns: activeCampaigns || 0,
      completedCampaigns: completedCampaigns || 0,
      draftCampaigns: draftCampaigns || 0
    };
  } catch (error) {
    logger.error('Error fetching campaign statistics:', error);
    return { totalCampaigns: 0, activeCampaigns: 0, completedCampaigns: 0, draftCampaigns: 0 };
  }
}

/**
 * Get recent email activity (last 10 emails)
 */
async function getRecentActivity(userId) {
  try {
    const sentEmails = await SentEmail.find({ userId, sentAt: { $ne: null } })
      .populate('campaignId', 'name')
      .sort({ sentAt: -1 })
      .limit(10)
      .lean();

    return sentEmails.map(row => ({
      id: row._id,
      subject: row.subject || 'No Subject',
      emailTo: row.recipientEmail,
      recipient: row.recipientEmail,
      recipientName: row.recipientName,
      sentAt: row.sentAt,
      status: 'sent',
      campaignName: row.campaignId?.name === 'Manual Emails' || !row.campaignId ? 'Compose' : row.campaignId.name,
      emailType: row.campaignId?.name === 'Manual Emails' || !row.campaignId ? 'compose' : 'campaign'
    }));
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Get email trends over time (last 30 days)
 */
async function getEmailTrends(userId) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trends = await SentEmail.aggregate([
      {
        $match: {
          userId,
          sentAt: { $gte: thirtyDaysAgo, $ne: null }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return trends.map(t => ({
      date: t._id,
      count: t.count
    }));
  } catch (error) {
    logger.error('Error fetching email trends:', error);
    return [];
  }
}

/**
 * Get campaign activity trends over time (last 30 days)
 */
async function getCampaignTrends(userId) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trends = await Campaign.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: thirtyDaysAgo },
          $or: [{ isActive: true }, { isActive: { $exists: false } }],
          name: { $ne: 'Manual Emails' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return trends.map(t => ({
      date: t._id,
      count: t.count,
      active: t.active,
      completed: t.completed
    }));
  } catch (error) {
    logger.error('Error fetching campaign trends:', error);
    return [];
  }
}

/**
 * Get top performing campaigns
 */
async function getCampaignPerformance(userId) {
  try {
    const campaigns = await Campaign.find({
      userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
      name: { $ne: 'Manual Emails' }
    }).lean();

    const performance = await Promise.all(
      campaigns.map(async (campaign) => {
        const emailsSent = await SentEmail.countDocuments({ campaignId: campaign._id });
        return {
          id: campaign._id,
          name: campaign.name || 'Unnamed Campaign',
          status: campaign.status || 'unknown',
          emails_sent: emailsSent
        };
      })
    );

    return performance
      .sort((a, b) => b.emails_sent - a.emails_sent)
      .slice(0, 5);
  } catch (error) {
    logger.error('Error fetching campaign performance:', error);
    return [];
  }
}

/**
 * Get overall response rate
 */
export const getResponseRate = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalSent = await SentEmail.countDocuments({
      userId,
      campaignId: { $ne: null }
    });

    res.json({
      success: true,
      data: {
        totalSent: totalSent || 0,
        responseRate: 0 // Click tracking removed
      }
    });
  } catch (error) {
    logger.error('Response rate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch response rate',
      message: error.message
    });
  }
};

export default {
  getDashboardStats,
  getResponseRate
};
