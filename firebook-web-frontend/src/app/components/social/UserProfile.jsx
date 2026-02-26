'use client';

import { useUser } from '../../contexts/UserContext';
import { followUser, unfollowUser } from '../../lib/api';
import Avatar from './Avatar';

export default function UserProfile({ user }) {
  const { profile: currentUserProfile } = useUser();
  const [loading, setLoading] = useState(false);

  const isOwnProfile = currentUserProfile && currentUserProfile.id === user.id;

  const handleFollow = async () => {
    setLoading(true);
    try {
      await followUser(user.id);
      setLoading(false);
    } catch (err) {
      console.error('Error following user:', err);
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      await unfollowUser(user.id);
      setLoading(false);
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* User Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <Avatar user={user} size="large" />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              color: '#333',
            }}>
              {user.username}
            </h1>

            {user.is_verified && (
              <span style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                marginLeft: '8px',
              }}>
                ✓ Verified
              </span>
            )}
          </div>

          {user.bio && (
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '8px 0 0',
              lineHeight: '1.5',
            }}>
              {user.bio}
            </p>
          )}

          {!user.bio && (
            <p style={{ fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
              No bio yet
            </p>
          )}

          <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
            Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Follow/Unfollow Button */}
        {!isOwnProfile && (
          <button
            onClick={loading ? null : () => {})}
            style={{
              padding: '12px 24px',
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
            {loading ? '⏳' : 'Follow'}
          </button>
        )}

        {isOwnProfile && (
          <button
            disabled
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#e8e8e8',
              color: '#999',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'not-allowed',
            }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        maxWidth: '600px',
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e0e0e0',
          transition: 'transform 0.2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
            {user.posts_count || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>Posts</div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e0e0e0',
          transition: 'transform 0.2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
            {user.followers_count || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>Followers</div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e0e0e0',
          transition: 'transform 0.2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
            {user.following_count || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>Following</div>
        </div>
      </div>

      {/* Badges Display */}
      {user.badges && user.badges.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#333',
          }}>
            Badges
          </h3>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            {user.badges.map((badge) => (
              <div
                key={badge}
                style={{
                  backgroundColor: '#fff9c4',
                  color: '#f59e0b',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #f59e0b',
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
