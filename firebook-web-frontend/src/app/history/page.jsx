"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function HistoryPage() {
  const { isAuthenticated, loading } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('firebook_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear your entire recipe history?')) {
      localStorage.removeItem('firebook_history');
      setHistory([]);
    }
  };

  const removeFromHistory = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem('firebook_history', JSON.stringify(updated));
  };

  if (loading || !isAuthenticated) {
    return <div className="auth-page"><div className="spinner" /></div>;
  }

  return (
    <div className="page-content-narrow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="section-heading" style={{ margin: 0 }}>
          <span className="flame-accent">📜</span> Recipe History
        </h1>
        {history.length > 0 && (
          <button className="btn-secondary btn-sm" onClick={clearHistory}>Clear All</button>
        )}
      </div>

      {isLoading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">Loading history…</p>
        </>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🕐</div>
          <p className="empty-state-title">No history yet</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
            Recipes you generate will appear here.
          </p>
          <Link
            href="/generate"
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', height: '40px', padding: '0 18px', fontSize: '14px', borderRadius: '8px' }}
          >
            Generate a Recipe
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div key={index} className="history-item">
              <div>
                <p className="history-item-title">{item.title || 'Untitled Recipe'}</p>
                <p className="history-item-date">
                  {item.generatedAt
                    ? new Date(item.generatedAt).toLocaleDateString()
                    : item.viewedAt
                    ? new Date(item.viewedAt).toLocaleDateString()
                    : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href={`/recipe/${item.id || index}?title=${encodeURIComponent(item.title || '')}`}
                  className="btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  View
                </Link>
                <button className="btn-secondary btn-sm" onClick={() => removeFromHistory(index)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
