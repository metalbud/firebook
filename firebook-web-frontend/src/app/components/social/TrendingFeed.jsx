'use client';

import { useEffect } from 'react';
import { getTrendingPosts } from '../../lib/api';
import PostCard from './PostCard';

export default function TrendingFeed({ timePeriod = 'today' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTrendingPosts();
  }, [timePeriod]);

  const fetchTrendingPosts = async () => {
    setLoading(true);
    try {
      const response = await getTrendingPosts({ timePeriod, limit: 20 });
      setPosts(response.posts || []);
      setPage(1);
      setHasMore(response.posts && response.posts.length === 20);
    } catch (err) {
      console.error('Error fetching trending posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchTrendingPosts();
    }
  };

  const handleTimePeriodChange = (newPeriod) => {
    setPage(1);
    fetchTrendingPosts();
  };

  return (
    <div>
      {/* Time Period Filter */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {['today', 'week', 'month'].map((period) => (
          <button
            key={period}
            onClick={() => handleTimePeriodChange(period)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: timePeriod === period ? '#ff6b35' : '#e0e0e0',
              color: timePeriod === period ? '#ffffff' : '#666',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Trending Posts */}
      {loading && posts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Loading trending posts...</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
            Trending {timePeriod} • {posts.length} posts
          </div>

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

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
                marginTop: '24px',
              }}
            >
              {loading ? '⏳ Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
