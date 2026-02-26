'use client';

import TrendingFeed from '../../components/social/TrendingFeed';

export default function TrendingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px 20px',
        borderBottom: '1px solid #e0e0e0',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: 0,
          color: '#ff6b35',
        }}>
          📈 Trending
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginTop: '8px',
        }}>
          See what's popular in the Firebook community
        </p>
      </div>

      {/* Trending Feed Component */}
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <TrendingFeed />
      </div>
    </div>
  );
}
