'use client';

import { useUser } from '../../contexts/UserContext';
import Avatar from './Avatar';
import Link from 'next/link';

export default function UserProfileHeader({ user }) {
  const { profile: currentUserProfile } = useUser();

  const isOwnProfile = currentUserProfile && currentUserProfile.id === user.id;

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      padding: '20px',
      marginBottom: '24px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Avatar user={user} size="large" />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '32px',
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
                padding: '4px 10px',
                borderRadius: '4px',
                marginLeft: '12px',
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

          <div style={{ fontSize: '14px', color: '#999', marginTop: '12px' }}>
            Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'flex',
          gap: '24px',
          fontSize: '14px',
          color: '#666',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📝</div>
            <div style={{ fontWeight: '600' }}>{user.posts_count || 0}</div>
            <div style={{ fontSize: '12px' }}>Posts</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>👥</div>
            <div style={{ fontWeight: '600' }}>{user.followers_count || 0}</div>
            <div style={{ fontSize: '12px' }}>Followers</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>👥</div>
            <div style={{ fontWeight: '600' }}>{user.following_count || 0}</div>
            <div style={{ fontSize: '12px' }}>Following</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔥</div>
            <div style={{ fontWeight: '600' }}>{user.flames || 0}</div>
            <div style={{ fontSize: '12px' }}>Flames</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>⭐</div>
            <div style={{ fontWeight: '600' }}>Level {user.level || 1}</div>
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile && (
          <Link
            href="/settings"
            style={{
              textDecoration: 'none',
              color: '#ff6b35',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Edit Profile
          </Link>
        )}
      </div>
    </header>
  );
}
