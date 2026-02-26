'use client';

import { useFeed } from '../../contexts/FeedContext';
import PostForm from './PostForm';

export default function Feed() {
  const {
    posts,
    loading,
    error,
    hasMore,
    feedType,
    loadMore,
    refreshFeed,
    setFeedType,
  } = useFeed();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Feed Header */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            color: '#333',
          }}>
            🔥 Firebook
          </h1>

          {/* Feed Type Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFeedType('global')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: feedType === 'global' ? '#ff6b35' : '#e0e0e0',
                color: feedType === 'global' ? '#ffffff' : '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              🌍 Global
            </button>

            <button
              onClick={() => setFeedType('following')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: feedType === 'following' ? '#ff6b35' : '#e0e0e0',
                color: feedType === 'following' ? '#ffffff' : '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              👥 Following
            </button>

            <button
              onClick={() => setFeedType('trending')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: feedType === 'trending' ? '#ff6b35' : '#e0e0e0',
                color: feedType === 'trending' ? '#ffffff' : '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              📈 Trending
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshFeed}
            disabled={loading}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Create Post Form */}
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <PostForm onSuccess={(flamesAwarded) => {
          if (flamesAwarded > 0) {
            alert(`🔥 You earned ${flamesAwarded} flames for this post!`);
          }
        }} />
      </div>

      {/* Feed Content */}
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {loading && posts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Loading posts...</p>
          </div>
        )}

        {!loading && posts.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p>No posts yet. Be the first to share!</p>
            <p style={{ fontSize: '14px', fontStyle: 'italic' }}>
              {feedType === 'global' && "Posts from all users will appear here."}
              {feedType === 'following' && "Posts from users you follow will appear here."}
              {feedType === 'trending' && "Trending posts will appear here."}
            </p>
          </div>
        )}

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post, index) => (
            <div
              key={post.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
            >
              {/* Post Card would go here - using inline for now */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  {/* Avatar */}
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

                  {/* User Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: '#333' }}>
                      {post.username}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      • {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {/* Content */}
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

                {/* Photo */}
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

                {/* Recipe Data */}
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
                      <h3 style={{ margin: '0 0 8px', color: '#333', fontSize: '18px' }}>
                        {post.recipe_data.title}
                      </h3>
                    )}
                  </div>
                )}

                {/* Stats Bar */}
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
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

                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      style={{
                        padding: '6px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#ff6b35',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      View Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <button
            onClick={loadMore}
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
              marginTop: '24px',
            }}
          >
            {loading ? '⏳ Loading...' : 'Load More Posts'}
          </button>
        )}
      </div>

      {/* Fade In Animation Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0,
            transform: translateY(20px);
          }
          to {
            opacity: 1,
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
