import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/socialService';

export default function FollowingScreen({ route }) {
  const { isAuthenticated, user } = useAuth();
  const { userId } = route.params;
  const navigation = useNavigation();

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    fetchFollowing(1);
  }, [userId, isAuthenticated]);

  const fetchFollowing = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await api.getFollowing(userId, { page: pageNum, limit: 20 });
      setFollowing(response.following || []);
      setPage(pageNum);
      setHasMore(response.following && response.following.length === 20);
    } catch (err) {
      console.error('Error fetching following:', err);
      Alert.alert('Error', 'Failed to load following. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchFollowing(page + 1);
    }
  };

  const handleFollow = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.unfollowUser(targetUserId);
        setFollowing(prev => prev.filter(u => u.id !== targetUserId));
      } else {
        await api.followUser(targetUserId);
        setFollowing(prev => [...prev, { id: user.id, username: user.username }]);
      }
    } catch (err) {
      console.error('Error following/unfollowing:', err);
      Alert.alert('Error', 'Failed to update follow. Please try again.');
    }
  };

  const renderFollowing = ({ item }) => (
    <View style={styles.followingItem}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {item.username?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      <View style={styles.followingInfo}>
        <Text style={styles.followingName}>{item.username}</Text>
        {item.is_verified && (
          <Text style={styles.verifiedBadge}> ✓</Text>
        )}
        <Text style={styles.followingMeta}>
          {item.bio ? '• ' : ''}
          {item.badges && item.badges.length > 0 && ` • ${item.badges.length} badges`}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.followButton}
        onPress={() => handleFollow(item.id, !!item.is_following)}
        disabled={user && user.id === item.id}
      >
        <Text style={styles.followButtonText}>
          {item.is_following ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
        <Text style={styles.subtitle}>{following.length} following</Text>
      </View>

      {/* Content */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#666666" />
          <Text style={styles.loadingText}>Loading following...</Text>
        </View>
      )}

      {!loading && following.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>Not following anyone yet</Text>
          <Text style={styles.emptySubText}>
            When {user.username} follows other users, they'll appear here.
          </Text>
        </View>
      )}

      {!loading && following.length > 0 && (
        <FlatList
          data={following}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFollowing}
          onEndReached={handleLoadMore}
          ListFooterComponent={() => {
            if (!hasMore || loading) {
              return <ActivityIndicator style={styles.loader} />;
            }
            return (
              <TouchableOpacity
                onPress={handleLoadMore}
                style={styles.loadMoreButton}
                disabled={loading}
              >
                <Text style={styles.loadMoreText}>
                  {loading ? 'Loading...' : 'Load More'}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 20,
    color: '#666',
    paddingRight: 8,
  },
  logoutButton: {
    backgroundColor: '#fee',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholder: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  avatarText: {
    color: '#fff',
  },
  followingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  followingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  followingMeta: {
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  followButton: {
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    minWidth: 80,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
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
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  loader: {
    padding: 20,
  },
  loadMoreButton: {
    padding: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});
