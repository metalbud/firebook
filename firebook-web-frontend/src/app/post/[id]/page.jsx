'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPost, likePost, unlikePost, deletePost } from '../../lib/api';
import { ProtectedRoute } from '../../contexts/AuthContext';
import CommentSection from '../../components/social/CommentSection';
import LikeButton from '../../components/social/LikeButton';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPost(id);
      setPost(response.post);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await deletePost(id);
      router.push('/feed');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <div style={{
          backgroundColor: '#fee',
          color: '#c53030',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <div style={{ fontSize: '18px', color: '#999' }}>Post not found</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Navigation */}
        <nav style={{
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <Link
            href="/feed"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f5f5f5'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#ffffff'; }}
          >
            ← Back to Feed
          </Link>

          <span style={{ margin: '0 16px', color: '#e0e0e0' }}>•</span>

          <span style={{ fontSize: '14px', color: '#999', margin: '0 16px' }}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </nav>
      </div>

      {/* Post Content */}
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        {/* Post Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: post.avatar_url ? '#e0e0e0' : '#ff6b35',
                backgroundImage: post.avatar_url ? `url(${post.avatar_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}>
                {post.avatar_url ? null : post.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    href={`/profile/${post.user_id}`}
                    style={{
                      textDecoration: 'none',
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '20px',
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
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <LikeButton post={post} />
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: loading ? '#e8e8e8' : '#fee',
                  color: loading ? '#999' : '#666',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div style={{ marginTop: '16px' }}>
            {post.content && (
              <p style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#333',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: '16px',
              }}>
                {post.content}
              </p>
            )}

            {post.photo_url && (
              <div style={{
                marginBottom: '16px',
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
                    maxHeight: '600px',
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
                padding: '20px',
                marginBottom: '16px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}>
                  🍽 Recipe
                </div>

                {post.recipe_data.title && (
                  <h3 style={{
                    margin: '0 0 12px',
                    color: '#333',
                    fontSize: '24px',
                  }}>
                    {post.recipe_data.title}
                  </h3>
                )}

                {post.recipe_data.description && (
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '12px',
                  }}>
                    {post.recipe_data.description}
                  </p>
                )}

                {post.recipe_data.category && (
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '8px',
                  }}>
                    <strong>Category:</strong> {post.recipe_data.category}
                  </div>
                )}

                {post.recipe_data.servings && (
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '8px',
                  }}>
                    <strong>Servings:</strong> {post.recipe_data.servings}
                  </div>
                )}

                {post.recipe_data.cooking_time && (
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '8px',
                  }}>
                    <strong>Cooking Time:</strong> {post.recipe_data.cooking_time} min
                  </div>
                )}

                {post.recipe_data.difficulty && (
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '8px',
                  }}>
                    <strong>Difficulty:</strong> {post.recipe_data.difficulty}
                  </div>
                )}

                {post.recipe_id && (
                  <Link
                    href={`/recipes/${post.recipe_id}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '16px',
                      padding: '10px 20px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    View Full Recipe →
                  </Link>
                )}
              </div>
            )}

            {/* Stats Bar */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #f0f0f0',
              padding: '16px 24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>❤️</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                  {post.likes_count || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Likes</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>💬</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                  {post.comments_count || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Comments</div>
              </div>

              <Link
                href={`/post/${id}`}
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
                View Post with All Comments
              </Link>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ marginTop: '24px' }}>
            <CommentSection post={post} />
          </div>

          {/* Recipe Link (if recipe post) */}
          {post.recipe_id && (
            <div style={{
              backgroundColor: '#3b82f6',
              padding: '16px 24px',
              borderRadius: '8px',
              marginTop: '24px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '8px',
              }}>
                This post includes a recipe. View the full recipe with detailed instructions and ingredients.
              </p>
              <Link
                href={`/recipes/${post.recipe_id}`}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid #e85a00',
                }}
              >
                View Recipe →
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
