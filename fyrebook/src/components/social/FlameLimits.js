import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Progress, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/socialService';

export default function FlameLimits() {
  const { user } = useAuth();
  const [flameData, setFlameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsToday, setPostsToday] = useState(0);

  useEffect(() => {
    fetchFlameData();
  }, []);

  const fetchFlameData = async () => {
    try {
      setLoading(true);
      // This would be a new API endpoint for flame limits
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Loading flame data...</Text>
        </View>
      </View>
    );
  }

  const MAX_FLAME_POSTS_PER_DAY = 3;
  const remainingFlamePosts = Math.max(0, MAX_FLAME_POSTS_PER_DAY - postsToday);
  const canEarnFlames = postsToday < MAX_FLAME_POSTS_PER_DAY;
  const progress = Math.min(1, postsToday / MAX_FLAME_POSTS_PER_DAY);

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Main Flame Limit Card */}
        <View style={styles.mainCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🔥 Daily Flame Limits</Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={[styles.progressValue, canEarnFlames ? styles.progressValueEarn : styles.progressValueMaxed]}>
                {postsToday}/{MAX_FLAME_POSTS_PER_DAY}
              </Text>
            </View>
            <Progress.Bar
              progress={progress}
              width={null}
              height={12}
              unfilledColor="#e0e0e0"
              color={canEarnFlames ? "#ff6b35" : "#999"}
              borderWidth={0}
            />
          </View>

          {/* Remaining Posts Counter */}
          <View style={[
            styles.remainingCard,
            canEarnFlames ? styles.remainingEarn : styles.remainingMaxed
          ]}>
            <Text style={styles.remainingIcon}>📝</Text>
            <Text style={styles.remainingNumber}>{remainingFlamePosts}</Text>
            <Text style={styles.remainingText}>
              {canEarnFlames ? 'More posts can earn flames today!' : 'No more flame-earning posts available today'}
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            {/* Flame Multiplier Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⚡</Text>
              <Text style={styles.infoTitle}>Flame Rewards</Text>
              <View style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <View style={[styles.bullet, styles.bulletBlue]} />
                  <Text style={styles.infoText}>Text posts: 1 flame each</Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={[styles.bullet, styles.bulletPurple]} />
                  <Text style={styles.infoText}>Recipe posts: 2 flames each</Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={[styles.bullet, styles.bulletPink]} />
                  <Text style={styles.infoText}>Recipe + Photo: 3 flames each</Text>
                </View>
              </View>
            </View>

            {/* Reset Timer */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoTitle}>Daily Reset</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>Flame limits reset at midnight</Text>
                <Text style={styles.infoSubtext}>
                  Tomorrow you'll have {MAX_FLAME_POSTS_PER_DAY} flame-earning posts available again
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Engagement Rewards Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>💎 Bonus Flame Rewards</Text>

          <View style={styles.milestoneSection}>
            <Text style={styles.milestoneTitle}>Post Milestones</Text>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneItem}>
                <Text style={styles.milestoneCount}>10 likes:</Text>
                <Text style={styles.milestoneReward}>+2 flames bonus</Text>
              </View>
              <View style={styles.milestoneItem}>
                <Text style={styles.milestoneCount}>25 likes:</Text>
                <Text style={styles.milestoneReward}>+5 flames bonus</Text>
              </View>
              <View style={styles.milestoneItem}>
                <Text style={styles.milestoneCount}>50 likes:</Text>
                <Text style={styles.milestoneReward}>+10 flames bonus 🔥</Text>
              </View>
            </View>
          </View>

          <View style={styles.limitsSection}>
            <Text style={styles.limitsTitle}>Daily Engagement Limits</Text>
            <View style={styles.limitsContent}>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Comments:</Text>
                <Text style={styles.limitValue}>50 per day</Text>
              </View>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Likes:</Text>
                <Text style={styles.limitValue}>100 per day</Text>
              </View>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Follows:</Text>
                <Text style={styles.limitValue}>50 per day</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Flame Earning Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📚 Tips to Earn More Flames</Text>
          <View style={styles.tipsContent}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Post early in the day to maximize flame-earning opportunities
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>📝</Text>
              <Text style={styles.tipText}>
                Combine text with recipes or photos for higher flame rewards
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🤝</Text>
              <Text style={styles.tipText}>
                Engage with others (like, comment, follow) to earn engagement flames
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🔥</Text>
              <Text style={styles.tipText}>
                Help your posts go viral (50+ likes) for bonus flames!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  mainCard: {
    backgroundColor: '#fff5ed',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  headerDate: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6b35',
  },
  progressValueEarn: {
    color: '#10b981',
  },
  progressValueMaxed: {
    color: '#999',
  },
  remainingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  remainingEarn: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  remainingMaxed: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  remainingIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  remainingNumber: {
    fontSize: 36,
    fontWeight: '700',
    marginRight: 12,
  },
  remainingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoContent: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  bulletBlue: {
    backgroundColor: '#3b82f6',
  },
  bulletPurple: {
    backgroundColor: '#9333ea',
  },
  bulletPink: {
    backgroundColor: '#ec4899',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#999',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  milestoneSection: {
    marginBottom: 20,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
    paddingLeft: 12,
  },
  milestoneContent: {
    gap: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
    marginRight: 8,
  },
  milestoneReward: {
    fontSize: 14,
    color: '#666',
  },
  limitsSection: {
    marginTop: 20,
  },
  limitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 12,
  },
  limitsContent: {
    gap: 8,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginRight: 8,
  },
  limitValue: {
    fontSize: 14,
    color: '#666',
  },
  tipsCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e879f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  tipsContent: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
