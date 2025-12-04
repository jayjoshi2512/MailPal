import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import 'express-async-errors';

import config from './config/index.js';
import logger from './config/logger.js';
import { testConnection } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { cleanupOldTempFiles } from './middleware/upload.js';

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));

app.use(
    cors({
        origin: config.clientUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Rate limiting
app.use('/api', apiLimiter);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to MailPal API',
        version: '1.0.0',
        docs: '/api/health',
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            throw new Error('Failed to connect to database');
        }

        // Start listening
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📝 Environment: ${config.nodeEnv}`);
            logger.info(`🌐 Client URL: ${config.clientUrl}`);
            logger.info(`💾 Database: ${config.database.name}`);
            
            // Start temp file cleanup scheduler (every 30 minutes)
            // Cleans up orphaned attachment files older than 1 hour
            setInterval(() => {
                const result = cleanupOldTempFiles(60 * 60 * 1000); // 1 hour max age
                if (result.deleted > 0) {
                    logger.info(`🧹 Temp cleanup: ${result.deleted} old file(s) removed`);
                }
            }, 30 * 60 * 1000); // Run every 30 minutes
            
            // Run initial cleanup on startup
            const initialCleanup = cleanupOldTempFiles(60 * 60 * 1000);
            if (initialCleanup.deleted > 0) {
                logger.info(`🧹 Initial cleanup: ${initialCleanup.deleted} old file(s) removed`);
            }
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

export default app;
