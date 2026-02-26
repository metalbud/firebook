'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../lib/api';
import API_BASE_URL from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('firebook_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiCall(API_ENDPOINTS.ME);
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          name: userData.username,
          email: userData.email,
          flames: userData.flames,
          level: userData.level,
          streakDays: userData.streakDays,
          badges: userData.badges,
        });
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('firebook_token');
        localStorage.removeItem('firebook_refresh_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, rememberMe = false) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ identifier, password, rememberMe }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store tokens
    localStorage.setItem('firebook_token', data.token);
    localStorage.setItem('firebook_refresh_token', data.refreshToken);

    // Fetch user data
    await checkAuth();

    return data;
  };

  const signup = async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    // Store tokens
    localStorage.setItem('firebook_token', data.token);
    localStorage.setItem('firebook_refresh_token', data.refreshToken);

    // Set user from signup
    setUser({
      id: data.user_id,
      name: username,
      email: email,
      flames: 0,
      level: 1,
      streakDays: 0,
      badges: [],
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem('firebook_token');
    localStorage.removeItem('firebook_refresh_token');
    localStorage.removeItem('firebook_user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}