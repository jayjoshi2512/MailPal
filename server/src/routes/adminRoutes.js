import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { sendAdminCode } from '../services/emailService.js';
import { User, Campaign, SentEmail, Template, Contact } from '../models/index.js';

const router = express.Router();

// In-memory storage for admin codes (secure - no DB needed)
// Format: { code: string, email: string, expiresAt: Date, attempts: number }
const adminCodes = new Map();

// Admin email - hardcoded for security (cannot be changed via API)
const ADMIN_EMAIL = 'joshijayc075@gmail.com';

// Constants
const CODE_LENGTH = 15;
const CODE_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MINUTES = 0.5;

// Rate limiting for code requests
let lastCodeRequestTime = 0;

/**
 * Generate random alphanumeric code
 */
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?';
    let code = '';
    const randomBytes = crypto.randomBytes(CODE_LENGTH);
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += chars[randomBytes[i] % chars.length];
    }
    return code;
};

/**
 * Clean up expired codes
 */
const cleanupExpiredCodes = () => {
    const now = Date.now();
    for (const [key, value] of adminCodes.entries()) {
        if (value.expiresAt < now) {
            adminCodes.delete(key);
        }
    }
};

/**
 * POST /api/admin/send-code
 * Generates and sends admin authentication code to hardcoded email
 */
router.post('/send-code', async (req, res) => {
    try {
        // Rate limiting - prevent spam
        const now = Date.now();
        const timeSinceLastRequest = now - lastCodeRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT_MINUTES * 60 * 1000) {
            const waitSeconds = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - timeSinceLastRequest) / 1000);
            return res.status(429).json({
                success: false,
                error: `Please wait ${waitSeconds} seconds before requesting a new code`,
            });
        }

        // Clean up expired codes
        cleanupExpiredCodes();

        // Generate new code
        const code = generateCode();
        const expiresAt = now + CODE_EXPIRY_MINUTES * 60 * 1000;

        // Store code (only one active code at a time)
        adminCodes.clear();
        adminCodes.set(code, {
            email: ADMIN_EMAIL,
            expiresAt,
            attempts: 0,
            createdAt: now,
        });

        // Update rate limit timestamp
        lastCodeRequestTime = now;

        // Send code via email
        try {
            await sendAdminCode(ADMIN_EMAIL, code);
            console.log(`🔐 Admin code sent to ${ADMIN_EMAIL}`);
        } catch (emailError) {
            console.error('❌ Failed to send admin code email:', emailError);
            adminCodes.delete(code);
            return res.status(500).json({
                success: false,
                error: 'Failed to send verification code. Please try again.',
            });
        }

        res.json({
            success: true,
            message: 'Verification code sent to admin email',
            data: {
                expiresIn: CODE_EXPIRY_MINUTES * 60, // seconds
                maskedEmail: ADMIN_EMAIL.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            },
        });
    } catch (error) {
        console.error('❌ Error sending admin code:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * POST /api/admin/verify-code
 * Verifies admin authentication code and returns JWT
 */
router.post('/verify-code', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Verification code is required',
            });
        }

        // Clean up expired codes
        cleanupExpiredCodes();

        // Check if code exists
        const storedData = adminCodes.get(code);

        if (!storedData) {
            // Check if any code exists and increment attempts
            for (const [key, value] of adminCodes.entries()) {
                value.attempts++;
                if (value.attempts >= MAX_ATTEMPTS) {
                    adminCodes.delete(key);
                    return res.status(401).json({
                        success: false,
                        error: 'Too many failed attempts. Please request a new code.',
                    });
                }
            }
            
            return res.status(401).json({
                success: false,
                error: 'Invalid verification code',
            });
        }

        // Check expiry
        if (storedData.expiresAt < Date.now()) {
            adminCodes.delete(code);
            return res.status(401).json({
                success: false,
                error: 'Verification code has expired. Please request a new one.',
            });
        }

        // Code is valid - delete it (one-time use)
        adminCodes.delete(code);

        // Generate admin JWT token (24 hour expiry)
        const adminToken = jwt.sign(
            {
                role: 'admin',
                email: ADMIN_EMAIL,
                iat: Math.floor(Date.now() / 1000),
            },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        console.log(`✅ Admin authenticated successfully`);

        res.json({
            success: true,
            message: 'Admin authenticated successfully',
            data: {
                token: adminToken,
                expiresIn: 24 * 60 * 60, // 24 hours in seconds
            },
        });
    } catch (error) {
        console.error('❌ Error verifying admin code:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * Middleware to verify admin token
 */
const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Admin authentication required',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret);

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access denied',
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Admin session expired. Please login again.',
            });
        }
        return res.status(401).json({
            success: false,
            error: 'Invalid admin token',
        });
    }
};

