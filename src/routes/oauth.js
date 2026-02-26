const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { limiter } = require('../middleware/rateLimiter');
const pool = require('../config/database');

/*
|---------------------------------------------------------------------------
| Google OAuth Routes
|---------------------------------------------------------------------------
*/

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth Callback
router.post('/google/callback', limiter, async (req, res) => {
  try {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      if (err || !user) {
        console.error('Google OAuth error:', err);
        return res.status(400).json({ error: 'Google authentication failed' });
      }

      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      res.status(200).json({
        message: 'Logged in successfully via Google',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          flames: user.flames,
          level: user.level,
          streak_days: user.streak_days,
          badges: user.badges,
          bio: user.bio,
          avatar_url: user.avatar_url,
          followers_count: user.followers_count,
          following_count: user.following_count,
          posts_count: user.posts_count,
          provider: user.provider,
          is_verified: user.is_verified
        }
      });
    })(req, res);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

/*
|---------------------------------------------------------------------------
| Facebook OAuth Routes
|---------------------------------------------------------------------------
*/

// Initiate Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

// Facebook OAuth Callback
router.post('/facebook/callback', limiter, async (req, res) => {
  try {
    passport.authenticate('facebook', { session: false }, async (err, user, info) => {
      if (err || !user) {
        console.error('Facebook OAuth error:', err);
        return res.status(400).json({ error: 'Facebook authentication failed' });
      }

      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      res.status(200).json({
        message: 'Logged in successfully via Facebook',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          flames: user.flames,
          level: user.level,
          streak_days: user.streak_days,
          badges: user.badges,
          bio: user.bio,
          avatar_url: user.avatar_url,
          followers_count: user.followers_count,
          following_count: user.following_count,
          posts_count: user.posts_count,
          provider: user.provider,
          is_verified: user.is_verified
        }
      });
    })(req, res);
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    res.status(500).json({ error: 'Server error during Facebook authentication' });
  }
});

/*
|---------------------------------------------------------------------------
| Apple OAuth Routes
|---------------------------------------------------------------------------
*/

// Initiate Apple OAuth
router.get('/apple', passport.authenticate('apple', {
  scope: ['email', 'name']
}));

// Apple OAuth Callback
router.post('/apple/callback', limiter, async (req, res) => {
  try {
    passport.authenticate('apple', { session: false }, async (err, user, info) => {
      if (err || !user) {
        console.error('Apple OAuth error:', err);
        return res.status(400).json({ error: 'Apple authentication failed' });
      }

      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      res.status(200).json({
        message: 'Logged in successfully via Apple',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          flames: user.flames,
          level: user.level,
          streak_days: user.streak_days,
          badges: user.badges,
          bio: user.bio,
          avatar_url: user.avatar_url,
          followers_count: user.followers_count,
          following_count: user.following_count,
          posts_count: user.posts_count,
          provider: user.provider,
          is_verified: user.is_verified
        }
      });
    })(req, res);
  } catch (error) {
    console.error('Apple OAuth callback error:', error);
    res.status(500).json({ error: 'Server error during Apple authentication' });
  }
});

/*
|---------------------------------------------------------------------------
| Link OAuth Provider to Existing Account
|---------------------------------------------------------------------------
*/

const { authenticateToken } = require('../middleware/auth');

router.post('/link-provider', authenticateToken, limiter, async (req, res) => {
  const { provider, providerUserId, accessToken, refreshToken, email } = req.body;
  const userId = req.user.user_id;

  if (!provider || !providerUserId || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const validProviders = ['google', 'facebook', 'apple'];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if provider is already linked to any user
    const [existingLinks] = await conn.query(
      'SELECT user_id FROM oauth_providers WHERE provider = ? AND provider_user_id = ?',
      [provider, providerUserId]
    );

    if (existingLinks.length > 0) {
      conn.release();
      if (existingLinks[0].user_id === userId) {
        return res.status(400).json({ error: 'Provider already linked to this account.' });
      } else {
        return res.status(400).json({ error: 'Provider already linked to another account.' });
      }
    }

    // Check if this user already has this provider linked
    const [userProviders] = await conn.query(
      'SELECT id FROM oauth_providers WHERE user_id = ? AND provider = ?',
      [userId, provider]
    );

    if (userProviders.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'This provider is already linked to your account.' });
    }

    // Link provider to user
    await conn.query(
      'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, provider, providerUserId, email, accessToken, refreshToken]
    );

    // Update user provider if it was email
    if (provider !== 'email') {
      await conn.query('UPDATE users SET provider = ? WHERE id = ?', [provider, userId]);
    }

    conn.release();
    res.status(200).json({ message: 'Provider linked successfully.' });
  } catch (err) {
    console.error('Error linking provider:', err);
    res.status(500).json({ error: 'Failed to link provider.' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
