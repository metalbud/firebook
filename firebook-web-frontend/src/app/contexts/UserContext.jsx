'use client';

import { createContext, useContext, useState, useCallback } from 'react';

/**
 * UserContext for managing current user data and profile
 */
const UserContext = createContext(null);

/**
 * Custom hook to use UserContext
 * @returns {object} User context value
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * UserProvider component
 * @param {object} props Component props
 */
export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [socialStats, setSocialStats] = useState({
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
  });
  const [flames, setFlames] = useState(0);
  const [level, setLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);
  const [badges, setBadges] = useState([]);

  /**
   * Set user profile data
   * @param {object} userData User data from API
   */
  const setUser = useCallback((userData) => {
    setProfile({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      bio: userData.bio,
      avatar_url: userData.avatar_url,
      provider: userData.provider,
      is_verified: userData.is_verified,
    });

    setSocialStats({
      followers_count: userData.followers_count || 0,
      following_count: userData.following_count || 0,
      posts_count: userData.posts_count || 0,
    });

    setFlames(userData.flames || 0);
    setLevel(userData.level || 1);
    setStreakDays(userData.streak_days || 0);
    setBadges(userData.badges || []);
  }, []);

  /**
   * Update user profile
   * @param {object} updates Profile updates
   */
  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Update social stats
   * @param {object} updates Social stats updates
   */
  const updateSocialStats = useCallback((updates) => {
    setSocialStats(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Update flames count
   * @param {number} newFlames New flame count
   */
  const updateFlames = useCallback((newFlames) => {
    setFlames(newFlames);
  }, []);

  /**
   * Add flames
   * @param {number} amount Amount to add
   */
  const addFlames = useCallback((amount) => {
    setFlames(prev => prev + amount);
  }, []);

  /**
   * Update level
   * @param {number} newLevel New level
   */
  const updateLevel = useCallback((newLevel) => {
    setLevel(newLevel);
  }, []);

  /**
   * Update streak days
   * @param {number} newStreakDays New streak days
   */
  const updateStreakDays = useCallback((newStreakDays) => {
    setStreakDays(newStreakDays);
  }, []);

  /**
   * Add badge
   * @param {string} badge Badge name
   */
  const addBadge = useCallback((badge) => {
    setBadges(prev => [...prev, badge]);
  }, []);

  /**
   * Clear user data (logout)
   */
  const clearUser = useCallback(() => {
    setProfile(null);
    setSocialStats({
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
    });
    setFlames(0);
    setLevel(1);
    setStreakDays(0);
    setBadges([]);
  }, []);

  /**
   * Calculate progress to next level
   * @returns {number} Progress percentage (0-100)
   */
  const getLevelProgress = useCallback(() => {
    const levelRequirements = {
      1: 0,
      2: 100,
      3: 250,
      5: 500,
      10: 1000,
      25: 2500,
      50: 5000,
      100: 10000,
    };

    // Find current and next level requirements
    const levels = Object.keys(levelRequirements).map(Number).sort((a, b) => a - b);
    let currentLevelFlames = levelRequirements[level] || 0;
    let nextLevelFlames = 0;

    for (let i = 0; i < levels.length; i++) {
      if (levels[i] > level) {
        nextLevelFlames = levelRequirements[levels[i]];
        break;
      }
    }

    if (nextLevelFlames === 0) {
      return 100; // Max level
    }

    const progress = ((flames - currentLevelFlames) / (nextLevelFlames - currentLevelFlames)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [flames, level]);

  /**
   * Get flames needed for next level
   * @returns {number} Flames needed
   */
  const getFlamesToNextLevel = useCallback(() => {
    const levelRequirements = {
      1: 100,
      2: 150,
      3: 250,
      5: 500,
      10: 1000,
      25: 2500,
      50: 5000,
      100: 10000,
    };

    const nextLevel = level + 1;

    // Find next level in requirements
    const levels = Object.keys(levelRequirements).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < levels.length; i++) {
      if (levels[i] >= nextLevel) {
        return levelRequirements[levels[i]] - flames;
      }
    }

    return 0; // Max level
  }, [flames, level]);

  /**
   * Context value
   */
  const value = {
    profile,
    socialStats,
    flames,
    level,
    streakDays,
    badges,
    setUser,
    updateProfile,
    updateSocialStats,
    updateFlames,
    addFlames,
    updateLevel,
    updateStreakDays,
    addBadge,
    clearUser,
    getLevelProgress,
    getFlamesToNextLevel,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
