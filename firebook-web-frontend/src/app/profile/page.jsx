"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import RecipeCard from '../../components/RecipeCard';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb', 'Paleo', 'Dairy-Free', 'Nut-Free'];
const CUISINE_OPTIONS = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American'];
const ALLERGY_OPTIONS = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Wheat', 'Fish'];

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [preferences, setPreferences] = useState({ dietary: [], cuisine: [], allergies: [] });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', location: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setFormData({ name: user.name || '', bio: user.bio || '', location: user.location || '' });
      setPreferences(user.preferences || { dietary: [], cuisine: [], allergies: [] });
    }
  }, [user, isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const stored = localStorage.getItem('firebook_saved_recipes');
        if (stored) setSavedRecipes(JSON.parse(stored));
      } catch (_) {}
    }
  }, [isAuthenticated]);

  const handleSaveProfile = () => {
    try {
      localStorage.setItem('firebook_profile_prefs', JSON.stringify({ formData, preferences }));
    } catch (_) {}
    setEditing(false);
  };

  const togglePreference = (category, value) => {
    if (!editing) return;
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  const handleRemoveRecipe = (recipeToRemove) => {
    const updated = savedRecipes.filter(r => r.id !== recipeToRemove.id && r.title !== recipeToRemove.title);
    setSavedRecipes(updated);
    localStorage.setItem('firebook_saved_recipes', JSON.stringify(updated));
  };

  if (loading) {
    return <div className="auth-page"><div className="spinner" /></div>;
  }
  if (!isAuthenticated) return null;

  const initials = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="page-content-narrow">
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="profile-banner" />
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div style={{ flex: 1, paddingTop: '4px' }}>
            <div className="profile-name">{user?.name || 'User'}</div>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-pill">🔥 {user?.flames ?? 0} Flames</div>
          <div className="stat-pill">⚡ Level {user?.level ?? 1}</div>
          <div className="stat-pill">📅 {user?.streakDays ?? 0} day streak</div>
          {user?.badges?.length > 0 && (
            <div className="stat-pill">🏅 {user.badges.length} badges</div>
          )}
        </div>

        <div className="profile-tabs">
          {['overview', 'saved', 'preferences', 'settings'].map(tab => (
            <button
              key={tab}
              className={`profile-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="profile-tab-content">
          {activeTab === 'overview' && (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                {formData.bio || 'No bio yet.'}
              </p>
              {formData.location && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>📍 {formData.location}</p>
              )}
              <Link href="/generate" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', height: '40px', padding: '0 18px', fontSize: '14px', borderRadius: '8px' }}>
                ✨ Generate a Recipe
              </Link>
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h3 className="generate-section-title" style={{ marginBottom: '16px' }}>
                Saved Recipes ({savedRecipes.length})
              </h3>
              {savedRecipes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📌</div>
                  <p className="empty-state-title">No saved recipes yet</p>
                  <Link href="/generate" style={{ color: 'var(--ember)' }}>Generate your first one</Link>
                </div>
              ) : (
                <div className="recipe-grid">
                  {savedRecipes.map((recipe, i) => (
                    <RecipeCard key={recipe.id || i} recipe={recipe} index={i} onRemove={handleRemoveRecipe} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="generate-section-title">Food Preferences</h3>
                {!editing ? (
                  <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-primary btn-sm" onClick={handleSaveProfile}>Save</button>
                    <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                )}
              </div>
              <p className="form-label" style={{ marginBottom: '8px' }}>Dietary</p>
              <div className="preference-options" style={{ marginBottom: '16px' }}>
                {DIETARY_OPTIONS.map(opt => (
                  <button key={opt} className={`preference-option${preferences.dietary.includes(opt) ? ' active' : ''}`} onClick={() => togglePreference('dietary', opt)} style={{ cursor: editing ? 'pointer' : 'default' }}>{opt}</button>
                ))}
              </div>
              <p className="form-label" style={{ marginBottom: '8px' }}>Cuisines</p>
              <div className="preference-options" style={{ marginBottom: '16px' }}>
                {CUISINE_OPTIONS.map(opt => (
                  <button key={opt} className={`preference-option${preferences.cuisine.includes(opt) ? ' active' : ''}`} onClick={() => togglePreference('cuisine', opt)} style={{ cursor: editing ? 'pointer' : 'default' }}>{opt}</button>
                ))}
              </div>
              <p className="form-label" style={{ marginBottom: '8px' }}>Allergies</p>
              <div className="preference-options">
                {ALLERGY_OPTIONS.map(opt => (
                  <button key={opt} className={`preference-option${preferences.allergies.includes(opt) ? ' active' : ''}`} onClick={() => togglePreference('allergies', opt)} style={{ cursor: editing ? 'pointer' : 'default' }}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 className="generate-section-title" style={{ marginBottom: '12px' }}>Profile</h3>
                <div className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input className="form-input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} rows={2} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <button className="btn-primary btn-sm" onClick={handleSaveProfile}>Save Changes</button>
                </div>
              </div>
              <div>
                <h3 className="generate-section-title" style={{ marginBottom: '12px' }}>Appearance</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Dark mode</span>
                  <button className="dark-mode-btn" onClick={toggleDarkMode}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
                </div>
              </div>
              <div>
                <h3 className="generate-section-title" style={{ marginBottom: '12px' }}>Account</h3>
                <button className="btn-secondary btn-sm" onClick={() => { logout(); router.push('/'); }}>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
