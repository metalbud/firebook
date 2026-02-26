'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import Link from 'next/link';
import { deletePost } from '../../lib/api';

export default function UserPostsList({ posts }) {
  const [deletingPost, setDeletingPost] = useState(null);
  const { profile: currentUserProfile } = useUser();

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeletingPost(postId);
    try {
      await deletePost(postId);
      // Remove post from list
      window.location.reload();
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingPost(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#999',
      }}>
        <p>No posts to display</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {posts.map((post, index) => (
        <div
          key={post.id || index}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {/* Post Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar user={post} size="medium" />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    href={`/profile/${post.user_id}`}
                    style={{
                      textDecoration: 'none',
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '18px',
                    }}
                  >
                    {post.username}
                  </Link>

                  <span style={{
                    fontSize: '12px',
                    color: '#999',
                    marginLeft: '8px',
                  }}>
                    • {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {currentUserProfile && currentUserProfile.id === post.user_id && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingPost === post.id}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: deletingPost === post.id ? '#e8e8e8' : '#fee',
                      color: deletingPost === post.id ? '#999' : '#c53030',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: deletingPost === post.id ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {deletingPost === post.id ? '⏳' : '🗑️'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div style={{ padding: '16px' }}>
            {post.content && (
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333',
                margin: '0 0 12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {post.content}
              </p>
            )}

            {post.photo_url && (
              <div style={{
                marginBottom: '12px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}>
                <img
                  src={post.photo_url}
                  alt="Post photo"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {post.recipe_data && typeof post.recipe_data === 'object' && (
              <div style={{
                backgroundColor: '#fff9c4',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}>
                  🍽 Recipe
                </div>
                {post.recipe_data.title && (
                  <h3 style={{
                    margin: '0 0 8px',
                    color: '#333',
                    fontSize: '18px',
                  }}>
                    {post.recipe_data.title}
                  </h3>
                )}
              </div>
            )}

            {post.recipe_id && (
              <Link
                href={`/recipes/${post.recipe_id}`}
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                View Recipe
              </Link>
            )}
          </div>

          {/* Post Footer */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '16px' }}>❤️</span>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                {post.likes_count || 0}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '16px' }}>💬</span>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                {post.comments_count || 0}
              </span>
            </div>

            <Link
              href={`/post/${post.id}`}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              View Post
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
