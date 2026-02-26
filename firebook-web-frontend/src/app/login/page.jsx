'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login as apiLogin, googleCallback, facebookCallback, appleCallback } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(null);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && typeof window !== 'undefined') {
    router.push('/feed');
    return null;
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiLogin({ identifier, password, rememberMe });
      login(response.token, response.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setOauthLoading('google');
    setError('');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/google/callback`)}&response_type=code&scope=profile%20email`;
    window.location.href = googleAuthUrl;
  };

  const handleFacebookLogin = () => {
    setOauthLoading('facebook');
    setError('');
    const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/facebook/callback`)}&response_type=code&scope=email`;
    window.location.href = facebookAuthUrl;
  };

  const handleAppleLogin = () => {
    setOauthLoading('apple');
    setError('');
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${process.env.NEXT_PUBLIC_APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/apple/callback`)}&response_type=code&scope=email%20name`;
    window.location.href = appleAuthUrl;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '40px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#ff6b35' }}>
            🔥 Firebook
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '16px' }}>
            Sign in to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={oauthLoading !== null}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: oauthLoading === 'google' ? '#e8e8e8' : '#ffffff',
              color: '#333',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: '1px solid #ddd',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (oauthLoading !== 'google') e.target.style.backgroundColor = '#f0f0f0'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#ffffff'; }}
          >
            {oauthLoading === 'google' ? (
              <span>⏳ Loading...</span>
            ) : (
              <>
                <span style={{ fontSize: '20px' }}>🔵</span>
                Sign in with Google
              </>
            )}
          </button>

          <button
            onClick={handleFacebookLogin}
            disabled={oauthLoading !== null}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: oauthLoading === 'facebook' ? '#e8e8e8' : '#1877f2',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (oauthLoading !== 'facebook') e.target.style.backgroundColor = '#166fe5'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#1877f2'; }}
          >
            {oauthLoading === 'facebook' ? (
              <span>⏳ Loading...</span>
            ) : (
              <>
                <span style={{ fontSize: '20px' }}>📘</span>
                Sign in with Facebook
              </>
            )}
          </button>

          <button
            onClick={handleAppleLogin}
            disabled={oauthLoading !== null}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: oauthLoading === 'apple' ? '#e8e8e8' : '#000000',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (oauthLoading !== 'apple') e.target.style.backgroundColor = '#333'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#000000'; }}
          >
            {oauthLoading === 'apple' ? (
              <span>⏳ Loading...</span>
            ) : (
              <>
                <span style={{ fontSize: '20px' }}>🍎</span>
                Sign in with Apple
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: '#999',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          <span style={{ margin: '0 16px', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="identifier" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ff6b35'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Remember me
            </label>
            <Link href="/forgot-password" style={{ color: '#ff6b35', textDecoration: 'none', fontSize: '14px' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: loading ? '#e8e8e8' : '#ff6b35',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#666' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#ff6b35', fontWeight: '600', textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
