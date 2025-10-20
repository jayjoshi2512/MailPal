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
 */
export const getGoogleAuthUrl = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.json({
    success: true,
    data: { authUrl: url },
  });
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
      console.log('✅ New user created:', { id: user.id, email: user.email });
    } else {
      // Update existing user
      console.log('🔄 Updating existing user...');
      result = await query(
        `UPDATE users 
         SET access_token = $1, token_expires_at = $2, refresh_token = $3, updated_at = NOW()
         WHERE google_id = $4
         RETURNING id, google_id, email, name, profile_picture, created_at`,
        [tokens.access_token, new Date(tokens.expiry_date), tokens.refresh_token || result.rows[0].refresh_token, userInfo.id]
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
