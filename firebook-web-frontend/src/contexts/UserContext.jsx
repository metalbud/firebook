'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../lib/api';
import API_BASE_URL from '../lib/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('firebook_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiCall(API_ENDPOINTS.ME);
      if (response.ok) {
        const userData = await response.json();
        setProfile({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          bio: userData.bio,
          avatar: userData.avatar,
          created_at: userData.created_at,
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
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLevel = (newLevel) => {
    setLevel(newLevel);
  };

  const updateSocialStats = (stats) => {
    setSocialStats(prev => ({ ...prev, ...stats }));
  };

  const value = {
    profile,
    socialStats,
    flames,
    level,
    streakDays,
    badges,
    loading,
    updateLevel,
    updateSocialStats,
    fetchUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  // Return default values during build prerender when no provider is available
  if (!context) {
    return {
      profile: null,
      socialStats: {
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
      },
      flames: 0,
      level: 1,
      streakDays: 0,
      badges: [],
    };
  }
  return context;
}
