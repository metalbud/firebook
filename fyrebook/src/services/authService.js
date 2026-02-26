import { authorize } from "react-native-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  googleConfig,
  facebookConfig,
  appleConfig,
} from "../config/authConfig";

const BASE_URL = `https://${process.env.FYREBOOK_BASE_URL}`;

// Store JWT token
const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('@jwtToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
};

// Remove JWT token
const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@jwtToken');
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

// Get JWT token
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@jwtToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Google OAuth callback
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google OAuth...');

    const result = await authorize(googleConfig);
    console.log('Google OAuth result:', result);

    // Send the authorization code to backend
    const response = await fetch(`${BASE_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: result.authorizationCode,
        redirect_uri: googleConfig.redirectUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend OAuth error:', errorData);
      throw new Error(errorData.message || 'Google authentication failed');
    }

    const data = await response.json();
    console.log('Backend OAuth response:', data);

    // Store the JWT token
    await storeToken(data.token);

    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Google authentication error:", error);
    throw error;
  }
};

// Facebook OAuth callback
export const signInWithFacebook = async () => {
  try {
    console.log('Starting Facebook OAuth...');

    const result = await authorize(facebookConfig);
    console.log('Facebook OAuth result:', result);

    // Send the authorization code to backend
    const response = await fetch(`${BASE_URL}/api/auth/facebook/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: result.authorizationCode,
        redirect_uri: facebookConfig.redirectUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend OAuth error:', errorData);
      throw new Error(errorData.message || 'Facebook authentication failed');
    }

    const data = await response.json();
    console.log('Backend OAuth response:', data);

    // Store the JWT token
    await storeToken(data.token);

    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Facebook authentication error:", error);
    throw error;
  }
};

// Apple OAuth callback
export const signInWithApple = async () => {
  try {
    console.log('Starting Apple OAuth...');

    const result = await authorize(appleConfig);
    console.log('Apple OAuth result:', result);

    // Send the authorization code to backend
    const response = await fetch(`${BASE_URL}/api/auth/apple/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: result.authorizationCode,
        id_token: result.idToken, // Apple uses id_token
        redirect_uri: appleConfig.redirectUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend OAuth error:', errorData);
      throw new Error(errorData.message || 'Apple authentication failed');
    }

    const data = await response.json();
    console.log('Backend OAuth response:', data);

    // Store the JWT token
    await storeToken(data.token);

    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Apple authentication error:", error);
    throw error;
  }
};

// Link OAuth provider to existing account
export const linkOAuthProvider = async (provider, authData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    let endpoint;
    switch (provider) {
      case 'google':
        endpoint = '/api/auth/link-provider';
        break;
      case 'facebook':
        endpoint = '/api/auth/link-provider';
        break;
      case 'apple':
        endpoint = '/api/auth/link-provider';
        break;
      default:
        throw new Error('Invalid OAuth provider');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider,
        auth_data: authData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to link provider');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error linking OAuth provider:", error);
    throw error;
  }
};

// Standard email/password login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    await storeToken(data.token);

    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Signup
export const signup = async (username, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    await storeToken(data.token);

    return {
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await removeToken();
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${BASE_URL}/api/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export { getToken, storeToken, removeToken };
