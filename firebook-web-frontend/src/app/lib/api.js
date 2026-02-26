const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token
 */
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('firebook_token');
  }
  return null;
};

/**
 * Set JWT token in localStorage
 * @param {string} token JWT token
 */
const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('firebook_token', token);
  }
};

/**
 * Remove JWT token from localStorage
 */
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firebook_token');
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Make API request
 * @param {string} endpoint API endpoint
 * @param {object} options Request options
 * @returns {Promise} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

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
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
 * GET request
 * @param {string} endpoint API endpoint
 * @param {object} params Query parameters
 * @returns {Promise}
 */
const get = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
};

/**
 * POST request
 * @param {string} endpoint API endpoint
 * @param {object} data Request body
 * @returns {Promise}
 */
const post = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 * @param {string} endpoint API endpoint
 * @param {object} data Request body
 * @returns {Promise}
 */
const put = (endpoint, data = {}) => {
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
const del = (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

/*
|===========================================================================
| AUTH API
|===========================================================================
*/

/**
 * User signup
 * @param {object} userData {username, email, password}
 * @returns {Promise}
 */
export const signup = (userData) => {
  return post('/signup', userData);
};

/**
 * User login
 * @param {object} credentials {identifier, password, rememberMe}
 * @returns {Promise}
 */
export const login = (credentials) => {
  return post('/login', credentials);
};

/**
 * Get current user data
 * @returns {Promise}
 */
export const getCurrentUser = () => {
  return get('/me');
};

/**
 * Logout
 */
export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Google OAuth callback
 * @param {string} code OAuth code
 * @returns {Promise}
 */
export const googleCallback = (code) => {
  return post('/auth/google/callback', { code });
};

/**
 * Facebook OAuth callback
 * @param {string} code OAuth code
 * @returns {Promise}
 */
export const facebookCallback = (code) => {
  return post('/auth/facebook/callback', { code });
};

/**
 * Apple OAuth callback
 * @param {string} code OAuth code
 * @returns {Promise}
 */
export const appleCallback = (code) => {
  return post('/auth/apple/callback', { code });
};

/**
 * Link OAuth provider to account
 * @param {object} data {provider, providerUserId, accessToken, refreshToken, email}
 * @returns {Promise}
 */
export const linkProvider = (data) => {
  return post('/auth/link-provider', data);
};

/*
|===========================================================================
| POSTS API
|===========================================================================
*/

/**
 * Create a new post
 * @param {object} postData {content, postType, recipeId, recipeData, photoUrl}
 * @returns {Promise}
 */
export const createPost = (postData) => {
  return post('/posts', postData);
};

/**
 * Get global feed
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getPosts = (params = {}) => {
  return get('/posts', params);
};

/**
 * Get single post by ID
 * @param {number} postId Post ID
 * @returns {Promise}
 */
export const getPost = (postId) => {
  return get(`/posts/${postId}`);
};

/**
 * Delete a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
export const deletePost = (postId) => {
  return del(`/posts/${postId}`);
};

/**
 * Get posts by user
 * @param {number} userId User ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getUserPosts = (userId, params = {}) => {
  return get(`/users/${userId}/posts`, params);
};

/**
 * Get posts for a recipe
 * @param {number} recipeId Recipe ID
 * @returns {Promise}
 */
export const getRecipePosts = (recipeId) => {
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
export const likePost = (postId) => {
  return post(`/posts/${postId}/like`);
};

/**
 * Unlike a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
export const unlikePost = (postId) => {
  return del(`/posts/${postId}/like`);
};

/**
 * Get users who liked a post
 * @param {number} postId Post ID
 * @returns {Promise}
 */
export const getPostLikes = (postId) => {
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
 * @param {object} commentData {content, parentCommentId}
 * @returns {Promise}
 */
export const addComment = (postId, commentData) => {
  return post(`/posts/${postId}/comments`, commentData);
};

/**
 * Get comments for a post
 * @param {number} postId Post ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getComments = (postId, params = {}) => {
  return get(`/posts/${postId}/comments`, params);
};

/**
 * Update a comment
 * @param {number} commentId Comment ID
 * @param {object} data {content}
 * @returns {Promise}
 */
export const updateComment = (commentId, data) => {
  return put(`/comments/${commentId}`, data);
};

/**
 * Delete a comment
 * @param {number} commentId Comment ID
 * @returns {Promise}
 */
export const deleteComment = (commentId) => {
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
export const followUser = (userId) => {
  return post(`/users/${userId}/follow`);
};

/**
 * Unfollow a user
 * @param {number} userId User ID to unfollow
 * @returns {Promise}
 */
export const unfollowUser = (userId) => {
  return del(`/users/${userId}/follow`);
};

/**
 * Get followers of a user
 * @param {number} userId User ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getFollowers = (userId, params = {}) => {
  return get(`/users/${userId}/followers`, params);
};

/**
 * Get users following a user
 * @param {number} userId User ID
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getFollowing = (userId, params = {}) => {
  return get(`/users/${userId}/following`, params);
};

/**
 * Get users I'm following
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getMyFollowing = (params = {}) => {
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
export const getUserProfile = (userId) => {
  return get(`/users/${userId}`);
};

/**
 * Update own profile
 * @param {object} profileData {username, bio, avatarUrl}
 * @returns {Promise}
 */
export const updateProfile = (profileData) => {
  return put('/me/profile', profileData);
};

/**
 * Get personalized feed
 * @param {object} params {page, limit}
 * @returns {Promise}
 */
export const getMyFeed = (params = {}) => {
  return get('/me/feed', params);
};

/**
 * Get social stats
 * @returns {Promise}
 */
export const getSocialStats = () => {
  return get('/me/social-stats');
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
export const getNotifications = (params = {}) => {
  return get('/me/notifications', params);
};

/**
 * Mark notifications as read
 * @param {object} data {notificationIds}
 * @returns {Promise}
 */
export const markNotificationsRead = (data) => {
  return put('/me/notifications/read', data);
};

/**
 * Delete a notification
 * @param {number} notificationId Notification ID
 * @returns {Promise}
 */
export const deleteNotification = (notificationId) => {
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
export const getTrendingPosts = (params = {}) => {
  return get('/posts/trending', params);
};

/*
|===========================================================================
| RECIPE API (existing endpoints)
|===========================================================================
*/

/**
 * Save a recipe
 * @param {object} recipeData
 * @returns {Promise}
 */
export const saveRecipe = (recipeData) => {
  return post('/save-recipe', recipeData);
};

/**
 * Get saved recipes
 * @returns {Promise}
 */
export const getSavedRecipes = () => {
  return get('/saved-recipes');
};

/**
 * Generate random recipes
 * @param {object} params
 * @returns {Promise}
 */
export const getRandomRecipes = (params = {}) => {
  return get('/random-recipes', params);
};

/**
 * Share a recipe
 * @param {number} recipeId
 * @returns {Promise}
 */
export const shareRecipe = (recipeId) => {
  return post('/share-recipe', { recipe_id: recipeId });
};

/**
 * Get recipe by ID
 * @param {number} recipeId
 * @returns {Promise}
 */
export const getRecipe = (recipeId) => {
  return get(`/recipes/${recipeId}`);
};

/**
 * Review a recipe
 * @param {number} recipeId
 * @param {object} reviewData {rating, comment}
 * @returns {Promise}
 */
export const reviewRecipe = (recipeId, reviewData) => {
  return post(`/recipes/${recipeId}/review`, reviewData);
};

/**
 * Upload recipe photo
 * @param {number} recipeId
 * @param {object} photoData
 * @returns {Promise}
 */
export const uploadRecipePhoto = (recipeId, photoData) => {
  return post(`/recipes/${recipeId}/photo`, photoData);
};

export default {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  signup,
  login,
  logout,
  getCurrentUser,
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
  updateProfile,
  getMyFeed,
  getSocialStats,
  getNotifications,
  markNotificationsRead,
  deleteNotification,
  getTrendingPosts,
  saveRecipe,
  getSavedRecipes,
  getRandomRecipes,
  shareRecipe,
  getRecipe,
  reviewRecipe,
  uploadRecipePhoto,
};
