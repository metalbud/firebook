import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    label: 'Common',
  },
  uncommon: {
    borderColor: '#9333EA',
    backgroundColor: '#F0F0FF',
    label: 'Uncommon',
  },
  rare: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFFE0',
    label: 'Rare',
  },
  epic: {
    borderColor: '#FF4500',
    backgroundColor: '#FFEBE7',
    label: 'Epic',
  },
  legendary: {
    borderColor: '#32CD32',
    backgroundColor: '#E8F5E9',
    label: 'Legendary',
  },
};

export default function BadgeDisplay({ badges, size = 'medium', interactive = false, onBadgePress }) {
  if (!badges || badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🏆</Text>
        <Text style={styles.emptyText}>No badges earned yet!</Text>
        <Text style={styles.emptySubtext}>
          Complete challenges to earn badges.
        </Text>
      </View>
    );
  }

  const sizeStyles = {
    small: { width: 64, height: 64, fontSize: 32 },
    medium: { width: 96, height: 96, fontSize: 48 },
    large: { width: 128, height: 128, fontSize: 64 },
  };

  return (
    <View style={styles.container}>
      {badges.map((badge) => {
        const config = BADGE_CONFIGS[badge] || {
          emoji: '🏆',
          color: '#666',
          description: badge,
          rarity: 'common',
        };
        const rarityStyle = RARITY_STYLES[config.rarity] || RARITY_STYLES.common;

        return (
          <TouchableOpacity
            key={badge}
            style={[sizeStyles[size], styles.badgeItem, rarityStyle]}
            onPress={() => interactive && onBadgePress && onBadgePress(badge)}
            activeOpacity={interactive ? 0.8 : 1}
          >
            <Text style={styles.badgeEmoji}>{config.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
    <TouchableOpacity
      onPress={() => onClick && onClick(badge)}
      style={[
        styles.badgeCard,
        rarityStyle,
        !isUnlocked && styles.lockedBadge,
      ]}
      activeOpacity={onClick ? 0.8 : 1}
      disabled={!isUnlocked && !onClick}
    >
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={48} color="#999" />
        </View>
      )}

      <View style={styles.badgeContent}>
        <Text style={styles.badgeEmojiLarge}>{config.emoji}</Text>

        <Text style={[styles.badgeTitle, !isUnlocked && styles.lockedText]}>
          {badge}
        </Text>

        <Text style={[styles.badgeDescription, !isUnlocked && styles.lockedText]}>
          {config.description}
        </Text>

        <View style={[styles.rarityBadge, rarityStyle]}>
          <Text style={styles.rarityText}>{config.rarity.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
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

  const { width } = Dimensions.get('window');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {sortedBadges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyText}>No badges earned yet!</Text>
          <Text style={styles.emptySubtext}>
            Complete challenges to earn your first badge.
          </Text>
        </View>
      ) : (
        Object.entries(rarityGroups).map(([rarity, rarityBadges]) => {
          const rarityStyle = RARITY_STYLES[rarity] || RARITY_STYLES.common;

          return (
            <View key={rarity} style={styles.raritySection}>
              <Text style={[styles.rarityTitle, { color: rarityStyle.borderColor }]}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)} Badges
                <Text style={styles.rarityCount}> ({rarityBadges.length})</Text>
              </Text>

              <View style={styles.badgesGrid}>
                {rarityBadges.map((badge) => {
                  const config = BADGE_CONFIGS[badge] || {
                    emoji: '🏆',
                    color: '#666',
                    description: badge,
                    rarity: rarity,
                  };

                  return (
                    <View
                      key={badge}
                      style={[
                        styles.badgeCard,
                        rarityStyle,
                        styles.badgeCardGrid,
                      ]}
                    >
                      <View style={styles.badgeContentGrid}>
                        <Text style={styles.badgeEmojiMedium}>{config.emoji}</Text>
                        <Text style={[styles.badgeTitleMedium, { color: config.color }]}>
                          {badge}
                        </Text>
                        <Text style={styles.badgeRarityLabel}>{config.rarity}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  badgeItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    margin: 8,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  badgeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeCardGrid: {
    padding: 12,
    margin: 4,
  },
  lockedBadge: {
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    color: '#999',
  },
  badgeContent: {
    alignItems: 'center',
  },
  badgeEmojiLarge: {
    fontSize: 64,
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    marginLeft: 16,
  },
  raritySection: {
    marginBottom: 24,
  },
  rarityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 16,
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  rarityCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginLeft: 8,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  badgeContentGrid: {
    alignItems: 'center',
  },
  badgeEmojiMedium: {
    fontSize: 32,
    marginBottom: 6,
  },
  badgeTitleMedium: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  badgeRarityLabel: {
    fontSize: 10,
    color: '#999',
  },
});
