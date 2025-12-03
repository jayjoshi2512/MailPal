import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import config from '../config/index.js';
import { sendAdminCode } from '../services/emailService.js';

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
        // Get all users (using only columns that exist in the schema)
        const usersResult = await query(`
            SELECT 
                id, email, name, profile_picture as picture, created_at, updated_at
            FROM users 
            ORDER BY created_at DESC
        `);

        // Get total counts
        const statsResult = await query(`
            SELECT
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM campaigns) as total_campaigns,
                (SELECT COUNT(*) FROM sent_emails) as total_emails_sent,
                (SELECT COUNT(*) FROM templates) as total_templates,
                (SELECT COUNT(*) FROM contacts) as total_contacts
        `);

        // Get campaigns with details
        const campaignsResult = await query(`
            SELECT 
                c.id, c.name, c.subject, c.status, c.created_at,
                u.email as user_email, u.name as user_name,
                (SELECT COUNT(*) FROM sent_emails se WHERE se.campaign_id = c.id) as emails_sent
            FROM campaigns c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
            LIMIT 50
        `);

        // Get recent activity (sent emails)
        const recentEmailsResult = await query(`
            SELECT 
                se.id, se.recipient_email, se.subject, se.sent_at,
                c.name as campaign_name,
                u.email as user_email
            FROM sent_emails se
            LEFT JOIN campaigns c ON se.campaign_id = c.id
            LEFT JOIN users u ON se.user_id = u.id
            ORDER BY se.sent_at DESC
            LIMIT 100
        `);

        // Get emails by day (last 30 days)
        const emailsByDayResult = await query(`
            SELECT 
                DATE(sent_at) as date,
                COUNT(*) as count
            FROM sent_emails
            WHERE sent_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(sent_at)
            ORDER BY date DESC
        `);

        // Get users by day (last 30 days)
        const usersByDayResult = await query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        // Get top users by emails sent
        const topUsersResult = await query(`
            SELECT 
                u.id, u.email, u.name, u.profile_picture as picture,
                COUNT(se.id) as emails_sent,
                COUNT(DISTINCT c.id) as campaigns_count
            FROM users u
            LEFT JOIN sent_emails se ON u.id = se.user_id
            LEFT JOIN campaigns c ON u.id = c.user_id
            GROUP BY u.id, u.email, u.name, u.profile_picture
            ORDER BY emails_sent DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                stats: statsResult.rows[0],
                users: usersResult.rows,
                campaigns: campaignsResult.rows,
                recentEmails: recentEmailsResult.rows,
                emailsByDay: emailsByDayResult.rows,
                usersByDay: usersByDayResult.rows,
                topUsers: topUsersResult.rows,
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
