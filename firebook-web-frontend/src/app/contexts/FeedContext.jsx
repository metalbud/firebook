'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { getPosts, getMyFeed, getTrendingPosts } from '../lib/api';

/**
 * FeedContext for managing feed state
 */
const FeedContext = createContext(null);

/**
 * Custom hook to use FeedContext
 * @returns {object} Feed context value
 */
export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};

/**
 * FeedProvider component
 * @param {object} props Component props
 */
export const FeedProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [feedType, setFeedType] = useState('global'); // 'global', 'following', 'trending'

  /**
   * Fetch posts based on current feed type
   */
  const fetchPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (feedType) {
        case 'following':
          response = await getMyFeed({ page: pageNum, limit: 20 });
          break;
        case 'trending':
          response = await getTrendingPosts({ timePeriod: 'today', limit: 20 });
          break;
        case 'global':
        default:
          response = await getPosts({ page: pageNum, limit: 20 });
          break;
      }

      if (pageNum === 1) {
        setPosts(response.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.posts || [])]);
      }

      setPage(pageNum);
      setHasMore(response.posts && response.posts.length === 20);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [feedType]);

  /**
   * Refresh feed (reset to page 1)
   */
  const refreshFeed = useCallback(() => {
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  /**
   * Load more posts
   */
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  }, [hasMore, loading, page, fetchPosts]);

  /**
   * Set feed type
   * @param {string} type 'global', 'following', 'trending'
   */
  const setFeedTypeHandler = useCallback((type) => {
    setFeedType(type);
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  /**
   * Add new post to feed
   * @param {object} post New post data
   */
  const addPost = useCallback((post) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  /**
   * Update post in feed
   * @param {number} postId Post ID to update
   * @param {object} updates Post updates
   */
  const updatePost = useCallback((postId, updates) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, ...updates } : p))
    );
  }, []);

  /**
   * Remove post from feed
   * @param {number} postId Post ID to remove
   */
  const removePost = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  /**
   * Context value
   */
  const value = {
    posts,
    loading,
    error,
    hasMore,
    page,
    feedType,
    refreshFeed,
    loadMore,
    setFeedType: setFeedTypeHandler,
    addPost,
    updatePost,
    removePost,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export default FeedContext;
