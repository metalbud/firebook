import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import * as api from '../services/socialService';
import FeedFilter from '../components/social/FeedFilter';
import CreatePostModal from '../components/social/CreatePostModal';
import PostCard from '../components/social/PostCard';

export default function FeedScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const { posts, loading, error, hasMore, feedType, refreshFeed, loadMore } = useFeed();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated && navigation.isFocused()) {
      navigation.replace('Login');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (isAuthenticated && feedType) {
      refreshFeed();
    }
  }, [feedType]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  const handleCreatePost = () => {
    setIsModalVisible(true);
  };

  const handleRefresh = () => {
    refreshFeed();
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={() => {}}
      onComment={() => {}}
      onUserPress={() => navigation.navigate('UserProfile', { userId: item.user_id })}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>📝</Text>
      </View>
      <Text style={styles.emptyText}>No posts yet</Text>
      <Text style={styles.emptySubText}>
        {feedType === 'global' && 'Posts from all users will appear here.'}
        {feedType === 'following' && 'Posts from users you follow will appear here.'}
        {feedType === 'trending' && 'Trending posts will appear here.'}
      </Text>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.emptyButton}
      >
        <Text style={styles.emptyButtonText}>Create First Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore || loading) {
      return null;
    }

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 Firebook</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile')}
            style={styles.profileButton}
          >
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={logout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Filter */}
        <View style={styles.filterContainer}>
          <FeedFilter feedType={feedType} onFeedTypeChange={() => {}} />
        </View>

        {/* Feed Content */}
        <FlatList
          ref={flatListRef}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {feedType === 'global' && 'Global Feed'}
                {feedType === 'following' && 'Following'}
                {feedType === 'trending' && 'Trending'}
              </Text>
            </View>
          )}
          ListEmptyComponent={renderEmptyState}
          onEndReached={handleLoadMore}
          onRefresh={handleRefresh}
          refreshing={loading}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor="#666666"
              colors={['#e0e0e0', '#666666']}
            />
          }
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

        {/* Create Post FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePost}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Create Post Modal */}
        <CreatePostModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onPostCreated={() => {
            refreshFeed();
            setIsModalVisible(false);
          }}
        />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  profileButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  profileButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fee',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  listHeader: {
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
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
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    padding: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
});
