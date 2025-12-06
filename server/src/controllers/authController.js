import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import config from '../config/index.js';
import User from '../models/User.js';

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

/**
 * Get Google OAuth URL
 * Smart prompt: forces consent for first-time users, instant for returning users
 */
export const getGoogleAuthUrl = async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ];

    // Check if this is first connection or returning user
    const { isReturningUser, reconnect } = req.query;
    
    let prompt;
    
    if (reconnect === 'true') {
      prompt = 'consent';
      console.log('🔄 Reconnect requested - forcing consent');
    } else if (isReturningUser === 'true') {
      prompt = undefined;
      console.log('👋 Returning user - instant login');
    } else {
      prompt = 'consent';
      console.log('🆕 First time user - forcing consent to get refresh_token');
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: prompt,
    });

    console.log(`🔑 Generated OAuth URL with prompt: ${prompt || 'auto (undefined)'}`);

    res.json({
      success: true,
      data: { authUrl: url },
    });
  } catch (error) {
    console.error('❌ Error generating OAuth URL:', error);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      prompt: 'consent',
    });

    res.json({
      success: true,
      data: { authUrl: url },
    });
  }
};

/**
 * Handle Google OAuth callback
 */
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    console.log('📧 OAuth Callback - Received code:', code ? 'Yes' : 'No');

    if (!code) {
      console.error('❌ OAuth Callback - No authorization code');
      return res.redirect(`${config.clientUrl}/auth/callback?error=no_code`);
    }

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('✅ Tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });

    // Get user info from Google
    console.log('👤 Fetching user info from Google...');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log('✅ User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
    });

    // Check if user exists
    let user = await User.findOne({ googleId: userInfo.id });

    if (!user) {
      // Create new user
      console.log('👤 Creating new user in database...');
      
      if (!tokens.refresh_token) {
        console.error('❌ CRITICAL: New user but no refresh_token received!');
        return res.redirect(`${config.clientUrl}/auth/callback?error=no_refresh_token&message=Please revoke app access and reconnect`);
      }
      
      user = await User.create({
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        tokenExpiresAt: new Date(tokens.expiry_date),
        isActive: true,
      });
      
      console.log('✅ New user created:', { id: user._id, email: user.email, hasRefreshToken: true });
    } else if (!user.isActive) {
      // User was soft-deleted - create a fresh account by clearing old data
      console.log('🔄 Reactivating soft-deleted user and clearing old data...');
      
      const refreshTokenToStore = tokens.refresh_token || user.refreshToken;
      
      if (!refreshTokenToStore) {
        console.error('⚠️  WARNING: No refresh_token available!');
      }

      // Import models for cleanup
      const { default: Campaign } = await import('../models/Campaign.js');
      const { default: Contact } = await import('../models/Contact.js');
      const { default: SentEmail } = await import('../models/SentEmail.js');
      const { default: Template } = await import('../models/Template.js');
      const { default: CampaignContact } = await import('../models/CampaignContact.js');
      
      // Clear all old user data for fresh start
      const userId = user._id;
      await Promise.all([
        Campaign.deleteMany({ userId }),
        Contact.deleteMany({ userId }),
        SentEmail.deleteMany({ userId }),
        Template.deleteMany({ userId, isDefault: { $ne: true } }),
        CampaignContact.deleteMany({ campaignId: { $in: await Campaign.find({ userId }).distinct('_id') } })
      ]);
      
      console.log('🗑️  Cleared old data for reactivated user');
      
      // Reactivate user with fresh state
      user = await User.findByIdAndUpdate(
        user._id,
        {
          accessToken: tokens.access_token,
          tokenExpiresAt: new Date(tokens.expiry_date),
          refreshToken: refreshTokenToStore,
          lastLogin: new Date(),
          isActive: true,
          name: userInfo.name,
          profilePicture: userInfo.picture,
        },
        { new: true }
      );
      
      console.log('✅ User reactivated with fresh data:', { id: user._id, email: user.email });
    } else {
      // Update existing active user
      console.log('🔄 Updating existing user...');
      
      const refreshTokenToStore = tokens.refresh_token || user.refreshToken;
      
      console.log('🔐 Refresh token status:', {
        hasNewRefreshToken: !!tokens.refresh_token,
        hasExistingRefreshToken: !!user.refreshToken,
        willStore: !!refreshTokenToStore
      });
      
      if (!refreshTokenToStore) {
        console.error('⚠️  WARNING: No refresh_token available!');
      }
      
      user = await User.findByIdAndUpdate(
        user._id,
        {
          accessToken: tokens.access_token,
          tokenExpiresAt: new Date(tokens.expiry_date),
          refreshToken: refreshTokenToStore,
          lastLogin: new Date()
        },
        { new: true }
      );
      
      console.log('✅ User updated:', { id: user._id, email: user.email });
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    console.log('✅ JWT token generated, redirecting to client...');
    res.redirect(`${config.clientUrl}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    res.redirect(`${config.clientUrl}/auth/callback?error=auth_failed`);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Delete user account (soft delete)
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { refreshToken: refresh_token } = user;

    oauth2Client.setCredentials({ refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();

    await User.findByIdAndUpdate(userId, {
      accessToken: credentials.access_token,
      tokenExpiresAt: new Date(credentials.expiry_date)
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
};

/**
 * Helper: Get valid OAuth2 client for user (auto-refreshes if needed)
 */
export const getValidOAuth2Client = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.refreshToken) {
      throw new Error('No refresh token available. User needs to reconnect.');
    }

    const userOAuth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    const expiryTime = user.tokenExpiresAt ? new Date(user.tokenExpiresAt).getTime() : 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiryTime - now < fiveMinutes) {
      console.log('🔄 Access token expired for user', userId, '- refreshing...');
      
      userOAuth2Client.setCredentials({ refresh_token: user.refreshToken });
      const { credentials } = await userOAuth2Client.refreshAccessToken();

      await User.findByIdAndUpdate(userId, {
        accessToken: credentials.access_token,
        tokenExpiresAt: new Date(credentials.expiry_date)
      });

      console.log('✅ Token refreshed automatically for user', userId);
      
      userOAuth2Client.setCredentials(credentials);
    } else {
      userOAuth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: expiryTime,
      });
    }

    return userOAuth2Client;
  } catch (error) {
    console.error('❌ Error getting valid OAuth2 client:', error);
    throw error;
  }
};
