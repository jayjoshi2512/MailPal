import { query } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Dashboard Controller - Analytics and statistics
 */

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all stats in parallel for better performance
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
        const result = await query(
            `SELECT 
                COUNT(*) as total_sent,
                COUNT(CASE WHEN sent_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as sent_this_week,
                COUNT(CASE WHEN sent_at >= CURRENT_DATE THEN 1 END) as sent_today
             FROM sent_emails
             WHERE user_id = $1 AND sent_at IS NOT NULL`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return {
                totalSent: 0,
                sentThisWeek: 0,
                sentToday: 0
            };
        }

        return {
            totalSent: parseInt(result.rows[0].total_sent) || 0,
            sentThisWeek: parseInt(result.rows[0].sent_this_week) || 0,
            sentToday: parseInt(result.rows[0].sent_today) || 0
        };
    } catch (error) {
        logger.error('Error fetching email statistics:', error);
        return {
            totalSent: 0,
            sentThisWeek: 0,
            sentToday: 0
        };
    }
}

/**
 * Get campaign statistics
 * Excludes "Manual Emails" system campaign
 */
async function getCampaignStatistics(userId) {
    try {
        const result = await query(
            `SELECT 
                COUNT(*) as total_campaigns,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_campaigns
             FROM campaigns
             WHERE user_id = $1 
             AND (is_active = true OR is_active IS NULL)
             AND name != 'Manual Emails'`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return {
                totalCampaigns: 0,
                activeCampaigns: 0,
                completedCampaigns: 0,
                draftCampaigns: 0
            };
        }

        return {
            totalCampaigns: parseInt(result.rows[0].total_campaigns) || 0,
            activeCampaigns: parseInt(result.rows[0].active_campaigns) || 0,
            completedCampaigns: parseInt(result.rows[0].completed_campaigns) || 0,
            draftCampaigns: parseInt(result.rows[0].draft_campaigns) || 0
        };
    } catch (error) {
        logger.error('Error fetching campaign statistics:', error);
        return {
            totalCampaigns: 0,
            activeCampaigns: 0,
            completedCampaigns: 0,
            draftCampaigns: 0
        };
    }
}

/**
 * Get recent email activity (last 10 emails)
 * Shows ALL sent emails - both compose and campaign emails
 */
async function getRecentActivity(userId) {
    try {
        const result = await query(
            `SELECT 
                se.id,
                se.subject,
                se.recipient_email as email_to,
                se.recipient_name,
                se.sent_at,
                COALESCE(c.name, 'Compose') as campaign_name,
                CASE WHEN c.name = 'Manual Emails' OR c.id IS NULL THEN 'compose' ELSE 'campaign' END as email_type
             FROM sent_emails se
             LEFT JOIN campaigns c ON se.campaign_id = c.id
             WHERE se.user_id = $1 
             AND se.sent_at IS NOT NULL
             ORDER BY se.sent_at DESC
             LIMIT 10`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return [];
        }

        return result.rows.map(row => ({
            id: row.id,
            subject: row.subject || 'No Subject',
            emailTo: row.email_to,
            recipient: row.email_to,
            recipientName: row.recipient_name,
            sentAt: row.sent_at,
            status: 'sent',
            campaignName: row.campaign_name === 'Manual Emails' ? 'Compose' : row.campaign_name,
            emailType: row.email_type
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
        const result = await query(
            `SELECT 
                DATE(sent_at) as date,
                COUNT(*) as count
             FROM sent_emails
             WHERE user_id = $1
             AND sent_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
             AND sent_at IS NOT NULL
             GROUP BY DATE(sent_at)
             ORDER BY DATE(sent_at) ASC`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return [];
        }

        return result.rows.map(row => ({
            date: row.date,
            count: parseInt(row.count) || 0
        }));
    } catch (error) {
        logger.error('Error fetching email trends:', error);
        return [];
    }
}

/**
 * Get campaign activity trends over time (last 30 days)
 * Excludes "Manual Emails" system campaign
 */
async function getCampaignTrends(userId) {
    try {
        const result = await query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
             FROM campaigns
             WHERE user_id = $1
             AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
             AND (is_active = true OR is_active IS NULL)
             AND name != 'Manual Emails'
             GROUP BY DATE(created_at)
             ORDER BY DATE(created_at) ASC`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return [];
        }

        return result.rows.map(row => ({
            date: row.date,
            count: parseInt(row.count) || 0,
            active: parseInt(row.active) || 0,
            completed: parseInt(row.completed) || 0
        }));
    } catch (error) {
        logger.error('Error fetching campaign trends:', error);
        return [];
    }
}

/**
 * Get top performing campaigns
 * Excludes "Manual Emails" system campaign
 */
async function getCampaignPerformance(userId) {
    try {
        const result = await query(
            `SELECT 
                c.id,
                c.name,
                c.status,
                COUNT(DISTINCT se.id) as emails_sent
             FROM campaigns c
             LEFT JOIN sent_emails se ON c.id = se.campaign_id
             WHERE c.user_id = $1 
             AND (c.is_active = true OR c.is_active IS NULL)
             AND c.name != 'Manual Emails'
             GROUP BY c.id, c.name, c.status
             ORDER BY emails_sent DESC
             LIMIT 5`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return [];
        }

        return result.rows.map(row => ({
            id: row.id,
            name: row.name || 'Unnamed Campaign',
            status: row.status || 'unknown',
            emails_sent: parseInt(row.emails_sent) || 0
        }));
    } catch (error) {
        logger.error('Error fetching campaign performance:', error);
        return [];
    }
}

/**
 * Get overall response rate
 * Note: Since click_tracking is removed, this just returns email stats
 */
export const getResponseRate = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await query(
            `SELECT 
                COUNT(DISTINCT se.id) as total_sent
             FROM campaigns c
             LEFT JOIN sent_emails se ON c.id = se.campaign_id
             WHERE c.user_id = $1 AND (c.is_active = true OR c.is_active IS NULL)`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalSent: 0,
                    responseRate: 0
                }
            });
        }

        const totalSent = parseInt(result.rows[0].total_sent) || 0;

        res.json({
            success: true,
            data: {
                totalSent,
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
