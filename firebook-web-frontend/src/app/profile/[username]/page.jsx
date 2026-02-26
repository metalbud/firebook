'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile, getUserPosts } from '../../lib/api';
import { ProtectedRoute } from '../../contexts/AuthContext';
import UserProfile from '../../components/social/UserProfile';
import UserProfileHeader from '../../components/social/UserProfileHeader';
import UserPostsList from '../../components/social/UserPostsList';

export default function UserProfilePage() {
  const { username } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts(1);
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch by username first (would need endpoint)
      // For now, using a mock approach since we don't have username lookup endpoint
      const response = await getUserProfile(1); // Using user ID 1 as placeholder
      setUserProfile(response.user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (pageNum = 1) => {
    try {
      const response = await getUserPosts(1, { page: pageNum, limit: 20 });
      setUserPosts(response.posts || []);
      setPage(pageNum);
      setHasMore(response.posts && response.posts.length === 20);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Failed to load user posts.');
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      fetchUserPosts(page + 1);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}>
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

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Navigation */}
        <nav style={{
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderBottom: '1px solid #e0e0e0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/feed" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#666' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#ff6b35' }}>
                🔥 Firebook
              </h1>
            </Link>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link href="/feed" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
                Feed
              </Link>
              <Link href="/trending" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
                Trending
              </Link>
              <Link href="/notifications" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
                Notifications
              </Link>
            </div>
          </div>
        </nav>

        {/* Profile Header */}
        {userProfile && (
          <UserProfileHeader user={userProfile} />
        )}

        {/* User Posts */}
        <div style={{ maxWidth: '800px', margin: '20px auto' }}>
          <h2 style={{
            marginBottom: '20px',
            color: '#333',
            fontSize: '24px',
          }}>
            Posts ({userPosts.length})
          </h2>

          {userPosts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              color: '#666',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No posts yet</p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                {userProfile && userProfile.username}'s posts will appear here when they start sharing.
              </p>
            </div>
          ) : (
            <>
              <UserPostsList posts={userPosts} />

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginTop: '20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ff6b35',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#e85a00'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#ff6b35'; }}
                >
                  Load More Posts
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
