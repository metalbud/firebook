'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import Feed from './components/social/Feed';
import Image from 'next/image';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect to feed if authenticated
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      router.push('/feed');
    }
  }, [isAuthenticated]);

  // If authenticated, don't render landing page (handled by redirect above)
  if (isAuthenticated) {
    return null;
  }

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '800px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 40px',
            color: '#ff6b35',
          }}>
            🔥 Firebook
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}>
            Discover, share, and connect with food lovers worldwide.
            <br />
            The ultimate social platform for cooking enthusiasts.
          </p>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            marginBottom: '48px',
            width: '100%',
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 12px',
                color: '#333',
              }}>
                Social Feed
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '24px',
              }}>
                Share your cooking journey, discover new recipes,
                and connect with fellow food enthusiasts.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 12px',
                color: '#333',
              }}>
                AI-Powered Recipes
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '24px',
              }}>
                Get personalized recipe recommendations based on
                your preferences, dietary restrictions, and available ingredients.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 12px',
                color: '#333',
              }}>
                Save & Share
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '24px',
              }}>
                Save your favorite recipes, track your cooking progress,
                and share your culinary creations with the community.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 12px',
                color: '#333',
              }}>
                Earn Flames & Level Up
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '24px',
              }}>
                Complete challenges to earn flames, level up, and unlock
                exclusive badges. Showcase your culinary achievements!
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginTop: '48px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#ff6b35',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, background-color 0.2s',
                minWidth: '180px',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
            >
              Get Started
            </button>
            <button
              onClick={handleLogin}
              style={{
                padding: '16px 32px',
                border: '2px solid #ff6b35',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#ff6b35',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, background-color 0.2s',
                minWidth: '180px',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '40px',
          fontSize: '14px',
          color: '#999',
          borderTop: '1px solid #e0e0e0',
          marginTop: 'auto',
        }}>
          &copy; 2026 Firebook. All rights reserved.
        </div>
      </div>
    </div>
  );
}
