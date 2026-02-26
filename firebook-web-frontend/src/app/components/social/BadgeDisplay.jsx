'use client';

import React from 'react';

const BADGE_CONFIGS = {
  'First Post': {
    emoji: '🌟',
    color: '#FFD700',
    description: 'Created your first post',
    rarity: 'common',
  },
  'Social Butterfly': {
    emoji: '🦋',
    color: '#9333EA',
    description: 'Made 10 posts',
    rarity: 'uncommon',
  },
  'Content Creator': {
    emoji: '✨',
    color: '#FF69B4',
    description: 'Made 50 posts',
    rarity: 'rare',
  },
  'Viral': {
    emoji: '🔥',
    color: '#FF4500',
    description: 'Post reached 50 likes',
    rarity: 'epic',
  },
  'Influencer': {
    emoji: '⭐',
    color: '#FFD700',
    description: 'Have 100 followers',
    rarity: 'rare',
  },
  'Connector': {
    emoji: '🤝',
    color: '#00CED1',
    description: 'Follow 50 users',
    rarity: 'uncommon',
  },
  'Engaged': {
    emoji: '💪',
    color: '#DC143C',
    description: 'Like 100 posts',
    rarity: 'common',
  },
  'Commentator': {
    emoji: '💬',
    color: '#4169E1',
    description: 'Make 50 comments',
    rarity: 'uncommon',
  },
  'Verified': {
    emoji: '✅',
    color: '#32CD32',
    description: 'Get verified account',
    rarity: 'legendary',
  },
  'Recipe Master': {
    emoji: '👨‍🍳',
    color: '#FF6347',
    description: 'Save 25 recipes',
    rarity: 'uncommon',
  },
  'Chef in Training': {
    emoji: '📖',
    color: '#8B4513',
    description: 'Create 5 recipes',
    rarity: 'common',
  },
  'Flame Keeper': {
    emoji: '🔥',
    color: '#FF4500',
    description: 'Earn 500 flames',
    rarity: 'rare',
  },
  'Level Up': {
    emoji: '🚀',
    color: '#FFD700',
    description: 'Reach level 10',
    rarity: 'epic',
  },
};

const RARITY_STYLES = {
  common: {
    borderColor: '#B0B0B0',
    backgroundColor: '#FAFAFA',
  },
  uncommon: {
    borderColor: '#9333EA',
    backgroundColor: '#F0F0FF',
  },
  rare: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFFE0',
  },
  epic: {
    borderColor: '#FF4500',
    backgroundColor: '#FFEBE7',
  },
  legendary: {
    borderColor: '#32CD32',
    backgroundColor: '#E8F5E9',
  },
};

export default function BadgeDisplay({ badges, size = 'medium', interactive = false, onBadgePress }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-center text-gray-600">
          No badges earned yet! Complete challenges to earn badges.
        </div>
      </div>
    );
  }

  const sizeStyles = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-5xl',
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {badges.map((badge) => {
        const config = BADGE_CONFIGS[badge] || {
          emoji: '🏆',
          color: '#666',
          description: badge,
          rarity: 'common',
        };
        const rarityStyle = RARITY_STYLES[config.rarity] || RARITY_STYLES.common;

        return (
          <button
            key={badge}
            onClick={() => interactive && onBadgePress && onBadgePress(badge)}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
              ${sizeStyles[size]}
              rounded-2xl
              font-bold
              border-2
              ${rarityStyle.borderColor}
              ${rarityStyle.backgroundColor}
              relative
              shadow-md
              hover:shadow-lg
              transition-all
              duration-300
            `}
            title={config.description}
          >
            <span className="leading-none">{config.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}

// Badge card component for detailed view
export function BadgeCard({ badge, onClick, isUnlocked = true }) {
  const config = BADGE_CONFIGS[badge] || {
    emoji: '🏆',
    color: '#666',
    description: badge,
    rarity: 'common',
  };
  const rarityStyle = RARITY_STYLES[config.rarity] || RARITY_STYLES.common;

  return (
    <div
      onClick={() => onClick && onClick(badge)}
      className={`
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-not-allowed opacity-60'}
        bg-white
        rounded-2xl
        p-6
        border-4
        ${rarityStyle.borderColor}
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-300
        relative
      `}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 rounded-2xl flex items-center justify-center">
          <span className="text-6xl text-gray-500">🔒</span>
        </div>
      )}

      <div className="text-center">
        <div className={`text-6xl mb-4 ${isUnlocked ? '' : 'blur-sm opacity-50'}`}>
          {config.emoji}
        </div>

        <div className={`text-xl font-bold mb-2 ${isUnlocked ? config.color : 'text-gray-500'}`}>
          {badge}
        </div>

        <div className={`text-sm text-gray-600 mb-3 ${isUnlocked ? '' : 'opacity-50'}`}>
          {config.description}
        </div>

        <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${rarityStyle.borderColor} ${rarityStyle.backgroundColor}`}>
          {config.rarity.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// Badge grid for profile or collection page
export function BadgeGrid({ badges, title = 'Badges' }) {
  const sortedBadges = badges ? [...badges].sort((a, b) => {
    const configA = BADGE_CONFIGS[a] || { rarity: 'common' };
    const configB = BADGE_CONFIGS[b] || { rarity: 'common' };
    const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    return rarityOrder.indexOf(configA.rarity) - rarityOrder.indexOf(configB.rarity);
  }) : [];

  const rarityGroups = sortedBadges.reduce((groups, badge) => {
    const config = BADGE_CONFIGS[badge] || { rarity: 'common' };
    if (!groups[config.rarity]) {
      groups[config.rarity] = [];
    }
    groups[config.rarity].push(badge);
    return groups;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>

      {Object.entries(rarityGroups).map(([rarity, rarityBadges]) => {
        const rarityStyle = RARITY_STYLES[rarity] || RARITY_STYLES.common;

        return (
          <div key={rarity} className="mb-8">
            <h3 className={`text-lg font-bold mb-4 ${rarityStyle.borderColor} border-l-4 pl-4`}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)} Badges
              <span className="ml-2 text-sm text-gray-500 font-normal">({rarityBadges.length})</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rarityBadges.map((badge) => {
                const config = BADGE_CONFIGS[badge] || {
                  emoji: '🏆',
                  color: '#666',
                  description: badge,
                  rarity: rarity,
                };

                return (
                  <div
                    key={badge}
                    className={`
                      bg-white
                      rounded-2xl
                      p-4
                      border-2
                      ${rarityStyle.borderColor}
                      shadow-md
                      hover:shadow-lg
                      hover:scale-105
                      transition-all
                      duration-300
                    `}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">{config.emoji}</div>
                      <div className={`text-sm font-bold ${config.color}`}>{badge}</div>
                      <div className="text-xs text-gray-500 mt-1">{config.rarity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {sortedBadges.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🏆</div>
          <div className="text-lg">No badges earned yet!</div>
          <div className="text-sm mt-2">Complete challenges to earn your first badge.</div>
        </div>
      )}
    </div>
  );
}

// Export config for use in other components
export { BADGE_CONFIGS, RARITY_STYLES };
