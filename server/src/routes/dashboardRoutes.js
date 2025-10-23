import express from 'express';
import { getDashboardStats, getResponseRate } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * Dashboard Routes - All protected by authentication
 */

// Get comprehensive dashboard statistics
router.get('/stats', authenticate, getDashboardStats);

// Get response rate
router.get('/response-rate', authenticate, getResponseRate);

// Debug endpoint to check raw database counts
router.get('/debug', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [campaigns, contacts, sentEmails] = await Promise.all([
      query('SELECT COUNT(*) as count FROM campaigns WHERE user_id = $1', [userId]),
      query('SELECT COUNT(*) as count FROM contacts WHERE user_id = $1', [userId]),
      query(`SELECT COUNT(*) as count FROM sent_emails se 
             JOIN campaigns c ON se.campaign_id = c.id 
             WHERE c.user_id = $1`, [userId])
    ]);

    const recentEmails = await query(
      `SELECT se.id, se.subject, se.sent_at, c.name as campaign 
       FROM sent_emails se 
       JOIN campaigns c ON se.campaign_id = c.id 
       WHERE c.user_id = $1 
       ORDER BY se.sent_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      debug: {
        userId,
        totalCampaigns: parseInt(campaigns.rows[0].count),
        totalContacts: parseInt(contacts.rows[0].count),
        totalSentEmails: parseInt(sentEmails.rows[0].count),
        recentEmails: recentEmails.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
