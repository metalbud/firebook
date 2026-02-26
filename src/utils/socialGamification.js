/**
 * Social Gamification Utilities
 * Handles flames, badges, and engagement rewards for social features
 */

/*
|===========================================================================
| POST FLAMES (Limited Per Day)
|===========================================================================
*/

/**
 * Award flames for posting (limited to first 3 posts per day)
 * @param {number} userId User ID
 * @param {string} postType Post type (text, recipe, photo, recipe_with_photo)
 * @param {object} conn Database connection
 * @returns {Promise<number>} Number of flames awarded (0 if limit reached)
 */
const awardPostFlames = async (userId, postType, conn) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check today's post flame limit
    const [limits] = await conn.query(
      'SELECT rewarded_posts_today FROM post_flame_limits WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    let todayCount = 0;
    if (limits.length > 0) {
      todayCount = limits[0].rewarded_posts_today;
    }

    // Check if limit reached (3 posts per day)
    if (todayCount >= 3) {
      // Unlimited posting, but no flames
      return 0;
    }

    // Calculate flames based on post type
    let flames = 0;
    switch (postType) {
      case 'text':
        flames = 1;
        break;
      case 'recipe':
        flames = 2;
        break;
      case 'photo':
        flames = 1;
        break;
      case 'recipe_with_photo':
        flames = 3;
        break;
      default:
        flames = 1;
    }

    // Update post flame limit record
    if (limits.length === 0) {
      await conn.query(
        'INSERT INTO post_flame_limits (user_id, rewarded_posts_today, date) VALUES (?, 1, ?)',
        [userId, today]
      );
    } else {
      await conn.query(
        'UPDATE post_flame_limits SET rewarded_posts_today = rewarded_posts_today + 1 WHERE user_id = ? AND date = ?',
        [userId, today]
      );
    }

    // Award flames to user
    await conn.query('UPDATE users SET flames = flames + ? WHERE id = ?', [flames, userId]);

    return flames;
  } catch (error) {
    console.error('Error awarding post flames:', error);
    return 0;
  }
};

/*
|===========================================================================
| ENGAGEMENT FLAMES (Limited Per Day)
|===========================================================================
*/

/**
 * Award flames for receiving engagement (likes/comments)
 * @param {number} userId User ID receiving engagement
 * @param {string} type 'like' or 'comment'
 * @param {number} count Number of engagements
 * @param {object} conn Database connection
 * @returns {Promise<number>} Number of flames awarded
 */
