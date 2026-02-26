'use client';

import Link from 'next/link';

export default function NavigationHeader() {
  return (
    <nav style={{
      backgroundColor: '#ffffff',
      padding: '12px 20px',
      borderBottom: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#666' }}
        >
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            color: '#ff6b35',
          }}>
            🔥 Firebook
          </h1>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              href="/feed"
              style={{
                textDecoration: 'none',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Feed
            </Link>

            <Link
              href="/trending"
              style={{
                textDecoration: 'none',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Trending
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link
              href="/notifications"
              style={{
                textDecoration: 'none',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              🔔
              {' '}
              Notifications
            </Link>

            <Link
              href="/profile/me"
              style={{
                textDecoration: 'none',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              My Profile
            </Link>
          </div>
        </div>

        {/* User Menu */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ⚙️
          </button>

          <button
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
}
