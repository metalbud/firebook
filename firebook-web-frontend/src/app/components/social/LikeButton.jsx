'use client';

import { useState, useEffect } from 'react';
import { likePost, unlikePost } from '../../lib/api';

export default function LikeButton({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setIsLiked(post.is_liked || false);
  }, [post.id, post.is_liked]);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await likePost(post.id);
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await unlikePost(post.id);
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } catch (err) {
      console.error('Error unliking post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (isLiked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '20px',
        backgroundColor: 'transparent',
        color: '#666',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isLiked ? '#fee2e2' : '#ffeee8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span
        style={{
          fontSize: animating ? '24px' : '20px',
          transition: 'transform 0.1s',
          transform: animating ? 'scale(1.3)' : 'scale(1)',
          display: 'inline-block',
        }}
      >
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span
        style={{
          fontWeight: '600',
          fontSize: '14px',
        }}
      >
        {likeCount}
      </span>
    </button>
  );
}
