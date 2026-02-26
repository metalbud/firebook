import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { followUser, unfollowUser } from '../../services/socialService';

export default function FollowButton({ userId, isFollowing, onFollowChange, style, textStyle }) {
  const [loading, setLoading] = useState(false);
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (localIsFollowing) {
        await unfollowUser(userId);
        setLocalIsFollowing(false);
      } else {
        await followUser(userId);
        setLocalIsFollowing(true);
      }

      if (onFollowChange) {
        onFollowChange(!localIsFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        localIsFollowing ? styles.followingButton : styles.followButton,
        style,
      ]}
      onPress={handleFollow}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size={16} color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>
          {localIsFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#ff6b35',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