const awardEngagementFlames = async (userId, type, count, conn) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today} 00:00:00`;
    const todayEnd = `${today} 23:59:59`;

    // Calculate engagement for today
    let todayEngagement = 0;

    if (type === 'like') {
      const [likes] = await conn.query(
        'SELECT COUNT(*) as count FROM likes WHERE user_id = ? AND created_at BETWEEN ? AND ?',
        [userId, todayStart, todayEnd]
      );
      todayEngagement = likes[0].count;

      // Rate limit: Max 10 flames/day from likes
      if (todayEngagement >= 100) {
        return 0; // 100 likes = max 10 flames
      }

      const remainingLikes = 100 - todayEngagement;
      const flamesToAward = Math.min(count, remainingLikes) * 0.1;
      const cappedFlames = Math.min(flamesToAward, 10 - todayEngagement * 0.1);

      if (cappedFlames > 0) {
        await conn.query('UPDATE users SET flames = flames + ? WHERE id = ?', [cappedFlames, userId]);
      }

      return cappedFlames;
    } else if (type === 'comment') {
      const [comments] = await conn.query(
        'SELECT COUNT(*) as count FROM comments WHERE user_id = ? AND created_at BETWEEN ? AND ?',
        [userId, todayStart, todayEnd]
      );
      todayEngagement = comments[0].count;

      // Rate limit: Max 15 flames/day from comments
      if (todayEngagement >= 30) {
        return 0; // 30 comments = max 15 flames
      }

      const remainingComments = 30 - todayEngagement;
      const flamesToAward = Math.min(count, remainingComments) * 0.5;
      const cappedFlames = Math.min(flamesToAward, 15 - todayEngagement * 0.5);

      if (cappedFlames > 0) {
        await conn.query('UPDATE users SET flames = flames + ? WHERE id = ?', [cappedFlames, userId]);
      }

      return cappedFlames;
    }

    return 0;
  } catch (error) {
    console.error('Error awarding engagement flames:', error);
    return 0;
  }
};

/*
|===========================================================================
| POST COUNTS UPDATES
|===========================================================================
*/

/**
 * Update post like/comment counts
 * @param {number} postId Post ID
 * @param {string} type 'like' or 'comment'
 * @param {number} delta Change amount (+1 or -1)
 * @param {object} conn Database connection
 */
const updatePostCounts = async (postId, type, delta, conn) => {
  try {
    if (type === 'like') {
      await conn.query(
        'UPDATE posts SET likes_count = likes_count + ? WHERE id = ?',
        [delta, postId]
      );

      // Check for like milestones and award bonus flames
      if (delta > 0) {
        const [posts] = await conn.query('SELECT likes_count, user_id FROM posts WHERE id = ?', [postId]);
        if (posts.length > 0) {
          const likes = posts[0].likes_count;
          const postOwnerId = posts[0].user_id;
          let bonus = 0;

          if (likes === 10) bonus = 2;
          else if (likes === 25) bonus = 5;
          else if (likes === 50) bonus = 10;

          if (bonus > 0) {
            await conn.query('UPDATE users SET flames = flames + ? WHERE id = ?', [bonus, postOwnerId]);
            await createNotification(postOwnerId, 'post_mention', null, postId, null, conn, `Your post reached ${likes} likes! +${bonus} flames bonus!`);
          }
        }
      }
    } else if (type === 'comment') {
      await conn.query(
        'UPDATE posts SET comments_count = comments_count + ? WHERE id = ?',
        [delta, postId]
      );
    }
  } catch (error) {
    console.error('Error updating post counts:', error);
  }
};

/*
|===========================================================================
| USER SOCIAL STATS UPDATES
|===========================================================================
*/

/**
 * Update user social stats (followers, following, posts)
 * @param {number} userId User ID
 * @param {object} conn Database connection
 */
const updateUserSocialStats = async (userId, conn) => {
  try {
    // Calculate followers count
    const [followers] = await conn.query(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [userId]
    );

    // Calculate following count
    const [following] = await conn.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
      [userId]
    );

    // Calculate posts count
    const [posts] = await conn.query(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [userId]
    );

    // Update user stats
    await conn.query(
      'UPDATE users SET followers_count = ?, following_count = ?, posts_count = ? WHERE id = ?',
      [followers[0].count, following[0].count, posts[0].count, userId]
    );
  } catch (error) {
    console.error('Error updating user social stats:', error);
  }
};

/*
|===========================================================================
| NOTIFICATIONS
|===========================================================================
*/

/**
 * Create a notification for a user
 * @param {number} userId User to notify
 * @param {string} type Notification type (like, comment, follow, post_mention)
 * @param {number|null} actorId User who performed action
 * @param {number|null} postId Related post ID
 * @param {number|null} commentId Related comment ID
 * @param {object} conn Database connection
 * @param {string} customMessage Custom notification message
 */
const createNotification = async (userId, type, actorId, postId, commentId, conn, customMessage = null) => {
  try {
    // Don't create notification if actor is the same as recipient
    if (actorId === userId) {
      return;
    }

    let message = null;
    if (customMessage) {
      message = customMessage;
    }

    await conn.query(
      'INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id) VALUES (?, ?, ?, ?, ?)',
      [userId, type, actorId, postId, commentId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/*
|===========================================================================
| BADGE SYSTEM
|===========================================================================
*/

/**
 * Check and award badges based on user activity
 * @param {number} userId User ID
 * @param {object} conn Database connection
 */
const checkAndAwardBadges = async (userId, conn) => {
  try {
    const [user] = await conn.query('SELECT id, username, badges, posts_count, followers_count, following_count, flames FROM users WHERE id = ?', [userId]);

    if (user.length === 0) return;

    const currentBadges = JSON.parse(user[0].badges || '[]');
    const newBadges = [];

    // First Post badge
    if (!currentBadges.includes('First Post') && user[0].posts_count >= 1) {
      newBadges.push('First Post');
    }

    // Social Butterfly badge (10 posts)
    if (!currentBadges.includes('Social Butterfly') && user[0].posts_count >= 10) {
      newBadges.push('Social Butterfly');
    }

    // Content Creator badge (50 posts)
    if (!currentBadges.includes('Content Creator') && user[0].posts_count >= 50) {
      newBadges.push('Content Creator');
    }

    // Influencer badge (100 followers)
    if (!currentBadges.includes('Influencer') && user[0].followers_count >= 100) {
      newBadges.push('Influencer');
    }

    // Connector badge (follow 50 users)
    if (!currentBadges.includes('Connector') && user[0].following_count >= 50) {
      newBadges.push('Connector');
    }

    // Verified badge (admin award)
    // This badge is awarded manually by admin

    // Award new badges
    if (newBadges.length > 0) {
      const allBadges = [...currentBadges, ...newBadges];
      await conn.query(
        'UPDATE users SET badges = ? WHERE id = ?',
        [JSON.stringify(allBadges), userId]
      );

      // Create notification for each new badge
      for (const badge of newBadges) {
        await createNotification(userId, 'post_mention', null, null, null, conn, `You earned the "${badge}" badge! 🏆`);
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

/**
 * Check for Viral badge (post reaches 50 likes)
 * @param {number} postId Post ID
 * @param {object} conn Database connection
 */
const checkViralBadge = async (postId, conn) => {
  try {
    const [posts] = await conn.query('SELECT id, user_id, likes_count FROM posts WHERE id = ?', [postId]);

    if (posts.length === 0) return;

    const post = posts[0];
    const [user] = await conn.query('SELECT id, badges FROM users WHERE id = ?', [post.user_id]);

    if (user.length === 0) return;

    const currentBadges = JSON.parse(user[0].badges || '[]');

    // Viral badge (50 likes on a single post)
    if (!currentBadges.includes('Viral') && post.likes_count >= 50) {
      const allBadges = [...currentBadges, 'Viral'];
      await conn.query(
        'UPDATE users SET badges = ? WHERE id = ?',
        [JSON.stringify(allBadges), post.user_id]
      );
      await createNotification(post.user_id, 'post_mention', null, postId, null, conn, `Your post went viral! 🎉 50+ likes!`);
    }
  } catch (error) {
    console.error('Error checking viral badge:', error);
  }
};

/**
 * Check for engagement badges (Engaged, Commentator)
 * These are checked periodically or after engagement actions
 * @param {number} userId User ID
 * @param {object} conn Database connection
 */
const checkEngagementBadges = async (userId, conn) => {
  try {
    const [user] = await conn.query('SELECT id, badges FROM users WHERE id = ?', [userId]);

    if (user.length === 0) return;

    const currentBadges = JSON.parse(user[0].badges || '[]');
    const newBadges = [];

    // Engaged badge (like 100 posts)
    const [likes] = await conn.query('SELECT COUNT(*) as count FROM likes WHERE user_id = ?', [userId]);
    if (!currentBadges.includes('Engaged') && likes[0].count >= 100) {
      newBadges.push('Engaged');
    }

    // Commentator badge (50 comments)
    const [comments] = await conn.query('SELECT COUNT(*) as count FROM comments WHERE user_id = ?', [userId]);
    if (!currentBadges.includes('Commentator') && comments[0].count >= 50) {
      newBadges.push('Commentator');
    }

    // Award new badges
    if (newBadges.length > 0) {
      const allBadges = [...currentBadges, ...newBadges];
      await conn.query(
        'UPDATE users SET badges = ? WHERE id = ?',
        [JSON.stringify(allBadges), userId]
      );

      for (const badge of newBadges) {
        await createNotification(userId, 'post_mention', null, null, null, conn, `You earned the "${badge}" badge! 🏆`);
      }
    }
  } catch (error) {
    console.error('Error checking engagement badges:', error);
  }
};

/*
|===========================================================================
| LEVEL SYSTEM
|===========================================================================
*/

/**
 * Check and update user level based on flames
 * @param {number} userId User ID
 * @param {object} conn Database connection
 */
const checkAndUpdateLevel = async (userId, conn) => {
  try {
    const [user] = await conn.query('SELECT id, flames, level FROM users WHERE id = ?', [userId]);

    if (user.length === 0) return;

    const flames = user[0].flames;
    const currentLevel = user[0].level;

    const levelRequirements = {
      1: 100,
      2: 250,
      3: 250,
      5: 500,
      10: 1000,
      25: 2500,
      50: 5000,
      100: 10000,
    };

    // Calculate target level
    let targetLevel = 1;
    for (const [level, requiredFlames] of Object.entries(levelRequirements).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
      if (flames >= requiredFlames) {
        targetLevel = parseInt(level);
      }
    }

    // Update level if increased
    if (targetLevel > currentLevel) {
      await conn.query('UPDATE users SET level = ? WHERE id = ?', [targetLevel, userId]);
      await createNotification(userId, 'post_mention', null, null, null, conn, `Level up! 🎉 You are now level ${targetLevel}!`);
      return targetLevel;
    }

    return currentLevel;
  } catch (error) {
    console.error('Error checking level:', error);
    return null;
  }
};

module.exports = {
  awardPostFlames,
  awardEngagementFlames,
  updatePostCounts,
  updateUserSocialStats,
  createNotification,
  checkAndAwardBadges,
  checkViralBadge,
  checkEngagementBadges,
  checkAndUpdateLevel,
};
