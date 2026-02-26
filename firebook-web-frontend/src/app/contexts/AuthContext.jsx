'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setToken, removeToken, getToken } from '../lib/api';
import { useRouter } from 'next/navigation';

/**
 * AuthContext for managing authentication state
 */
const AuthContext = createContext(null);

/**
 * Custom hook to use AuthContext
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component
 * @param {object} props Component props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify token with API
      const { login, getCurrentUser } = await import('../lib/api');
      const userData = await getCurrentUser();

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be invalid, remove it
      removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login function
   * @param {string} token JWT token
   * @param {object} userData User data
   */
  const login = useCallback((token, userData) => {
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/feed');
  }, [router]);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  /**
   * Update user data
   * @param {object} userData Updated user data
   */
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  /**
   * Context value
   */
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * ProtectedRoute component
 * Redirects to login if not authenticated
 * @param {object} props Component props
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthContext;
