// API Configuration for Firebook Web Frontend

// Use production backend at firebook.app (same as Expo app)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://firebook.app';

export const API_ENDPOINTS = {
  // Auth - matches Expo app routes (with /api prefix)
  LOGIN: '/api/login',
  SIGNUP: '/api/signup',
  ME: '/api/me',
  REFRESH_TOKEN: '/api/refresh-token',
  DELETE_ACCOUNT: '/api/delete-account',
  
  // Recipes
  SAVE_RECIPE: '/api/save-recipe',
  RANDOM_RECIPES: '/api/random-recipes',
  USER_RECIPES: '/api/user-recipes',
  
  // Blog
  BLOG_POSTS: '/api/blog/posts',
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('firebook_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  // Include credentials for CORS
  config.credentials = 'include';
  
  const response = await fetch(url, config);
  
  // Handle 401 - token expired
  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshAuthToken();
    if (refreshed) {
      // Retry the original request
      const newToken = localStorage.getItem('firebook_token');
      config.headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(url, config);
    } else {
      // Clear tokens and redirect to login
      localStorage.removeItem('firebook_token');
      localStorage.removeItem('firebook_refresh_token');
      localStorage.removeItem('firebook_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired'));
    }
  }
  
  return response;
};

const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('firebook_refresh_token');
    if (!refreshToken) return false;
    
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('firebook_token', data.token);
      localStorage.setItem('firebook_refresh_token', data.refreshToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

export default API_BASE_URL;