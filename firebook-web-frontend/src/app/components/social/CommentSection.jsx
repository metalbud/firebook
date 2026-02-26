'use client';

import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { addComment, getComments, updateComment, deleteComment } from '../../lib/api';

export default function CommentSection({ post }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { profile: userProfile } = useUser();

  useEffect(() => {
    fetchComments(1);
  }, [post.id]);

  const fetchComments = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await getComments(post.id, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setComments(response.comments || []);
      } else {
        setComments(prev => [...prev, ...(response.comments || [])]);
      }
      setPage(pageNum);
      setHasMore(response.comments && response.comments.length === 20);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    if (newComment.length > 500) {
      alert('Comment too long. Maximum 500 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await addComment(post.id, { content: newComment.trim() });
      const newCommentData = {
        id: response.comment_id,
        content: newComment.trim(),
        user: userProfile,
        username: userProfile.username,
        avatar_url: userProfile.avatar_url,
        created_at: new Date().toISOString(),
        likes_count: 0,
      };

      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await updateComment(commentId, { content: newContent });
      setComments(prev =>
        prev.map(c => (c.id === commentId ? { ...c, content: newContent } : c))
      );
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const canEditOrDelete = (comment) => {
    return userProfile && comment.user_id === userProfile.id;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        Loading comments...
      </div>
    );
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{
        marginBottom: '20px',
        color: '#333',
        fontSize: '20px',
      }}>
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          disabled={submitting}
          style={{
            width: '100%',
            minHeight: '80px',
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
        }}>
          <span style={{ fontSize: '12px', color: '#999' }}>
            {newComment.length} / 500
          </span>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: submitting ? '#e8e8e8' : '#ff6b35',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '⏳' : 'Post'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 && !loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            fontStyle: 'italic',
          }}>
            No comments yet. Be the first to comment!
          </div>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Avatar and Username */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar user={comment} size="small" />

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '16px',
                  }}>
                    {comment.username}
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px',
                  }}>
                    • {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Edit/Delete Actions */}
                {canEditOrDelete(comment) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const newContent = prompt('Edit your comment:', comment.content);
                        if (newContent && newContent.trim()) {
                          handleUpdateComment(comment.id, newContent.trim());
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#fee',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Content */}
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333',
              margin: '8px 0 0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {comment.content}
            </p>

            {/* Like Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#999',
            }}>
              <span>❤️</span>
              <span>{comment.likes_count || 0}</span>
            </div>
          </div>
        ))}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Loading...' : 'Load More Comments'}
          </button>
        )}
      </div>
    </div>
  );
}
