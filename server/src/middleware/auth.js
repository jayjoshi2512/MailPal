import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { query } from '../config/database.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Get user from database
        const result = await query(
            'SELECT id, google_id, email, name, profile_picture FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'User not found',
            });
        }

        // Attach user to request object
        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Token expired',
            });
        }

        next(error);
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret);

        const result = await query(
            'SELECT id, google_id, email, name, profile_picture FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length > 0) {
            req.user = result.rows[0];
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};
