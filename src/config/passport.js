const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const pool = require('./database');

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await pool.query('SELECT id, username, email, role, flames, level, streak_days, badges, bio, avatar_url, followers_count, following_count, posts_count, provider, is_verified FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const provider = 'google';
        const providerUserId = profile.id;

        // Check if OAuth provider exists
        let conn;
        try {
          conn = await pool.getConnection();

          // Check if user exists with this OAuth provider
          const [existingProviders] = await conn.query(
            'SELECT user_id FROM oauth_providers WHERE provider = ? AND provider_user_id = ?',
            [provider, providerUserId]
          );

          if (existingProviders.length > 0) {
            // User exists, return user
            const [user] = await conn.query('SELECT * FROM users WHERE id = ?', [existingProviders[0].user_id]);
            conn.release();
            return done(null, user);
          }

          // Check if user exists with same email
          const [existingUsers] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);

          if (existingUsers.length > 0) {
            // Link OAuth provider to existing user
            await conn.query(
              'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
              [existingUsers[0].id, provider, providerUserId, email, accessToken, refreshToken]
            );
            conn.release();
            return done(null, existingUsers[0]);
          }

          // Create new user
          const username = profile.displayName?.split(' ')[0] || profile.name?.givenName || 'user';
          let finalUsername = username;
          let counter = 1;

          // Ensure unique username
          while (true) {
            const [existing] = await conn.query('SELECT id FROM users WHERE username = ?', [finalUsername]);
            if (existing.length === 0) break;
            finalUsername = `${username}${counter}`;
            counter++;
          }

          const result = await conn.query(
            'INSERT INTO users (username, email, password_hash, provider, is_verified) VALUES (?, ?, ?, ?, ?)',
            [finalUsername, email, 'OAUTH_USER', provider, 1]
          );

          const userId = Number(result.insertId);

          // Create OAuth provider record
          await conn.query(
            'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
            [userId, provider, providerUserId, email, accessToken, refreshToken]
          );

          conn.release();
          return done(null, { id: userId, username: finalUsername, email, role: 'user' });
        } catch (error) {
          if (conn) conn.release();
          return done(error, null);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const provider = 'facebook';
        const providerUserId = profile.id;

        let conn;
        try {
          conn = await pool.getConnection();

          const [existingProviders] = await conn.query(
            'SELECT user_id FROM oauth_providers WHERE provider = ? AND provider_user_id = ?',
            [provider, providerUserId]
          );

          if (existingProviders.length > 0) {
            const [user] = await conn.query('SELECT * FROM users WHERE id = ?', [existingProviders[0].user_id]);
            conn.release();
            return done(null, user);
          }

          const [existingUsers] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);

          if (existingUsers.length > 0) {
            await conn.query(
              'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
              [existingUsers[0].id, provider, providerUserId, email, accessToken, refreshToken]
            );
            conn.release();
            return done(null, existingUsers[0]);
          }

          const username = profile.displayName?.split(' ')[0] || profile.name?.givenName || 'user';
          let finalUsername = username;
          let counter = 1;

          while (true) {
            const [existing] = await conn.query('SELECT id FROM users WHERE username = ?', [finalUsername]);
            if (existing.length === 0) break;
            finalUsername = `${username}${counter}`;
            counter++;
          }

          const result = await conn.query(
            'INSERT INTO users (username, email, password_hash, provider, is_verified) VALUES (?, ?, ?, ?, ?)',
            [finalUsername, email, 'OAUTH_USER', provider, 1]
          );

          const userId = Number(result.insertId);

          await conn.query(
            'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
            [userId, provider, providerUserId, email, accessToken, refreshToken]
          );

          conn.release();
          return done(null, { id: userId, username: finalUsername, email, role: 'user' });
        } catch (error) {
          if (conn) conn.release();
          return done(error, null);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Apple OAuth Strategy
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
      callbackURL: process.env.APPLE_REDIRECT_URI || 'http://localhost:3000/api/auth/apple/callback',
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const provider = 'apple';
        const providerUserId = profile.sub || profile.id;

        let conn;
        try {
          conn = await pool.getConnection();

          const [existingProviders] = await conn.query(
            'SELECT user_id FROM oauth_providers WHERE provider = ? AND provider_user_id = ?',
            [provider, providerUserId]
          );

          if (existingProviders.length > 0) {
            const [user] = await conn.query('SELECT * FROM users WHERE id = ?', [existingProviders[0].user_id]);
            conn.release();
            return done(null, user);
          }

          // Apple doesn't always provide email, handle accordingly
          const email = profile.email;

          if (email) {
            const [existingUsers] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);

            if (existingUsers.length > 0) {
              await conn.query(
                'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
                [existingUsers[0].id, provider, providerUserId, email, accessToken, refreshToken]
              );
              conn.release();
              return done(null, existingUsers[0]);
            }
          }

          const username = profile.displayName?.split(' ')[0] || 'user';
          let finalUsername = username;
          let counter = 1;

          while (true) {
            const [existing] = await conn.query('SELECT id FROM users WHERE username = ?', [finalUsername]);
            if (existing.length === 0) break;
            finalUsername = `${username}${counter}`;
            counter++;
          }

          const result = await conn.query(
            'INSERT INTO users (username, email, password_hash, provider, is_verified) VALUES (?, ?, ?, ?, ?)',
            [finalUsername, email || null, 'OAUTH_USER', provider, 1]
          );

          const userId = Number(result.insertId);

          await conn.query(
            'INSERT INTO oauth_providers (user_id, provider, provider_user_id, provider_email, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)',
            [userId, provider, providerUserId, email, accessToken, refreshToken]
          );

          conn.release();
          return done(null, { id: userId, username: finalUsername, email, role: 'user' });
        } catch (error) {
          if (conn) conn.release();
          return done(error, null);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;