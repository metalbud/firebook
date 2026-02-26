import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { likePost, unlikePost } from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post, onLike, onComment, onUserPress }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }

      if (onLike) {
        onLike(post.id, !liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post.id);
    } else {
      navigation.navigate('PostDetail', { postId: post.id });
    }
  };

  const handleUserPress = () => {
    if (onUserPress) {
      onUserPress(post.user_id);
    } else {
      navigation.navigate('ProfileTab'); // Navigate to current user's profile for now
    }
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

  const renderPostTypeIcon = () => {
    switch (post.post_type) {
      case 'recipe':
        return '🍽️ ';
      case 'photo':
        return '📷 ';
      case 'recipe_with_photo':
        return '🍽️📷 ';
      default:
        return '📝 ';
    }
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.username?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {post.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.content}>
        {/* Post Type Badge */}
        <View style={styles.postTypeBadge}>
          <Text style={styles.postTypeText}>
            {renderPostTypeIcon()}
          </Text>
        </View>

        {/* Text Content */}
        {post.content && (
          <Text style={styles.textContent}>{post.content}</Text>
        )}

        {/* Photo */}
        {post.photo_url && (
          <Image
            source={{ uri: post.photo_url }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}

        {/* Recipe Card */}
        {post.recipe && (
          <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => navigation.navigate('RecipeDetails', { recipeId: post.recipe.id })}
          >
            <View style={styles.recipeHeader}>
              <Text style={styles.recipeTypeIcon}>🍽️</Text>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {post.recipe.title}
                </Text>
                {post.recipe.category && (
                  <Text style={styles.recipeCategory}>{post.recipe.category}</Text>
                )}
              </View>
            </View>
            {post.recipe.description && (
              <Text style={styles.recipeDescription} numberOfLines={2}>
                {post.recipe.description}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Post Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, liked && styles.likedButton]}
          onPress={handleLike}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={20} color="#ff6b35" />
          ) : (
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? '#ff6b35' : '#666'}
            />
          )}
          <Text style={[styles.actionText, liked && styles.likedText]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>
            {post.comments_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Share functionality placeholder
            console.log('Share post:', post.id);
          }}
        >
          <Ionicons name="share-outline" size={24} color="#666" />
        </TouchableOpacity>

        {user && user.id === post.user_id && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Delete post functionality placeholder
              console.log('Delete post:', post.id);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  verifiedBadge: {
    backgroundColor: '#3b82f6',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  postTypeBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  postTypeText: {
    fontSize: 16,
  },
  textContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  likedButton: {
    color: '#ff6b35',
  },
  likedText: {
    color: '#ff6b35',
    fontWeight: '600',
  },
});
