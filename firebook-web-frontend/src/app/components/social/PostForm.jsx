'use client';

import { useState } from 'react';
import { createPost } from '../../lib/api';
import { useFeed } from '../../contexts/FeedContext';

export default function PostForm({ onSuccess }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [recipeId, setRecipeId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addPost } = useFeed();
  const { profile: userProfile } = useUser();

  const characterCount = content.length;
  const maxChars = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && postType !== 'recipe_with_photo') {
      setError('Please add some content to your post.');
      return;
    }

    if (characterCount > maxChars) {
      setError(`Post is too long. Maximum ${maxChars} characters.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createPost({
        content: content.trim(),
        post_type: postType,
        recipe_id: recipeId,
        photo_url: photoUrl,
      });

      // Reset form
      setContent('');
      setPostType('text');
      setRecipeId(null);
      setPhotoUrl(null);

      // Add post to feed
      const newPost = {
        id: response.post_id,
        content: content.trim(),
        post_type: postType,
        recipe_id: recipeId,
        photo_url: photoUrl,
        user: userProfile,
        username: userProfile.username,
        avatar_url: userProfile.avatar_url,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
      };

      addPost(newPost);

      // Reset form state
      setFlamesAwarded(response.flames_awarded || 0);

      if (onSuccess) {
        onSuccess(response.flames_awarded || 0);
      }
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      <h3 style={{
        marginBottom: '16px',
        color: '#333',
        fontSize: '20px',
      }}>
        Create New Post
      </h3>

      {/* Post Type Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          onClick={() => handlePostTypeChange('text')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: postType === 'text' ? '#ff6b35' : '#e0e0e0',
            color: postType === 'text' ? '#ffffff' : '#666',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          📝 Text
        </button>

        <button
          type="button"
          onClick={() => handlePostTypeChange('recipe')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: postType === 'recipe' ? '#ff6b35' : '#e0e0e0',
            color: postType === 'recipe' ? '#ffffff' : '#666',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          🍽 Recipe
        </button>

        <button
          type="button"
          onClick={() => handlePostTypeChange('photo')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: postType === 'photo' ? '#ff6b35' : '#e0e0e0',
            color: postType === 'photo' ? '#ffffff' : '#666',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          📷 Photo
        </button>

        <button
          type="button"
          onClick={() => handlePostTypeChange('recipe_with_photo')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: postType === 'recipe_with_photo' ? '#ff6b35' : '#e0e0e0',
            color: postType === 'recipe_with_photo' ? '#ffffff' : '#666',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          🍽📷 Recipe + Photo
        </button>
      </div>

      {/* Post Content */}
      {(postType === 'text' || postType === 'photo' || postType === 'recipe_with_photo') && (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={maxChars}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '12px',
            color: characterCount > maxChars ? '#dc2626' : '#666',
          }}>
            <span>{characterCount}</span>
            <span> / {maxChars}</span>
          </div>
        </div>
      )}

      {/* Recipe Selector Placeholder */}
      {postType === 'recipe' || postType === 'recipe_with_photo' && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
        }}>
          🍽 Recipe selector coming soon...
        </div>
      )}

      {/* Photo Upload Placeholder */}
      {(postType === 'photo' || postType === 'recipe_with_photo') && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
        }}>
          📷 Photo upload coming soon...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c53030',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {/* Flame Info */}
      <div style={{
        fontSize: '12px',
        color: '#666',
        textAlign: 'center',
        marginTop: '8px',
      }}>
        🔥 First 3 posts per day earn flames • Unlimited posting available
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: loading ? '#e8e8e8' : '#ff6b35',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#e85a00'; }}
        onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#ff6b35'; }}
      >
        {loading ? '⏳ Posting...' : 'Post'}
      </button>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={() => {
          setContent('');
          setPostType('text');
          setRecipeId(null);
          setPhotoUrl(null);
          setError('');
        }}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#666',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '12px',
          transition: 'background-color 0.2s',
        }}
      >
        Cancel
      </button>
    </form>
  );
}
