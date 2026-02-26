import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import * as api from '../services/socialService';

export default function CreatePostScreen() {
  const { isAuthenticated, user } = useAuth();
  const { createPost } = useUser();
  const navigation = useNavigation();

  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [recipeId, setRecipeId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flamesAwarded, setFlamesAwarded] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && postType !== 'recipe_with_photo') {
      setError('Please add some content to your post.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.createPost({
        content: content.trim(),
        post_type: postType,
        recipe_id: recipeId,
        photo_url: photoUrl,
      });

      setContent('');
      setPostType('text');
      setRecipeId(null);
      setPhotoUrl(null);

      // Show flame reward if any
      if (response.flames_awarded && response.flames_awarded > 0) {
        setFlamesAwarded(response.flames_awarded);
        Alert.alert(
          '🔥 Flames Earned!',
          `You earned ${response.flames_awarded} flame${response.flames_awarded > 1 ? 's' : ''} for this post!`
        );
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostTypeChange = (type) => {
    setPostType(type);
    // Reset fields that don't apply to new type
    if (type !== 'recipe' && type !== 'recipe_with_photo') {
      setRecipeId(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          {/* Post Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, postType === 'text' && styles.typeButtonActive]}
              onPress={() => handlePostTypeChange('text')}
            >
              <Text style={[styles.typeButtonText, postType === 'text' && styles.typeButtonTextActive]}>📝 Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, postType === 'recipe' && styles.typeButtonActive]}
              onPress={() => {
                handlePostTypeChange('recipe');
                setShowRecipeSelector(true);
              }}
            >
              <Text style={[styles.typeButtonText, postType === 'recipe' && styles.typeButtonTextActive]}>🍽 Recipe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, postType === 'photo' && styles.typeButtonActive]}
              onPress={() => handlePostTypeChange('photo')}
            >
              <Text style={[styles.typeButtonText, postType === 'photo' && styles.typeButtonTextActive]}>📷 Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, postType === 'recipe_with_photo' && styles.typeButtonActive]}
              onPress={() => {
                handlePostTypeChange('recipe_with_photo');
                setShowRecipeSelector(true);
              }}
            >
              <Text style={[styles.typeButtonText, postType === 'recipe_with_photo' && styles.typeButtonTextActive]}>🍽📷 Recipe+Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Content Input */}
          {(postType === 'text' || postType === 'photo' || postType === 'recipe_with_photo') && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={content}
                onChangeText={setContent}
                placeholder="What's on your mind?"
                multiline
                maxLength={500}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {/* Recipe Selector */}
          {postType === 'recipe' || postType === 'recipe_with_photo' && (
            <TouchableOpacity
              style={styles.recipeSelector}
              onPress={() => setShowRecipeSelector(true)}
            >
              <Text style={styles.recipeSelectorText}>
                {recipeId ? 'Change Recipe' : 'Select Recipe'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Photo Upload */}
          {postType === 'photo' || postType === 'recipe_with_photo' && (
            <TouchableOpacity
              style={styles.photoUploadButton}
              onPress={() => {
                // Photo upload functionality coming soon
                Alert.alert('Coming Soon', 'Photo upload will be available in the next update.');
              }}
            >
              <Text style={styles.photoUploadText}>📷 Upload Photo</Text>
            </TouchableOpacity>
          )}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Flame Info */}
          <View style={styles.flameInfo}>
            <Text style={styles.flameInfoText}>🔥 First 3 posts per day earn flames</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitButton, !content.trim() && postType === 'photo' && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>
              {loading ? '⏳ Creating...' : 'Create Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Recipe Selector Modal */}
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Recipe</Text>
            <TouchableOpacity onPress={() => setShowRecipeSelector(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalText}>
            {flamesAwarded !== null && (
              <Text style={styles.flameAwardText}>
                🎉 You earned {flamesAwarded} flame{flamesAwarded > 1 ? 's' : ''}!
              </Text>
            )}
            {'\n\n'}
            Choose a recipe from your saved recipes or history to attach to your post.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setShowRecipeSelector(false);
              if (recipeId) {
                setRecipeId(recipeId);
              }
            }}
            style={[styles.modalButton, !recipeId && styles.modalButtonDisabled]}
          >
            <Text style={styles.modalButtonText}>
              {recipeId ? 'Confirm Selection' : 'Select Recipe'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  typeButtonActive: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ff6b35',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeSelector: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  recipeSelectorText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  photoUploadButton: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  photoUploadText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c53030',
    fontSize: 14,
    textAlign: 'center',
  },
  flameInfo: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff9c4',
    borderRadius: 8,
    marginBottom: 16,
  },
  flameInfoText: {
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxWidth: '400px',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 24,
    padding: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 1.5,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#ff6b35',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flameAwardText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  backButtonText: {
    fontSize: 20,
    color: '#666',
    paddingRight: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
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
});
