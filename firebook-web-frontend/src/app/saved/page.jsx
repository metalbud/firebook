"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { apiCall, API_ENDPOINTS } from '../../lib/api';
import RecipeCard from '../../components/RecipeCard';

export default function SavedRecipesPage() {
  const { isAuthenticated, loading } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedRecipes();
    }
  }, [isAuthenticated]);

  const loadSavedRecipes = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('firebook_saved_recipes');
      if (stored) setSavedRecipes(JSON.parse(stored));

      const response = await apiCall(API_ENDPOINTS.USER_RECIPES);
      if (response.ok) {
        const data = await response.json();
        const recipes = data.recipes || [];
        setSavedRecipes(recipes);
        localStorage.setItem('firebook_saved_recipes', JSON.stringify(recipes));
      }
    } catch (err) {
      console.error('Error loading saved recipes:', err);
      setError('Failed to load saved recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecipe = (recipeToRemove) => {
    const updated = savedRecipes.filter(r => r.id !== recipeToRemove.id && r.title !== recipeToRemove.title);
    setSavedRecipes(updated);
    localStorage.setItem('firebook_saved_recipes', JSON.stringify(updated));
  };

  if (loading || !isAuthenticated) {
    return <div className="auth-page"><div className="spinner" /></div>;
  }

  return (
    <div className="page-content-narrow">
      <h1 className="section-heading" style={{ marginBottom: '24px' }}>
        <span className="flame-accent">📌</span> Saved Recipes
      </h1>

      {isLoading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">Loading saved recipes…</p>
        </>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : savedRecipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <p className="empty-state-title">No saved recipes yet</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
            Generate and save recipes to find them here.
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
        <div className="recipe-grid">
          {savedRecipes.map((recipe, i) => (
            <RecipeCard key={recipe.id || i} recipe={recipe} index={i} onRemove={handleRemoveRecipe} />
          ))}
        </div>
      )}
    </div>
  );
}
