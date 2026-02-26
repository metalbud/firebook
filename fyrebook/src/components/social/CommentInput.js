import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { addComment } from '../../services/socialService';

export default function CommentInput({ postId, onCommentAdded, placeholder = 'Write a comment...' }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || !user) return;

    setLoading(true);
    try {
      const commentData = await addComment(postId, comment.trim());
      setComment('');

      if (onCommentAdded) {
        onCommentAdded(commentData);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return (
      <View style={styles.loginPrompt}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <Text style={styles.loginPromptText}>
          Log in to comment on posts
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
          onKeyPress={handleKeyPress}
          textAlignVertical="top"
          editable={!loading}
        />
        <Text style={styles.charCount}>
          {comment.length}/500
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!comment.trim() || loading) && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={!comment.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator size={20} color="#fff" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 40,
    maxHeight: 120,
    paddingRight: 60,
  },
  charCount: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
