import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Progress } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  const currentLevel = user.level || 1;
  const currentFlames = user.flames || 0;

  const currentLevelConfig = Object.entries(LEVEL_REQUIREMENTS).find(([level]) =>
    parseInt(level) === currentLevel
  )?.[1] || LEVEL_REQUIREMENTS[1];

  const nextLevel = Object.entries(LEVEL_REQUIREMENTS).find(([level, config]) =>
    config.flames > currentFlames && parseInt(level) > currentLevel
  )?.[0];

  const nextLevelConfig = nextLevel ? LEVEL_REQUIREMENTS[nextLevel] : null;
  const nextLevelNumber = nextLevel ? parseInt(nextLevel) : null;

  const progress = nextLevelConfig
    ? Math.min(1, (currentFlames - LEVEL_REQUIREMENTS[currentLevel]?.flames) /
        (nextLevelConfig.flames - LEVEL_REQUIREMENTS[currentLevel]?.flames))
    : 1;

  const flamesToNextLevel = nextLevelConfig
    ? nextLevelConfig.flames - currentFlames
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Level Card */}
        <View style={[styles.levelCard, { borderColor: currentLevelConfig?.color }]}>
          <View style={styles.levelHeader}>
            <View style={styles.levelIcon}>
              <Text style={styles.levelIconText}>{currentLevelConfig?.icon || '🌱'}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>Level {currentLevel}</Text>
              <Text style={[styles.levelTitle, { color: currentLevelConfig?.color }]}>
                {currentLevelConfig?.title || 'Beginner'}
              </Text>
            </View>
            <Text style={styles.levelDate}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Current Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statLabel}>Total Flames</Text>
              <Text style={[styles.statValue, { color: '#ff6b35' }]}>
                {currentFlames.toLocaleString()}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statLabel}>Next Level</Text>
              <Text style={[styles.statValue, { color: nextLevelConfig?.color || '#999' }]}>
                {nextLevel ? `Level ${nextLevelNumber}` : 'MAX'}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statLabel}>Flames Needed</Text>
              <Text style={[styles.statValue, flamesToNextLevel > 0 ? { color: '#10b981' } : { color: '#999' }]}>
                {flamesToNextLevel.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          {nextLevel && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress to Level {nextLevelNumber}</Text>
                <Text style={[styles.progressValue, { color: '#ff6b35' }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <Progress.Bar
                progress={progress}
                width={null}
                height={12}
                unfilledColor="#e0e0e0"
                color="#ff6b35"
                borderWidth={0}
              />
            </View>
          )}

          {/* Level Up Reward */}
          {LEVEL_REWARDS[currentLevel] && (
            <View style={styles.rewardCard}>
              <View style={styles.rewardHeader}>
                <Text style={styles.rewardIcon}>🏆</Text>
                <Text style={styles.rewardTitle}>Level {currentLevel} Reward</Text>
              </View>
              <View style={styles.rewardContent}>
                <Text style={styles.rewardDescription}>
                  {LEVEL_REWARDS[currentLevel].title}
                </Text>
                <Text style={styles.rewardBadge}>
                  Complete this milestone to earn the{' '}
                  <Text style={styles.rewardBadgeName}>
                    {LEVEL_REWARDS[currentLevel].badge}
                  </Text>
                  {' '}badge!
                </Text>
                {!user.badges?.includes(LEVEL_REWARDS[currentLevel].badge) && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.earnedText}>Earned</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* All Levels Overview */}
        <View style={styles.levelsSection}>
          <Text style={styles.sectionTitle}>📊 Level Progression</Text>
          <View style={styles.levelsGrid}>
            {Object.entries(LEVEL_REQUIREMENTS).map(([level, config]) => {
              const isCompleted = parseInt(level) <= currentLevel;
              const isCurrent = parseInt(level) === currentLevel;
              const isNext = parseInt(level) === nextLevelNumber;
              const hasReward = LEVEL_REWARDS[level];

              return (
                <View
                  key={level}
                  style={[
                    styles.levelCardSmall,
                    isCompleted && styles.levelCardCompleted,
                    isCurrent && styles.levelCardCurrent,
                    isNext && styles.levelCardNext,
                    !isCompleted && styles.levelCardLocked,
                  ]}
                >
                  <View style={styles.levelCardContent}>
                    <Text style={[
                      styles.levelIconSmall,
                      isCompleted ? '' : styles.levelIconGray
                    ]}>
                      {config.icon}
                    </Text>
                    <Text style={[
                      styles.levelNumberSmall,
                      isCompleted && { color: config.color },
                      !isCompleted && styles.levelNumberLocked
                    ]}>
                      Level {level}
                    </Text>
                    <Text style={styles.levelTitleSmall}>{config.title}</Text>
                    <Text style={styles.levelFlamesSmall}>{config.flames.toLocaleString()} flames</Text>

                    {hasReward && (
                      <View style={styles.rewardIndicator}>
                        <Text style={styles.rewardIndicatorText}>🏆</Text>
                      </View>
                    )}
                    {!isCompleted && isNext && (
                      <View style={styles.nextIndicator}>
                        <Ionicons name="arrow-forward" size={12} color="#3b82f6" />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    padding: 16,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelIconText: {
    fontSize: 36,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  levelDate: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  rewardCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f59e0b',
  },
  rewardContent: {
    gap: 8,
  },
  rewardDescription: {
    fontSize: 16,
    color: '#333',
  },
  rewardBadge: {
    fontSize: 14,
    color: '#666',
  },
  rewardBadgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  earnedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    marginLeft: 16,
  },
  levelsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCardSmall: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  levelCardCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#dcfce7',
  },
  levelCardCurrent: {
    borderColor: '#ff6b35',
    borderWidth: 3,
  },
  levelCardNext: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  levelCardLocked: {
    opacity: 0.6,
  },
  levelCardContent: {
    alignItems: 'center',
  },
  levelIconSmall: {
    fontSize: 24,
    marginBottom: 4,
  },
  levelIconGray: {
    opacity: 0.5,
  },
  levelNumberSmall: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelNumberLocked: {
    color: '#999',
  },
  levelTitleSmall: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  levelFlamesSmall: {
    fontSize: 12,
    color: '#999',
  },
  rewardIndicator: {
    marginTop: 4,
  },
  rewardIndicatorText: {
    fontSize: 12,
  },
  nextIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 4,
  },
});
