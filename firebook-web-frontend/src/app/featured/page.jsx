"use client";

import { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../../lib/api';
import RecipeCard from '../../components/RecipeCard';

export default function FeaturedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const stored = localStorage.getItem('firebook_random_recipes');
    if (stored) {
      try { setRecipes(JSON.parse(stored)); } catch (_) {}
    }
    fetchRandomRecipes();
  };

  const fetchRandomRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiCall(`${API_ENDPOINTS.RANDOM_RECIPES}?limit=12`);
      if (response.ok) {
        const data = await response.json();
        const recipes = data.recipes || data || [];
        setRecipes(recipes);
        localStorage.setItem('firebook_random_recipes', JSON.stringify(recipes));
      } else {
        throw new Error('Failed to fetch recipes');
      }
    } catch (err) {
      console.error('Error fetching featured recipes:', err);
      setError('Unable to load featured recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="section-heading" style={{ margin: 0 }}>
          <span className="flame-accent">🌟</span> Featured Recipes
        </h1>
        <button
          className="btn-secondary btn-sm"
          onClick={fetchRandomRecipes}
          disabled={loading}
        >
          {loading ? 'Loading…' : '🔄 Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && recipes.length === 0 ? (
        <>
          <div className="spinner" />
          <p className="loading-text">Loading featured recipes…</p>
        </>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <p className="empty-state-title">No recipes available</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe, i) => (
            <RecipeCard key={recipe.id || i} recipe={recipe} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
