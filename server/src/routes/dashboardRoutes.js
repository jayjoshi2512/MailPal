import express from 'express';
import { getDashboardStats, getResponseRate } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { Campaign, Contact, SentEmail } from '../models/index.js';

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
    
    const [campaignsCount, contactsCount] = await Promise.all([
      Campaign.countDocuments({ userId }),
      Contact.countDocuments({ userId })
    ]);

    // Get user's campaign IDs for sent emails count
    const userCampaigns = await Campaign.find({ userId }).select('_id');
    const campaignIds = userCampaigns.map(c => c._id);
    
    const sentEmailsCount = await SentEmail.countDocuments({ 
      campaignId: { $in: campaignIds } 
    });

    const recentEmails = await SentEmail.find({ campaignId: { $in: campaignIds } })
      .populate('campaignId', 'name')
      .sort({ sentAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      debug: {
        userId,
        totalCampaigns: campaignsCount,
        totalContacts: contactsCount,
        totalSentEmails: sentEmailsCount,
        recentEmails: recentEmails.map(e => ({
          id: e._id,
          subject: e.subject,
          sent_at: e.sentAt,
          campaign: e.campaignId?.name
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
