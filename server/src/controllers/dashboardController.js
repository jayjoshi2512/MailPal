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
            campaignPerformance
        ] = await Promise.all([
            getEmailStatistics(userId),
            getCampaignStatistics(userId),
            getRecentActivity(userId),
            getEmailTrends(userId),
            getCampaignPerformance(userId)
        ]);

        res.json({
            success: true,
            data: {
                emailStats,
                campaignStats,
                recentActivity,
                emailTrends,
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
                COUNT(CASE WHEN se.sent_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as sent_this_week,
                COUNT(CASE WHEN se.sent_at >= CURRENT_DATE THEN 1 END) as sent_today
             FROM sent_emails se
             JOIN campaigns c ON se.campaign_id = c.id
             WHERE c.user_id = $1 AND se.sent_at IS NOT NULL`,
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
             WHERE user_id = $1`,
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
 */
async function getRecentActivity(userId) {
    try {
        const result = await query(
            `SELECT 
                se.id,
                se.subject,
                ct.email as email_to,
                se.sent_at,
                se.status,
                c.name as campaign_name
             FROM sent_emails se
             JOIN campaigns c ON se.campaign_id = c.id
             JOIN contacts ct ON se.contact_id = ct.id
             WHERE c.user_id = $1 AND se.sent_at IS NOT NULL
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
            sentAt: row.sent_at,
            status: row.status || 'sent',
            campaignName: row.campaign_name
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
             FROM sent_emails se
             JOIN campaigns c ON se.campaign_id = c.id
             WHERE c.user_id = $1
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
            emails: parseInt(row.count) || 0
        }));
    } catch (error) {
        logger.error('Error fetching email trends:', error);
        return [];
    }
}

/**
 * Get top performing campaigns
 */
async function getCampaignPerformance(userId) {
    try {
        const result = await query(
            `SELECT 
                c.id,
                c.name,
                c.status,
                COUNT(DISTINCT se.id) as emails_sent,
                COUNT(DISTINCT ct.id) as clicks,
                ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT se.id) > 0 
                        THEN (COUNT(DISTINCT ct.id)::numeric / COUNT(DISTINCT se.id)::numeric * 100) 
                        ELSE 0 
                    END, 
                    2
                ) as click_rate
             FROM campaigns c
             LEFT JOIN sent_emails se ON c.id = se.campaign_id
             LEFT JOIN click_tracking ct ON se.id = ct.sent_email_id
             WHERE c.user_id = $1
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
            emailsSent: parseInt(row.emails_sent) || 0,
            clicks: parseInt(row.clicks) || 0,
            clickRate: parseFloat(row.click_rate) || 0
        }));
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
        const userId = req.user.id;

        const result = await query(
            `SELECT 
                COUNT(DISTINCT se.id) as total_sent,
                COUNT(DISTINCT ct.id) as total_clicks
             FROM campaigns c
             LEFT JOIN sent_emails se ON c.id = se.campaign_id
             LEFT JOIN click_tracking ct ON se.id = ct.sent_email_id
             WHERE c.user_id = $1`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalSent: 0,
                    totalClicks: 0,
                    responseRate: 0
                }
            });
        }

        const totalSent = parseInt(result.rows[0].total_sent) || 0;
        const totalClicks = parseInt(result.rows[0].total_clicks) || 0;
        const responseRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                totalSent,
                totalClicks,
                responseRate: parseFloat(responseRate)
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
