'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/generate', label: 'Generate' },
    { href: '/featured', label: 'Featured' },
    ...(isAuthenticated
      ? [
          { href: '/saved', label: 'Saved' },
          { href: '/history', label: 'History' },
          { href: '/profile', label: 'Profile' },
        ]
      : []),
  ];

  return (
    <>
      <header className="header">
        <Link href="/" className="header-logo">
          <span className="logo-brand">🔥 Firebook</span>
          <span className="logo-tagline">Ignite your menu</span>
        </Link>

        <nav className="header-nav">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${pathname === href ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          {isAuthenticated && user && (
            <div className="flames-badge">
              🔥 {user.flames ?? 0}
            </div>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/login" className="nav-link">Log in</Link>
              <Link href="/signup" className="nav-link">Sign up</Link>
            </>
          )}

          {isAuthenticated && (
            <button
              onClick={logout}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              Log out
            </button>
          )}

          <button
            className="dark-mode-btn"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </header>

      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${pathname === href ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
        {isAuthenticated && (
          <button
            onClick={() => { logout(); setMobileOpen(false); }}
            className="nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            Log out
          </button>
        )}
        {!isAuthenticated && (
          <>
            <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Log in</Link>
            <Link href="/signup" className="nav-link" onClick={() => setMobileOpen(false)}>Sign up</Link>
          </>
        )}
      </nav>
    </>
  );
}
