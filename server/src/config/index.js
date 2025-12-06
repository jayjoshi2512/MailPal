import dotenv from 'dotenv';

dotenv.config();

export default {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mailpal',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },

  // Email Configuration
  email: {
    senderName: process.env.EMAIL_SENDER_NAME || 'MailPal',
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET,
  },

  // Cron Jobs Configuration
  cronJobs: {
    enableEmailQueueProcessor: process.env.ENABLE_EMAIL_QUEUE_PROCESSOR === 'true',
    enableAnalyticsUpdater: process.env.ENABLE_ANALYTICS_UPDATER === 'true',
  },
};
