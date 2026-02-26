'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup as apiSignup } from '../lib/api';

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [betaMode, setBetaMode] = useState(false); // Beta mode flag
  const [whitelistStatus, setWhitelistStatus] = useState('checking'); // 'checking', 'waitlisted', 'whitelisted', 'not_whitelisted'

  // Redirect if already authenticated
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      router.push('/feed');
    }
  }, [isAuthenticated]);

  // Check whitelist status on component mount
  useEffect(() => {
    checkWhitelistStatus();
  }, []);

  const checkWhitelistStatus = async () => {
    if (email) {
      setWhitelistStatus('checking');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-whitelist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.whitelisted) {
          setWhitelistStatus('whitelisted');
        } else if (data.waitlisted) {
          setWhitelistStatus('waitlisted');
        } else {
          setWhitelistStatus('not_whitelisted');
        }
      } catch (err) {
        console.error('Whitelist check error:', err);
        setWhitelistStatus('not_whitelisted');
      }
    }
  };

  const validateForm = () => {
    setError('');
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (username.length > 50) {
      setError('Username must be less than 50 characters');
      return false;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!betaMode && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiSignup({ username, email, password, betaMode });

      if (response.token) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Email signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    e.preventDefault();
    setOauthLoading(provider);

    try {
      // This would call the OAuth callback endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}/callback?code=placeholder_${provider}`;

      // After OAuth, the backend will handle the signup
      // We'll listen for the response via callback or polling
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error(`${provider} signup error:`, err);
      setError(`${provider} authentication failed. Please try again.`);
      setOauthLoading(null);
    } finally {
      setOauthLoading(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (betaMode) {
        // Beta signup - check whitelist first
        const whitelistCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-whitelist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await whitelistCheck.json();

        if (data.waitlisted) {
          setError('You are on the waitlist. Only whitelisted users can sign up during beta period.');
          setLoading(false);
          return;
        }

        // If whitelisted, proceed with regular signup
        const signupResponse = await apiSignup({ username, email, password, betaMode: true });

        if (signupResponse.token) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          throw new Error(signupResponse.message || 'Signup failed');
        }
      } else if (data.not_whitelisted) {
        setError('Beta signup is currently invite-only. Please join the waitlist.');
          setLoading(false);
          return;
        } else {
          // Not whitelisted - show error message
          setError('Beta signup is currently closed. Please check back later.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Beta signup error:', err);
        setError('Beta signup failed. Please try again later.');
        setLoading(false);
      }
    } else {
      // Regular signup
      const signupResponse = await apiSignup({ username, email, password });

      if (signupResponse.token) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        throw new Error(signupResponse.message || 'Signup failed');
      }
    }
  } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Beta Mode Banner */}
      <div style={{
        backgroundColor: '#fff7ed',
        color: '#1a2027',
        padding: '16px',
        borderBottom: '2px solid #1a2027',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          🔥 Beta Mode Active
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Sign up is invite-only during beta period. Only whitelisted users can create accounts.
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        maxWidth: '500px',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#ff6b35', margin: '0 0 40px' }}>
            Join Firebook
          </h1>

          <p style={{ fontSize: '20px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            {betaMode
              ? '🎉 Welcome to the Firebook Beta Program!'
              : 'Create your account and join the cooking revolution.'
            }
          </p>

          <p style={{ fontSize: '16px', color: '#999', marginBottom: '32px' }}>
            {betaMode
              ? 'Limited beta access. Get early access to new features and help shape the future of Firebook.'
              : 'Full access to all social features.'
            }
          </p>
        </div>

        {/* Whitelist Status Display */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          {whitelistStatus === 'checking' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '16px', color: '#666' }}>Checking whitelist status...</div>
            </div>
          )}

          {whitelistStatus === 'waitlisted' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px', color: '#fbbf24' }}>
                ⏳ Waitlist
              </div>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>
                You are currently on the waitlist. Join the waitlist to be notified when spots open.
              </p>
            </div>
          </div>
          )}

          {whitelistStatus === 'whitelisted' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px', color: '#10b981' }}>
                ✅ Whitelisted
              </div>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>
                You can create an account! Welcome to Firebook Beta.
              </p>
            </div>
          )}

          {whitelistStatus === 'not_whitelisted' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: 12px', color: '#ef4444' }}>
                🔒 Closed
              </div>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>
                Beta signup is currently closed. Please check back later.
              </p>
            </div>
          )}

          {whitelistStatus === 'not_whitelisted' && betaMode && (
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff3e3', borderRadius: '8px' }}>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '16px' }}>
                Beta signup is invite-only at the moment.
              </p>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                <Link href="/join-waitlist" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
                  Join the Waitlist
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          {/* Beta Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}>
            <Text style={{ fontSize: 14px, color: '#666', fontWeight: '500' }}>
              Signup Mode:
            </Text>

            <TouchableOpacity
              onPress={() => setBetaMode(false)}
              style={[
                styles.modeButton,
                !betaMode && styles.modeButtonActive
              ]}
            >
              <Text style={styles.modeButtonText}>Regular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setBetaMode(true)}
              style={[
                styles.modeButton,
                betaMode && styles.modeButtonActive
              ]}
              disabled={whitelistStatus !== 'whitelisted' && whitelistStatus !== 'not_whitelisted'}
            >
              <Text style={styles.modeButtonText}>Beta (Invite Only)</Text>
            </TouchableOpacity>
          </div>

          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            {betaMode && 'Email signup is invite-only. You\'ll receive a confirmation email when whitelisted.'}
          </div>
        </div>

          {/* Username Input */}
          <div>
            <Text style={styles.label}>Username</Text>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username (3-50 characters)"
              style={styles.input}
              disabled={loading}
            />
            {error.username && (
              <Text style={styles.error}>{error.username}</Text>
            )}
          </div>

          {/* Email Input */}
          <div>
            <Text style={styles.label}>Email</Text>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              disabled={loading || whitelistStatus !== 'whitelisted'}
              onBlur={() => email && checkWhitelistStatus()}
            />
            {error.email && (
              <Text style={styles.error}>{error.email}</Text>
            )}
            {whitelistStatus === 'waitlisted' && (
              <Text style={styles.warning}>⏳ Waitlisted</Text>
            )}
            {whitelistStatus === 'whitelisted' && (
              <Text style={styles.success}>✅ Whitelisted</Text>
            )}
            {whitelistStatus === 'not_whitelisted' && (
              <Text style={styles.error}>🔒 Closed</Text>
            )}
          )}
          </div>
        </div>

          {/* Password Input */}
          <div>
            <Text style={styles.label}>Password</Text>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 6 characters)"
              style={styles.input}
              disabled={loading}
            />
            {error.password && (
              <Text style={styles.error}>{error.password}</Text>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <Text style={styles.label}>Confirm Password</Text>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              style={styles.input}
              disabled={loading}
            />
            {error.confirmPassword && (
              <Text style={styles.error}>{error.confirmPassword}</Text>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
              <button
                onClick={() => setError('')}
                style={styles.errorButton}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={styles.successContainer}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <Text style={styles.successText}>
                {betaMode
                  ? 'Account created successfully! You can now log in.'
                  : 'Account created! Check your email to verify.'
                  }
              </Text>
              <p style={styles.successSubtext}>
                {betaMode ? 'Welcome to Firebook Beta! Your account has been created and you\'re on the waitlist. We\'ll email you when spots open.' : 'Your account is ready to use all beta features.'}
              </p>
            </div>
            <button
              onClick={() => {
                router.push('/login');
                setSuccess(false);
              }}
              style={styles.successButton}
            >
              Go to Login
            </button>
          </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            onSubmit={handleSubmit}
            disabled={loading || (whitelistStatus !== 'whitelisted' && betaMode)}
            style={[
              styles.submitButton,
              (!username.trim() || !email.trim() || !password.trim()) && styles.submitButtonDisabled
            ]}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={styles.text}>
            Already have an account?{' '}
            <Link
              href="/login"
              style={styles.link}
            >
              Log in instead
            </Link>
          </p>
        </div>

        {/* OAuth Buttons - Show but disable in beta mode */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <Text style={styles.sectionTitle}>Or continue with:</Text>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleGoogleSignup}
              disabled={oauthLoading !== null || whitelistStatus !== 'whitelisted'}
              style={[styles.oauthButton, styles.googleButton, oauthLoading === 'google' && styles.oauthButtonLoading]}
            >
              {oauthLoading === 'google' ? 'Loading...' : '🔵 Continue with Google'}
            </button>

            <button
              onClick={handleFacebookSignup}
              disabled={oauthLoading !== null || whitelistStatus !== 'whitelisted'}
              style={[styles.oauthButton, styles.facebookButton, oauthLoading === 'facebook' && styles.oauthButtonLoading]}
            >
              {oauthLoading === 'facebook' ? 'Loading...' : '📘 Continue with Facebook'}
            </button>

            <button
              onClick={handleAppleSignup}
              disabled={oauthLoading !== null || whitelistStatus !== 'whitelisted'}
              style={[styles.oauthButton, styles.appleButton, oauthLoading === 'apple' && styles.oauthButtonLoading]}
            >
              {oauthLoading === 'apple' ? 'Loading...' : '🍏 Continue with Apple'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={styles.text}>
              By signing up, you agree to our{' '}
              <Link href="/terms" style={styles.link}>
                Terms of Service
              </Link>
              {' '}
              and{' '}
              <Link href="/privacy" style={styles.link}>
                Privacy Policy
              </Link>
              {' '}
              .
            </p>
          </p>
          </div>
        </div>

        {/* Terms & Privacy Info */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '24px',
          borderRadius: '12px',
          marginTop: '24px',
        }}>
          <Text style={styles.infoTitle}>📋 Beta Program Details</Text>
          <p style={styles.infoText}>
            • <strong>Whitelist Access:</strong> Sign up is invite-only during beta period.
            <br />
            • <strong>Waitlist:</strong> Non-whitelisted users can join the waitlist.
            <br />
            • <strong>Features:</strong> Early access to new social features and recipe tools.
            <br />
            • <strong>Duration:</strong> Beta period runs until all features are stable.
            <br />
            • <strong>Support:</strong> Premium support for beta users.
            <br />
            • <strong>Feedback:</strong> Your feedback helps shape the platform.
          </p>

          <Text style={styles.sectionTitle}🚀 Important Beta Rules</Text>
          <ul style={styles.rulesList}>
            <li>Respect other beta users and follow community guidelines.</li>
            <li>Report bugs and issues through proper channels.</li>
            <li>Don't share confidential beta features outside the platform.</li>
            <li>Be constructive with feedback and suggestions.</li>
            <li>Accounts violating beta terms may be suspended.</li>
          </ul>
        </Text>
        </div>
      </div>

      {/* Back to Login Link */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Link
          href="/login"
          style={styles.link}
        >
          <Text style={styles.linkText}>Back to Login</Text>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: 20px,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16px',
  },
  label: {
    fontSize: 16px,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '14px',
    fontSize: 16px,
    backgroundColor: '#fff',
    borderRadius: 8px',
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
    outline: 'none',
  },
  text: {
    fontSize: 16px,
    lineHeight: '1.5',
    color: '#666',
  },
  modeButton: {
    padding: '12px 24px',
    borderRadius: 8px,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
    color: '#fff',
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18px,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16px',
  },
  rulesList: {
    fontSize: 14px,
    color: '#666',
    lineHeight: '1.8',
    paddingLeft: 24px',
    margin: 0,
  },
  infoTitle: {
    fontSize: 18px,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16px,
  },
  infoText: {
    fontSize: 16px,
    color: '#666',
    lineHeight: '1.6',
  },
  oauthButton: {
    padding: '16px 24px',
    borderRadius: 8px,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '140px',
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285f4',
    color: '#fff',
    borderColor: '#4285f4',
  },
  googleButtonLoading: {
    backgroundColor: '#e0e0e0',
    color: '#fff',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    color: '#fff',
    borderColor: '#1877f2',
  },
  facebookButtonLoading: {
    backgroundColor: '#e0e0e0',
    color: '#fff',
  },
  appleButton: {
    backgroundColor: '#000000',
    color: '#fff',
    borderColor: '#000000',
  },
  appleButtonLoading: {
    backgroundColor: '#333',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    color: '#fff',
    fontSize: 18px,
    fontWeight: '600',
    padding: 16px 32px,
    borderRadius: 8px',
    borderWidth: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
    color: '#999',
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    padding: 24px,
    borderRadius: 12px,
    marginBottom: '16px',
    textAlign: 'center',
  },
  successText: {
    fontSize: 16px,
    color: '#10b981',
    marginBottom: 8px',
  },
  successSubtext: {
    fontSize: 14px,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 16px,
    borderRadius: 8px,
    marginBottom: 16px,
  },
  error: {
    fontSize: 14px,
    color: '#c53030',
    marginBottom: 4px,
  },
  errorButton: {
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: 14px,
    fontWeight: '600',
    padding: '8px 16px,
    borderRadius: 4px,
    borderWidth: 'none',
  },
  footer: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '24px',
  },
  text: {
    fontSize: 14px,
    color: '#999',
    textAlign: 'center',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },
  linkText: {
    color: '#3b82f6',
    textDecoration: 'underline',
  },
  rulesList: {
    listStyle: 'disc',
    paddingLeft: 24px,
  },
};