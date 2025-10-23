import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import config from '../config/index.js';

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
    // Frontend sends 'isReturningUser' flag from localStorage (JWT token exists)
    const { isReturningUser, reconnect } = req.query;
    
    // Smart prompt selection:
    // - 'consent': First time user OR explicit reconnect (gets refresh_token)
    // - undefined: Returning user with valid token (instant login, reuses refresh_token)
    let prompt;
    
    if (reconnect === 'true') {
      // Force consent to get new refresh_token
      prompt = 'consent';
      console.log('🔄 Reconnect requested - forcing consent');
    } else if (isReturningUser === 'true') {
      // Returning user - no prompt needed (instant login)
      prompt = undefined;
      console.log('👋 Returning user - instant login');
    } else {
      // First time user - force consent to get refresh_token
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
    // Fallback to consent on error (safer - ensures we get refresh_token)
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
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
    let result = await query('SELECT * FROM users WHERE google_id = $1', [
      userInfo.id,
    ]);

    let user;
    if (result.rows.length === 0) {
      // Create new user
      console.log('👤 Creating new user in database...');
      
      // CRITICAL: New users MUST have refresh_token
      if (!tokens.refresh_token) {
        console.error('❌ CRITICAL: New user but no refresh_token received!');
        console.error('❌ This means prompt was not set to consent');
        return res.redirect(`${config.clientUrl}/auth/callback?error=no_refresh_token&message=Please revoke app access and reconnect`);
      }
      
      result = await query(
        `INSERT INTO users (google_id, email, name, profile_picture, refresh_token, access_token, token_expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, google_id, email, name, profile_picture, created_at`,
        [
          userInfo.id,
          userInfo.email,
          userInfo.name,
          userInfo.picture,
          tokens.refresh_token,
          tokens.access_token,
          new Date(tokens.expiry_date),
        ]
      );
      user = result.rows[0];
      console.log('✅ New user created:', { id: user.id, email: user.email, hasRefreshToken: true });
    } else {
      // Update existing user
      console.log('🔄 Updating existing user...');
      
      // Keep the existing refresh_token if Google didn't send a new one
      // (Google only sends refresh_token on first authorization or if explicitly revoked)
      const refreshTokenToStore = tokens.refresh_token || result.rows[0].refresh_token;
      
      console.log('🔐 Refresh token status:', {
        hasNewRefreshToken: !!tokens.refresh_token,
        hasExistingRefreshToken: !!result.rows[0].refresh_token,
        willStore: !!refreshTokenToStore
      });
      
      // CRITICAL: Warn if no refresh_token available
      if (!refreshTokenToStore) {
        console.error('⚠️  WARNING: No refresh_token available! User will need to reconnect frequently.');
        console.error('⚠️  To fix: User must revoke app access and reconnect with prompt=consent');
      }
      
      result = await query(
        `UPDATE users 
         SET access_token = $1, token_expires_at = $2, refresh_token = $3, updated_at = NOW()
         WHERE google_id = $4
         RETURNING id, google_id, email, name, profile_picture, created_at`,
        [tokens.access_token, new Date(tokens.expiry_date), refreshTokenToStore, userInfo.id]
      );
      user = result.rows[0];
      console.log('✅ User updated:', { id: user.id, email: user.email });
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    console.log('✅ JWT token generated, redirecting to client...');
    // Redirect to client with token
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
  // In a stateless JWT system, logout is handled client-side
  // But we can revoke tokens if needed
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's refresh token
    const result = await query(
      'SELECT refresh_token FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { refresh_token } = result.rows[0];

    // Use refresh token to get new access token
    oauth2Client.setCredentials({ refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update access token in database
    await query(
      'UPDATE users SET access_token = $1, token_expires_at = $2 WHERE id = $3',
      [credentials.access_token, new Date(credentials.expiry_date), userId]
    );

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
 * This ensures users never have to reconnect manually
 */
export const getValidOAuth2Client = async (userId) => {
  try {
    // Get user's tokens from database
    const result = await query(
      'SELECT access_token, refresh_token, token_expires_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const { access_token, refresh_token, token_expires_at } = result.rows[0];

    if (!refresh_token) {
      throw new Error('No refresh token available. User needs to reconnect.');
    }

    // Create new OAuth2 client instance for this user
    const userOAuth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    // Check if token is expired or about to expire (within 5 minutes)
    const expiryTime = new Date(token_expires_at).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiryTime - now < fiveMinutes) {
      // Token expired or about to expire - refresh it automatically
      console.log('🔄 Access token expired for user', userId, '- refreshing...');
      
      userOAuth2Client.setCredentials({ refresh_token });
      const { credentials } = await userOAuth2Client.refreshAccessToken();

      // Update database with new access token
      await query(
        'UPDATE users SET access_token = $1, token_expires_at = $2 WHERE id = $3',
        [credentials.access_token, new Date(credentials.expiry_date), userId]
      );

      console.log('✅ Token refreshed automatically for user', userId);
      
      // Set the new credentials
      userOAuth2Client.setCredentials(credentials);
    } else {
      // Token still valid - use it
      userOAuth2Client.setCredentials({
        access_token,
        refresh_token,
        expiry_date: expiryTime,
      });
    }

    return userOAuth2Client;
  } catch (error) {
    console.error('❌ Error getting valid OAuth2 client:', error);
    throw error;
  }
};