/**
 * GET /api/admin/dashboard
 * Returns all admin dashboard data (protected)
 */
router.get('/dashboard', verifyAdminToken, async (req, res) => {
    try {
        // Get all users
        const users = await User.find()
            .select('email name profilePicture createdAt updatedAt')
            .sort({ createdAt: -1 });

        // Get total counts
        const [totalUsers, totalCampaigns, totalEmailsSent, totalTemplates, totalContacts] = await Promise.all([
            User.countDocuments(),
            Campaign.countDocuments(),
            SentEmail.countDocuments(),
            Template.countDocuments(),
            Contact.countDocuments()
        ]);

        const stats = {
            total_users: totalUsers,
            total_campaigns: totalCampaigns,
            total_emails_sent: totalEmailsSent,
            total_templates: totalTemplates,
            total_contacts: totalContacts
        };

        // Get campaigns with details
        const campaigns = await Campaign.find()
            .populate('userId', 'email name')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Add email count to each campaign
        const campaignsWithCounts = await Promise.all(
            campaigns.map(async (campaign) => {
                const emailsSent = await SentEmail.countDocuments({ campaignId: campaign._id });
                return {
                    id: campaign._id,
                    name: campaign.name,
                    subject: campaign.subject,
                    status: campaign.status,
                    created_at: campaign.createdAt,
                    user_email: campaign.userId?.email,
                    user_name: campaign.userId?.name,
                    emails_sent: emailsSent
                };
            })
        );

        // Get recent activity (sent emails)
        const recentEmails = await SentEmail.find()
            .populate('campaignId', 'name')
            .populate('userId', 'email')
            .sort({ sentAt: -1 })
            .limit(100)
            .lean();

        const recentEmailsFormatted = recentEmails.map(email => ({
            id: email._id,
            recipient_email: email.recipientEmail,
            subject: email.subject,
            sent_at: email.sentAt,
            campaign_name: email.campaignId?.name,
            user_email: email.userId?.email
        }));

        // Get emails by day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const emailsByDay = await SentEmail.aggregate([
            { $match: { sentAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } }
        ]);

        // Get users by day (last 30 days)
        const usersByDay = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } }
        ]);

        // Get top users by emails sent
        const topUsers = await SentEmail.aggregate([
            {
                $group: {
                    _id: '$userId',
                    emails_sent: { $sum: 1 }
                }
            },
            { $sort: { emails_sent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'campaigns',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'campaigns'
                }
            },
            {
                $project: {
                    id: '$user._id',
                    email: '$user.email',
                    name: '$user.name',
                    picture: '$user.profilePicture',
                    emails_sent: 1,
                    campaigns_count: { $size: '$campaigns' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                stats,
                users: users.map(u => ({
                    id: u._id,
                    email: u.email,
                    name: u.name,
                    picture: u.profilePicture,
                    created_at: u.createdAt,
                    updated_at: u.updatedAt
                })),
                campaigns: campaignsWithCounts,
                recentEmails: recentEmailsFormatted,
                emailsByDay,
                usersByDay,
                topUsers,
            },
        });
    } catch (error) {
        console.error('❌ Error fetching admin dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data',
        });
    }
});

/**
 * GET /api/admin/verify
 * Verify if admin token is still valid
 */
router.get('/verify', verifyAdminToken, (req, res) => {
    res.json({
        success: true,
        data: {
            email: req.admin.email,
            role: req.admin.role,
        },
    });
});

export default router;
