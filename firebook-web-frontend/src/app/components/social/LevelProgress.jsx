'use client';

import React from 'react';
import { useUser } from '../../contexts/UserContext';

// Level requirements and rewards
const LEVEL_REQUIREMENTS = {
  1: { flames: 0, title: 'Beginner', color: '#6B7280', icon: '🌱' },
  2: { flames: 100, title: 'Apprentice', color: '#22C55E', icon: '🌿' },
  3: { flames: 250, title: 'Journeyman', color: '#3B82F6', icon: '🌱' },
  5: { flames: 500, title: 'Expert', color: '#8B5CF6', icon: '🌻' },
  10: { flames: 1000, title: 'Master', color: '#EC4899', icon: '🔥' },
  25: { flames: 2500, title: 'Grandmaster', color: '#F59E0B', icon: '⚡' },
  50: { flames: 5000, title: 'Legendary', color: '#EF4444', icon: '👑' },
  100: { flames: 10000, title: 'Immortal', color: '#7C3AED', icon: '🌟' },
};

const LEVEL_REWARDS = {
  1: { badge: 'First Post', title: 'Create your first post' },
  5: { badge: 'Social Butterfly', title: 'Make 10 posts' },
  10: { badge: 'Content Creator', title: 'Make 50 posts' },
  25: { badge: 'Influencer', title: 'Get 100 followers' },
  50: { badge: 'Viral', title: 'Have a post go viral (50+ likes)' },
  100: { badge: 'Flame Keeper', title: 'Earn 500 total flames' },
};

export default function LevelProgress() {
  const { user, updateLevel } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  const currentLevel = user.level || 1;
  const currentFlames = user.flames || 0;

  // Find current level config
  const currentLevelConfig = Object.entries(LEVEL_REQUIREMENTS).find(([level]) =>
    parseInt(level) === currentLevel
  )?.[1] || LEVEL_REQUIREMENTS[1];

  // Find next level
  const nextLevel = Object.entries(LEVEL_REQUIREMENTS).find(([level, config]) =>
    config.flames > currentFlames && parseInt(level) > currentLevel
  )?.[0];

  const nextLevelConfig = nextLevel ? LEVEL_REQUIREMENTS[nextLevel] : null;
  const nextLevelNumber = nextLevel ? parseInt(nextLevel) : null;

  // Calculate progress
  const progress = nextLevelConfig
    ? Math.min(100, ((currentFlames - LEVEL_REQUIREMENTS[currentLevel]?.flames) /
        (nextLevelConfig.flames - LEVEL_REQUIREMENTS[currentLevel]?.flames)) * 100)
    : 100;

  const flamesToNextLevel = nextLevelConfig
    ? nextLevelConfig.flames - currentFlames
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Level Card */}
      <div className={`bg-gradient-to-br rounded-2xl p-8 shadow-2xl ${currentLevelConfig?.color?.replace('#', 'from-') || 'from-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="text-6xl mb-3">{currentLevelConfig?.icon || '🌱'}</div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">
                Level {currentLevel}
              </h2>
              <p className={`text-xl font-semibold ${currentLevelConfig?.color?.replace('#', 'text-') || 'text-gray-700'}`}>
                {currentLevelConfig?.title || 'Beginner'}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-md">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-sm text-gray-600 mb-1">Total Flames</div>
            <div className="text-3xl font-bold text-orange-600">{currentFlames.toLocaleString()}</div>
          </div>

          <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-md">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm text-gray-600 mb-1">Next Level</div>
            <div className={`text-2xl font-bold ${nextLevelConfig?.color?.replace('#', 'text-') || 'text-gray-500'}`}>
              {nextLevel ? `Level ${nextLevelNumber}` : 'MAX'}
            </div>
          </div>

          <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-md">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm text-gray-600 mb-1">Flames Needed</div>
            <div className={`text-2xl font-bold ${flamesToNextLevel > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {flamesToNextLevel.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Progress to Level {nextLevelNumber}</span>
              <span className="font-bold text-orange-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Level Up Reward */}
        {LEVEL_REWARDS[currentLevel] && (
          <div className="bg-white bg-opacity-90 rounded-xl p-6 border-2 border-yellow-400 shadow-lg">
            <div className="flex items-center mb-3">
              <div className="text-3xl mr-3">🏆</div>
              <h3 className="text-xl font-bold text-yellow-600">Level {currentLevel} Reward</h3>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-lg text-gray-700 mb-2 font-medium">
                  {LEVEL_REWARDS[currentLevel].title}
                </p>
                <div className="text-sm text-gray-600">
                  Complete this milestone to earn the <strong className="text-yellow-600">
                    {LEVEL_REWARDS[currentLevel].badge}
                  </strong> badge!
                </div>
              </div>
              {!user.badges?.includes(LEVEL_REWARDS[currentLevel].badge) && (
                <div className="ml-4 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-bold">
                  ✓ Earned
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* All Levels Overview */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          📊 Level Progression
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(LEVEL_REQUIREMENTS).map(([level, config]) => {
            const isCompleted = parseInt(level) <= currentLevel;
            const isCurrent = parseInt(level) === currentLevel;
            const isNext = parseInt(level) === nextLevelNumber;
            const hasReward = LEVEL_REWARDS[level];

            return (
              <div
                key={level}
                className={`
                  rounded-xl p-4 border-2 transition-all duration-300
                  ${isCompleted ? config.color.replace('#', 'bg-') + ' border-' : 'bg-gray-50 border-gray-200'}
                  ${isCurrent ? 'ring-2 ring-orange-500' : ''}
                  ${isNext ? 'ring-2 ring-blue-500' : ''}
                  ${!isCompleted ? 'opacity-60' : ''}
                  hover:scale-105
                  hover:shadow-lg
                `}
              >
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${isCompleted ? '' : 'grayscale'}`}>
                    {config.icon}
                  </div>
                  <div className={`text-lg font-bold mb-1 ${isCompleted ? config.color.replace('#', 'text-') : 'text-gray-600'}`}>
                    Level {level}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{config.title}</div>
                  <div className="text-sm font-semibold text-gray-700">
                    {config.flames.toLocaleString()} flames
                  </div>
                  {hasReward && (
                    <div className="mt-2">
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        🏆 Reward Available
                      </div>
                    </div>
                  )}
                  {!isCompleted && isNext && (
                    <div className="mt-2">
                      <div className="text-xs px-2 py-1 rounded-full inline-block bg-blue-100 text-blue-600">
                        🔜 Next Goal
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
