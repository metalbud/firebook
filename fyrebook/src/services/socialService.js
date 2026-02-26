const API_BASE_URL = process.env.FYREBOOK_BASE_URL || 'http://localhost:3000/api';

/**
 * Get JWT token from secure storage
 * @returns {Promise<string|null>} JWT token
 */
const getToken = async () => {
  try {
    const { getSecureItem } = require('react-native-encrypted-storage');
    const token = await getSecureItem('firebook_token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set JWT token in secure storage
 * @param {string} token JWT token
 */
const setToken = async (token) => {
  try {
    const { setSecureItem } = require('react-native-encrypted-storage');
    await setSecureItem('firebook_token', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

/**
 * Remove JWT token from secure storage
 */
const removeToken = async () => {
  try {
    const { removeSecureItem } = require('react-native-encrypted-storage');
    await removeSecureItem('firebook_token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Make API request
 * @param {string} endpoint API endpoint
 * @param {object} options Request options
 * @returns {Promise} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      await removeToken();
      throw new Error('Unauthorized');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error('Forbidden');
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      throw new Error('Resource not found');
    }

    // Handle 500 Server Error
    if (response.status >= 500) {
      throw new Error('Server error');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * POST request
 * @param {string} endpoint API endpoint
 * @param {object} data Request body
 * @returns {Promise}
 */
const post = async (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * GET request
 * @param {string} endpoint API endpoint
 * @param {object} params Query parameters
 * @returns {Promise}
 */
const get = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
};

/**
 * PUT request
 * @param {string} endpoint API endpoint
 * @param {object} data Request body
 * @returns {Promise}
 */
const put = async (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 * @param {string} endpoint API endpoint
 * @returns {Promise}
 */
const del = async (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

/*
|===========================================================================
| AUTH API
|===========================================================================
*/

/**
 * User login
 * @param {object} credentials {identifier, password, rememberMe}
 * @returns {Promise}
 */
const login = async (credentials) => {
  const response = await post('/login', credentials);

  // Store token
  if (response.token) {
    await setToken(response.token);
  }

  // Store remember preference
  if (credentials.rememberMe) {
    const { setItem } = require('react-native-async-storage');
    await setItem('rememberMe', 'true');
  }

  return response;
};

/**
 * User signup
 * @param {object} userData {username, email, password}
 * @returns {Promise}
 */
const signup = async (userData) => {
  const response = await post('/signup', userData);

  // Store token
  if (response.token) {
    await setToken(response.token);
  }

  return response;
};

/**
 * Logout
 */
const logout = async () => {
  await removeToken();

  // Clear remember preference
  const { removeItem } = require('react-native-async-storage');
  await removeItem('rememberMe');
};

/**
 * Get current user
 * @returns {Promise}
 */
const getCurrentUser = async () => {
  return get('/me');
};

/**
 * Update profile
 * @param {object} profileData {username, bio, avatar_url}
 * @returns {Promise}
 */
const updateProfile = async (profileData) => {
  return put('/me/profile', profileData);
};

/**
 * Get social stats
 * @returns {Promise}
 */
const getSocialStats = async () => {
  return get('/me/social-stats');
};

/*
|===========================================================================
| POSTS API
|===========================================================================
*/

/**
 * Create a new post
 * @param {object} postData {content, post_type, recipe_id, recipe_data, photo_url}
 * @returns {Promise}
 */
const createPost = async (postData) => {
  return post('/posts', postData);
};

/**
 * Get posts (paginated)
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
const getPosts = async (params = {}) => {
  return get('/posts', params);
};

/**
 * Get single post by ID
 * @param {number} postId Post ID
 * @returns {Promise}
 */
const getPost = async (postId) => {
  return get(`/posts/${postId}`);
};

/**
 * Delete a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
const deletePost = async (postId) => {
  return del(`/posts/${postId}`);
};

/**
 * Get posts by user
 * @param {number} userId User ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
const getUserPosts = async (userId, params = {}) => {
  return get(`/users/${userId}/posts`, params);
};

/**
 * Get posts for a recipe
 * @param {number} recipeId Recipe ID
 * @returns {Promise}
 */
const getRecipePosts = async (recipeId) => {
  return get(`/posts/recipe/${recipeId}`);
};

/*
|===========================================================================
| LIKES API
|===========================================================================
*/

/**
 * Like a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
const likePost = async (postId) => {
  return post(`/posts/${postId}/like`);
};

/**
 * Unlike a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
const unlikePost = async (postId) => {
  return del(`/posts/${postId}/like`);
};

/**
 * Get users who liked a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
const getPostLikes = async (postId) => {
  return get(`/posts/${postId}/likes`);
};

/*
|===========================================================================
| COMMENTS API
|===========================================================================
*/

/**
 * Add comment to post
 * @param {number} postId Post ID
 * @param {object} commentData {content, parent_comment_id}
 * @returns {Promise}
 */
const addComment = async (postId, commentData) => {
  return post(`/posts/${postId}/comments`, commentData);
};

/**
 * Get comments for a post
 * @param {number} postId Post ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
const getComments = async (postId, params = {}) => {
  return get(`/posts/${postId}/comments`, params);
};

/**
 * Update a comment
 * @param {number} commentId Comment ID
 * @param {object} data {content}
 * @returns {Promise}
 */
const updateComment = async (commentId, data) => {
  return put(`/comments/${commentId}`, data);
};

/**
 * Delete a comment
 * @param {number} commentId Comment ID
 * @returns {Promise}
 */
const deleteComment = async (commentId) => {
  return del(`/comments/${commentId}`);
};

/*
|===========================================================================
| FOLLOWS API
|===========================================================================
*/

/**
 * Follow a user
 * @param {number} userId User ID to follow
 * @returns {Promise}
 */
const followUser = async (userId) => {
  return post(`/users/${userId}/follow`);
};

/**
 * Unfollow a user
 * @param {number} userId User ID to unfollow
 * @returns {Promise}
 */
const unfollowUser = async (userId) => {
  return del(`/users/${userId}/follow`);
};

/**
 * Get followers of a user
 * @param {number} userId User ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
const getFollowers = async (userId, params = {}) => {
  return get(`/users/${userId}/followers`, params);
};

/**
 * Get users following a user
 * @param {number} userId User ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
const getFollowing = async (userId, params = {}) => {
  return get(`/users/${userId}/following`, params);
};

/**
 * Get users I'm following
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
const getMyFollowing = async (params = {}) => {
  return get('/me/following', params);
};

/*
|===========================================================================
| USER PROFILES API
|===========================================================================
*/

/**
 * Get public user profile
 * @param {number} userId User ID
 * @returns {Promise}
 */
const getUserProfile = async (userId) => {
  return get(`/users/${userId}`);
};

/*
|===========================================================================
| NOTIFICATIONS API
|===========================================================================
*/

/**
 * Get user notifications
 * @param {object} params {page, limit, unreadOnly}
 * @returns {Promise}
 */
const getNotifications = async (params = {}) => {
  return get('/me/notifications', params);
};

/**
 * Mark notifications as read
 * @param {object} data {notification_ids}
 * @returns {Promise}
 */
const markNotificationsRead = async (data) => {
  return put('/me/notifications/read', data);
};

/**
 * Delete a notification
 * @param {number} notificationId Notification ID
 * @returns {Promise}
 */
const deleteNotification = async (notificationId) => {
  return del(`/me/notifications/${notificationId}`);
};

/*
|===========================================================================
| TRENDING API
|===========================================================================
*/

/**
 * Get trending posts
 * @param {object} params {timePeriod, limit}
 * @returns {Promise}
 */
const getTrendingPosts = async (params = {}) => {
  return get('/posts/trending', params);
};

/*
|===========================================================================
| RECIPE API (existing endpoints)
|===========================================================================
*/

/**
 * Get recipe by ID
 * @param {number} recipeId Recipe ID
 * @returns {Promise}
 */
const getRecipe = async (recipeId) => {
  return get(`/recipes/${recipeId}`);
};

module.exports = {
  getToken,
  setToken,
  removeToken,
  login,
  signup,
  logout,
  getCurrentUser,
  updateProfile,
  getSocialStats,
  createPost,
  getPosts,
  getPost,
  deletePost,
  getUserPosts,
  getRecipePosts,
  likePost,
  unlikePost,
  getPostLikes,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getMyFollowing,
  getUserProfile,
  getNotifications,
  markNotificationsRead,
  deleteNotification,
  getTrendingPosts,
  getRecipe,
};
