const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { limiter } = require('../middleware/rateLimiter');
const pool = require('../config/database');
const { awardPostFlames, awardEngagementFlames, updatePostCounts, updateUserSocialStats, createNotification } = require('../utils/socialGamification');

/*
|===========================================================================
| POSTS ENDPOINTS
|===========================================================================
*/

/**
 * Create a new post
 * POST /api/posts
 */
router.post('/posts', authenticateToken, limiter, async (req, res) => {
  const { content, post_type, recipe_id, recipe_data, photo_url } = req.body;
  const userId = req.user.user_id;

  if (!content && post_type !== 'recipe_with_photo') {
    return res.status(400).json({ error: 'Content is required for non-recipe posts.' });
  }

  if (!post_type || !['text', 'recipe', 'photo', 'recipe_with_photo'].includes(post_type)) {
    return res.status(400).json({ error: 'Invalid post type.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Award flames for posting (limited per day)
    const flamesAwarded = await awardPostFlames(userId, post_type, conn);

    // Create post
    const result = await conn.query(
      'INSERT INTO posts (user_id, content, post_type, recipe_id, recipe_data, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, content || '', post_type, recipe_id || null, recipe_data ? JSON.stringify(recipe_data) : null, photo_url || null]
    );

    const postId = Number(result.insertId);

    // Update user posts count
    await conn.query('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?', [userId]);

    conn.release();

    res.status(201).json({
      message: 'Post created successfully.',
      post_id: postId,
      flames_awarded: flamesAwarded,
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Get global feed (paginated)
 * GET /api/posts?page=1&limit=20
 */
router.get('/posts', limiter, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [posts] = await conn.query(`
      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    conn.release();

    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

/**
 * Get single post by ID
 * GET /api/posts/:id
 */
router.get('/posts/:id', limiter, async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();

    const [posts] = await conn.query(`
      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (posts.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Post not found.' });
    }

    conn.release();
    res.status(200).json({ post: posts[0] });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
});

/**
 * Delete own post
 * DELETE /api/posts/:id
 */
router.delete('/posts/:id', authenticateToken, limiter, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    // Check if post belongs to user
    const [posts] = await conn.query('SELECT user_id FROM posts WHERE id = ?', [id]);

    if (posts.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (posts[0].user_id !== userId) {
      conn.release();
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    // Delete post (cascade will delete likes and comments)
    await conn.query('DELETE FROM posts WHERE id = ?', [id]);

    // Update user posts count
    await conn.query('UPDATE users SET posts_count = posts_count - 1 WHERE id = ?', [userId]);

    conn.release();
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Get posts by user
 * GET /api/users/:userId/posts?page=1&limit=20
 */
router.get('/users/:userId/posts', limiter, async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [posts] = await conn.query(`
      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, limit, offset]);

    conn.release();
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ error: 'Failed to fetch user posts.' });
  }
});

/**
 * Get posts for a specific recipe
 * GET /api/posts/recipe/:recipeId
 */
router.get('/posts/recipe/:recipeId', limiter, async (req, res) => {
  const { recipeId } = req.params;

  try {
    const conn = await pool.getConnection();

    const [posts] = await conn.query(`
      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.recipe_id = ?
      ORDER BY p.created_at DESC
    `, [recipeId]);

    conn.release();
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching recipe posts:', err);
    res.status(500).json({ error: 'Failed to fetch recipe posts.' });
  }
});

/**
 * Get trending posts
 * GET /api/posts/trending?timePeriod=today&limit=20
 */
router.get('/posts/trending', limiter, async (req, res) => {
  const { timePeriod = 'today', limit = 20 } = req.query;

  let timeCondition = '';
  if (timePeriod === 'today') {
    timeCondition = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
  } else if (timePeriod === 'week') {
    timeCondition = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
  } else if (timePeriod === 'month') {
    timeCondition = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
  }

  try {
    const conn = await pool.getConnection();

    // Trending algorithm: (likes * 1.5 + comments * 2) / hours_since_post
    const [posts] = await conn.query(`
      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified,
        (
          (p.likes_count * 1.5 + p.comments_count * 2) /
          GREATEST(1, TIMESTAMPDIFF(HOUR, p.created_at, NOW()) / 24)
        ) as trending_score
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1 ${timeCondition}
      ORDER BY trending_score DESC
      LIMIT ?
    `, [limit]);

    conn.release();
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching trending posts:', err);
    res.status(500).json({ error: 'Failed to fetch trending posts.' });
  }
});

/*
|===========================================================================
| LIKES ENDPOINTS
|===========================================================================
*/

/**
 * Like a post
 * POST /api/posts/:postId/like
 */
router.post('/posts/:postId/like', authenticateToken, limiter, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    // Check if already liked
    const [existing] = await conn.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Post already liked.' });
    }

    // Create like
    await conn.query(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );

    // Update post like count
    await updatePostCounts(postId, 'like', 1, conn);

    // Get post owner for notification
    const [posts] = await conn.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (posts.length > 0 && posts[0].user_id !== userId) {
      // Award flames to post owner
      await awardEngagementFlames(posts[0].user_id, 'like', 1, conn);
      // Create notification
      await createNotification(posts[0].user_id, 'like', userId, postId, null, conn);
    }

    conn.release();
    res.status(200).json({ message: 'Post liked successfully.' });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Unlike a post
 * DELETE /api/posts/:postId/like
 */
router.delete('/posts/:postId/like', authenticateToken, limiter, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    // Delete like
    const result = await conn.query(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (result.affectedRows > 0) {
      // Update post like count
      await updatePostCounts(postId, 'like', -1, conn);
    }

    conn.release();
    res.status(200).json({ message: 'Post unliked successfully.' });
  } catch (err) {
    console.error('Error unliking post:', err);
    res.status(500).json({ error: 'Failed to unlike post.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Get users who liked a post
 * GET /api/posts/:postId/likes?page=1&limit=20
 */
router.get('/posts/:postId/likes', limiter, async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [users] = await conn.query(`
      SELECT u.id, u.username, u.avatar_url, u.bio, u.is_verified,
        l.created_at as liked_at
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [postId, limit, offset]);

    conn.release();
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching post likes:', err);
    res.status(500).json({ error: 'Failed to fetch post likes.' });
  }
});

/*
|===========================================================================
| COMMENTS ENDPOINTS
|===========================================================================
*/

/**
 * Add comment to post
 * POST /api/posts/:postId/comments
 */
router.post('/posts/:postId/comments', authenticateToken, limiter, async (req, res) => {
  const { postId } = req.params;
  const { content, parent_comment_id } = req.body;
  const userId = req.user.user_id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }

  if (content.length > 500) {
    return res.status(400).json({ error: 'Comment too long. Maximum 500 characters.' });
  }

  try {
    const conn = await pool.getConnection();

    // Create comment
    const result = await conn.query(
      'INSERT INTO comments (user_id, post_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      [userId, postId, content, parent_comment_id || null]
    );

    // Update post comment count
    await updatePostCounts(postId, 'comment', 1, conn);

    // Get post owner for notification
    const [posts] = await conn.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (posts.length > 0 && posts[0].user_id !== userId) {
      // Award flames to post owner
      await awardEngagementFlames(posts[0].user_id, 'comment', 1, conn);
      // Create notification
      await createNotification(posts[0].user_id, 'comment', userId, postId, result.insertId, conn);
    }

    conn.release();
    res.status(201).json({ message: 'Comment added successfully.', comment_id: result.insertId });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Get comments for a post
 * GET /api/posts/:postId/comments?page=1&limit=20
 */
router.get('/posts/:postId/comments', limiter, async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [comments] = await conn.query(`
      SELECT c.*, u.username, u.avatar_url, u.is_verified
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `, [postId, limit, offset]);

    conn.release();
    res.status(200).json({ comments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

/**
 * Update own comment
 * PUT /api/comments/:id
 */
router.put('/comments/:id', authenticateToken, limiter, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.user_id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }

  if (content.length > 500) {
    return res.status(400).json({ error: 'Comment too long. Maximum 500 characters.' });
  }

  try {
    const conn = await pool.getConnection();

    // Check if comment belongs to user
    const [comments] = await conn.query('SELECT user_id FROM comments WHERE id = ?', [id]);

    if (comments.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comments[0].user_id !== userId) {
      conn.release();
      return res.status(403).json({ error: 'You can only update your own comments.' });
    }

    // Update comment
    await conn.query('UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?', [content, id]);

    conn.release();
    res.status(200).json({ message: 'Comment updated successfully.' });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Failed to update comment.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Delete own comment
 * DELETE /api/comments/:id
 */
router.delete('/comments/:id', authenticateToken, limiter, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    // Check if comment belongs to user
    const [comments] = await conn.query('SELECT user_id, post_id FROM comments WHERE id = ?', [id]);

    if (comments.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comments[0].user_id !== userId) {
      conn.release();
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    // Delete comment
    await conn.query('DELETE FROM comments WHERE id = ?', [id]);

    // Update post comment count
    await updatePostCounts(comments[0].post_id, 'comment', -1, conn);

    conn.release();
    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  } finally {
    if (conn) conn.release();
  }
});

/*
|===========================================================================
| FOLLOWS ENDPOINTS
|===========================================================================
*/

/**
 * Follow a user
 * POST /api/users/:userId/follow
 */
router.post('/users/:userId/follow', authenticateToken, limiter, async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.user_id;

  if (userId == followerId) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  try {
    const conn = await pool.getConnection();

    // Check if already following
    const [existing] = await conn.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, userId]
    );

    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Already following this user.' });
    }

    // Check if user exists
    const [users] = await conn.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'User not found.' });
    }

    // Create follow
    await conn.query(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, userId]
    );

    // Update follower/following counts
    await conn.query('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [followerId]);
    await conn.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [userId]);

    // Create notification
    await createNotification(userId, 'follow', followerId, null, null, conn);

    conn.release();
    res.status(200).json({ message: 'User followed successfully.' });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ error: 'Failed to follow user.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Unfollow a user
 * DELETE /api/users/:userId/follow
 */
router.delete('/users/:userId/follow', authenticateToken, limiter, async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    // Delete follow
    const result = await conn.query(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, userId]
    );

    if (result.affectedRows > 0) {
      // Update follower/following counts
      await conn.query('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [followerId]);
      await conn.query('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [userId]);
    }

    conn.release();
    res.status(200).json({ message: 'User unfollowed successfully.' });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ error: 'Failed to unfollow user.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Get followers of a user
 * GET /api/users/:userId/followers?page=1&limit=20
 */
router.get('/users/:userId/followers', limiter, async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [followers] = await conn.query(`
      SELECT u.id, u.username, u.avatar_url, u.bio, u.is_verified,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    conn.release();
    res.status(200).json({ followers });
  } catch (err) {
    console.error('Error fetching followers:', err);
    res.status(500).json({ error: 'Failed to fetch followers.' });
  }
});

/**
 * Get users following a user
 * GET /api/users/:userId/following?page=1&limit=20
 */
router.get('/users/:userId/following', limiter, async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [following] = await conn.query(`
      SELECT u.id, u.username, u.avatar_url, u.bio, u.is_verified,
        f.created_at as following_since
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    conn.release();
    res.status(200).json({ following });
  } catch (err) {
    console.error('Error fetching following:', err);
    res.status(500).json({ error: 'Failed to fetch following.' });
  }
});

/**
 * Get users I'm following
 * GET /api/me/following?page=1&limit=20
 */
router.get('/me/following', authenticateToken, limiter, async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    const [following] = await conn.query(`
      SELECT u.id, u.username, u.avatar_url, u.bio, u.is_verified,
        f.created_at as following_since
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    conn.release();
    res.status(200).json({ following });
  } catch (err) {
    console.error('Error fetching my following:', err);
    res.status(500).json({ error: 'Failed to fetch following.' });
  }
});

/*
|===========================================================================
| USER PROFILES ENDPOINTS
|===========================================================================
*/

/**
 * Get public user profile
 * GET /api/users/:userId
 */
router.get('/users/:userId', limiter, async (req, res) => {
  const { userId } = req.params;

  try {
    const conn = await pool.getConnection();

    const [users] = await conn.query(`
      SELECT id, username, bio, avatar_url, followers_count, following_count,
        posts_count, level, badges, created_at, is_verified
      FROM users
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];
    user.badges = JSON.parse(user.badges || '[]');

    conn.release();
    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

/**
 * Update own profile
 * PUT /api/me/profile
 */
router.put('/me/profile', authenticateToken, limiter, async (req, res) => {
  const { username, bio, avatar_url } = req.body;
  const userId = req.user.user_id;

  if (!username || username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Username must be between 3 and 50 characters.' });
  }

  if (bio && bio.length > 500) {
    return res.status(400).json({ error: 'Bio too long. Maximum 500 characters.' });
  }

  try {
    const conn = await pool.getConnection();

    // Check if username is taken by another user
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, userId]
    );

    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Username already taken.' });
    }

    // Update profile
    await conn.query(
      'UPDATE users SET username = ?, bio = ?, avatar_url = ? WHERE id = ?',
      [username, bio || null, avatar_url || null, userId]
    );

    conn.release();
    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Get personalized feed (following + global)
 * GET /api/me/feed?page=1&limit=20
 */
router.get('/me/feed', authenticateToken, limiter, async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    // Get feed from following users first, then global posts
    const [posts] = await conn.query(`
      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) as is_liked,
        'following' as feed_type
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN follows f ON p.user_id = f.following_id
      WHERE f.follower_id = ?
      ORDER BY p.created_at DESC
      LIMIT ?

      UNION ALL

      SELECT p.*, u.username, u.avatar_url, u.bio, u.is_verified,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) as is_liked,
        'global' as feed_type
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id != ?
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [userId, userId, limit, userId, limit, userId]);

    conn.release();
    res.status(200).json({ posts });
  } catch (err) {
    console.error('Error fetching personalized feed:', err);
    res.status(500).json({ error: 'Failed to fetch feed.' });
  }
});

/**
 * Get social stats
 * GET /api/me/social-stats
 */
router.get('/me/social-stats', authenticateToken, limiter, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    const [stats] = await conn.query(`
      SELECT
        followers_count,
        following_count,
        posts_count,
        flames,
        level,
        streak_days,
        badges
      FROM users
      WHERE id = ?
    `, [userId]);

    if (stats.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'User not found.' });
    }

    const userStats = stats[0];
    userStats.badges = JSON.parse(userStats.badges || '[]');

    conn.release();
    res.status(200).json(userStats);
  } catch (err) {
    console.error('Error fetching social stats:', err);
    res.status(500).json({ error: 'Failed to fetch social stats.' });
  }
});

/*
|===========================================================================
| NOTIFICATIONS ENDPOINTS
|===========================================================================
*/

/**
 * Get user notifications
 * GET /api/me/notifications?page=1&limit=20&unreadOnly=true
 */
router.get('/me/notifications', authenticateToken, limiter, async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    let query = `
      SELECT n.*, u.username, u.avatar_url,
        CASE
          WHEN n.type = 'like' THEN CONCAT(u.username, ' liked your post')
          WHEN n.type = 'comment' THEN CONCAT(u.username, ' commented on your post')
          WHEN n.type = 'follow' THEN CONCAT(u.username, ' started following you')
          WHEN n.type = 'post_mention' THEN CONCAT(u.username, ' mentioned you in a post')
        END as message
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ?
    `;

    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND n.read = 0';
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [notifications] = await conn.query(query, params);

    conn.release();
    res.status(200).json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

/**
 * Mark notifications as read
 * PUT /api/me/notifications/read
 */
router.put('/me/notifications/read', authenticateToken, limiter, async (req, res) => {
  const { notification_ids } = req.body;
  const userId = req.user.user_id;

  if (!notification_ids || !Array.isArray(notification_ids)) {
    return res.status(400).json({ error: 'notification_ids array is required.' });
  }

  if (notification_ids.length === 0) {
    return res.status(400).json({ error: 'notification_ids cannot be empty.' });
  }

  try {
    const conn = await pool.getConnection();

    await conn.query(
      'UPDATE notifications SET read = 1 WHERE user_id = ? AND id IN (?)',
      [userId, notification_ids]
    );

    conn.release();
    res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (err) {
    console.error('Error marking notifications read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * Delete a notification
 * DELETE /api/me/notifications/:id
 */
router.delete('/me/notifications/:id', authenticateToken, limiter, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const conn = await pool.getConnection();

    await conn.query(
      'DELETE FROM notifications WHERE user_id = ? AND id = ?',
      [userId, id]
    );

    conn.release();
    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification.' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
