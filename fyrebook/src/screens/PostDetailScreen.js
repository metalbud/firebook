import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/socialService';
import PostCard from '../components/social/PostCard';

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsPage, setCommentsPage] = useState(1);

  useEffect(() => {
    fetchPost();
    fetchComments(1);
  }, [postId]);

  const fetchPost = async () => {
    try {
      const postData = await api.getPost(postId);
      setPost(postData);
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', 'Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (page = 1) => {
    if (commentsLoading) return;
    setCommentsLoading(true);

    try {
      const response = await api.getComments(postId, { page, limit: 10 });

      if (page === 1) {
        setComments(response.comments || []);
      } else {
        setComments(prev => [...prev, ...(response.comments || [])]);
      }

      setCommentsPage(page);
      setHasMoreComments(response.comments && response.comments.length === 10);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLoadMoreComments = () => {
    if (hasMoreComments && !commentsLoading) {
      fetchComments(commentsPage + 1);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const commentData = await api.addComment(postId, newComment.trim());
      setComments(prev => [commentData, ...prev]);
      setNewComment('');
      setPost(prev => ({
        ...prev,
        comments_count: prev.comments_count + 1,
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.deleteComment(commentId);
              setComments(prev => prev.filter(c => c.id !== commentId));
              setPost(prev => ({
                ...prev,
                comments_count: prev.comments_count - 1,
              }));
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.deletePost(postId);
              Alert.alert('Success', 'Post deleted successfully.');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          {user && user.id === post.user_id && (
            <TouchableOpacity onPress={handleDeletePost} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Post Content */}
          <PostCard post={post} />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({post.comments_count || 0})
            </Text>

            {/* Add Comment Input */}
            {user && (
              <View style={styles.commentInputContainer}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[
                    styles.submitCommentButton,
                    (!newComment.trim() || submittingComment) && styles.disabledButton
                  ]}
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size={20} color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Comments List */}
            <View style={styles.commentsList}>
              {comments.length === 0 && !commentsLoading ? (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No comments yet</Text>
                  <Text style={styles.emptySubtext}>
                    Be the first to comment on this post!
                  </Text>
                </View>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                        {comment.is_verified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={8} color="#fff" />
                          </View>
                        )}
                        <Text style={styles.commentTimestamp}>
                          {formatDate(comment.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      {user && user.id === comment.user_id && (
                        <TouchableOpacity
                          style={styles.deleteCommentButton}
                          onPress={() => handleDeleteComment(comment.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}

              {commentsLoading && comments.length > 0 && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#ff6b35" />
                  <Text style={styles.loadingMoreText}>Loading more comments...</Text>
                </View>
              )}

              {hasMoreComments && !commentsLoading && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMoreComments}
                >
                  <Text style={styles.loadMoreText}>Load More Comments</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  submitCommentButton: {
    backgroundColor: '#ff6b35',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  commentsList: {
    marginTop: 16,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  verifiedBadge: {
    backgroundColor: '#3b82f6',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  deleteCommentButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    padding: 4,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
