'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../lib/api';

export default function FlameLimits() {
  const { user, addFlames } = useUser();
  const [flameData, setFlameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsToday, setPostsToday] = useState(0);

  useEffect(() => {
    fetchFlameData();
  }, []);

  const fetchFlameData = async () => {
    try {
      setLoading(true);
      const response = await api.getFlameLimits();
      setFlameData(response);
      setPostsToday(response.rewarded_posts_today || 0);
    } catch (error) {
      console.error('Error fetching flame limits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      </div>
    );
  }

  const MAX_FLAME_POSTS_PER_DAY = 3;
  const remainingFlamePosts = Math.max(0, MAX_FLAME_POSTS_PER_DAY - postsToday);
  const canEarnFlames = postsToday < MAX_FLAME_POSTS_PER_DAY;
  const progress = Math.min(100, (postsToday / MAX_FLAME_POSTS_PER_DAY) * 100);

  return (
    <div className="space-y-6">
      {/* Main Flame Limit Card */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              🔥 Daily Flame Limits
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">Today's Progress</span>
            <span className="font-bold text-orange-600">
              {postsToday}/{MAX_FLAME_POSTS_PER_DAY} Flame-earning posts
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Remaining Posts Counter */}
        <div className={`rounded-xl p-4 mb-4 ${canEarnFlames ? 'bg-green-50 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${canEarnFlames ? 'text-green-600' : 'text-gray-500'}`}>
              {remainingFlamePosts}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {canEarnFlames ? 'More posts can earn flames today!' : 'No more flame-earning posts available today'}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flame Multiplier Info */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Flame Rewards</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span>Text posts: 1 flame each</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                <span>Recipe posts: 2 flames each</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                <span>Recipe + Photo: 3 flames each</span>
              </div>
            </div>
          </div>

          {/* Reset Timer */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-3xl mb-3">🕐</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Reset</h3>
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Flame limits reset at midnight</div>
              <div className="text-xs">
                Tomorrow you'll have {MAX_FLAME_POSTS_PER_DAY} flame-earning posts available again
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Rewards Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          💎 Bonus Flame Rewards
        </h3>

        <div className="space-y-3">
          {/* Post Milestones */}
          <div className="border-l-4 border-yellow-400 pl-4">
            <h4 className="font-semibold text-gray-700 mb-2">Post Milestones</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium text-yellow-600">10 likes:</span>
                <span className="ml-2">+2 flames bonus</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-yellow-600">25 likes:</span>
                <span className="ml-2">+5 flames bonus</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-yellow-600">50 likes:</span>
                <span className="ml-2">+10 flames bonus 🔥</span>
              </div>
            </div>
          </div>

          {/* Engagement Limits */}
          <div className="border-l-4 border-blue-400 pl-4 mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Daily Engagement Limits</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium text-blue-600">Comments:</span>
                <span className="ml-2">50 per day</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-blue-600">Likes:</span>
                <span className="ml-2">100 per day</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-blue-600">Follows:</span>
                <span className="ml-2">50 per day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flame Earning Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📚 Tips to Earn More Flames
        </h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <span className="text-sm text-gray-700">
              Post early in the day to maximize flame-earning opportunities
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">📝</span>
            <span className="text-sm text-gray-700">
              Combine text with recipes or photos for higher flame rewards
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🤝</span>
            <span className="text-sm text-gray-700">
              Engage with others (like, comment, follow) to earn engagement flames
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔥</span>
            <span className="text-sm text-gray-700">
              Help your posts go viral (50+ likes) for bonus flames!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
