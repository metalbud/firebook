"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import API_BASE_URL from '../../lib/api';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🥬 Vegetarian' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'gluten-free', label: '🌾 Gluten-Free' },
  { id: 'keto', label: '🥑 Keto' },
  { id: 'low-carb', label: '🍖 Low-Carb' },
  { id: 'dairy-free', label: '🥛 Dairy-Free' },
];

const CUISINE_OPTIONS = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'French', 'Korean'];
const TIME_OPTIONS = ['15 min', '30 min', '45 min', '1 hour', '1.5 hours', '2+ hours'];
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard', 'Expert'];

const QUICK_COMBOS = [
  ['Chicken', 'Rice', 'Broccoli'],
  ['Pasta', 'Tomatoes', 'Basil'],
  ['Salmon', 'Lemon', 'Asparagus'],
  ['Eggs', 'Cheese', 'Bacon'],
];

function GenerateContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [preferences, setPreferences] = useState({
    dietary: [],
    cuisine: '',
    cookingTime: '',
    difficulty: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Pre-populate from ?q= query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      const parts = q.split(/,\s*|\s+and\s+/).map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) setIngredients(parts);
      else setCurrentIngredient(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const addIngredient = () => {
    const val = currentIngredient.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients(prev => [...prev, val]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const toggleDietary = (id) => {
    setPreferences(prev => ({
      ...prev,
      dietary: prev.dietary.includes(id)
        ? prev.dietary.filter(d => d !== id)
        : [...prev.dietary, id],
    }));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }
    setError('');
    setGenerating(true);
    setGeneratedRecipe(null);
    setSaved(false);

    try {
      const token = localStorage.getItem('firebook_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Step 1: get recipe title suggestion
      const suggestRes = await fetch(`${API_BASE_URL}/api/suggested-recipes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ingredients,
          dietary: preferences.dietary,
          cuisine: preferences.cuisine,
          cookingTime: preferences.cookingTime,
          difficulty: preferences.difficulty,
        }),
      });

      if (!suggestRes.ok) {
        const d = await suggestRes.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to get recipe suggestions.');
      }

      const suggestData = await suggestRes.json();
      const recipeTitle = suggestData.recipeTitle || suggestData.title || suggestData.recipe_title;

      if (!recipeTitle) throw new Error('No recipe title returned.');

      // Step 2: fetch full recipe details
      const detailRes = await fetch(`${API_BASE_URL}/api/fetch-recipe-details`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ recipeTitle }),
      });

      if (!detailRes.ok) {
        const d = await detailRes.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to fetch recipe details.');
      }

      const detailData = await detailRes.json();
      const recipe = detailData.recipe || detailData;

      // Save to localStorage history
      try {
        const history = JSON.parse(localStorage.getItem('firebook_history') || '[]');
        history.unshift({ ...recipe, generatedAt: new Date().toISOString() });
        localStorage.setItem('firebook_history', JSON.stringify(history.slice(0, 50)));
      } catch (_) { /* ignore */ }

      setGeneratedRecipe(recipe);
    } catch (err) {
      console.error('Generate error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const saveRecipe = async () => {
    if (!generatedRecipe || saved) return;

    try {
      const token = localStorage.getItem('firebook_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Save locally
      const localSaved = JSON.parse(localStorage.getItem('firebook_saved_recipes') || '[]');
      localSaved.unshift(generatedRecipe);
      localStorage.setItem('firebook_saved_recipes', JSON.stringify(localSaved.slice(0, 100)));

      // Save to backend
      await fetch(`${API_BASE_URL}/api/save-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: generatedRecipe.title,
          description: generatedRecipe.description,
          category: generatedRecipe.category,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
          nutritional_info: generatedRecipe.nutritional_info || generatedRecipe.nutrition,
        }),
      });

      setSaved(true);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="page-content-narrow">
      <h1 className="section-heading" style={{ marginBottom: '24px' }}>
        <span className="flame-accent">🍳</span> Generate a Recipe
      </h1>

      {/* Ingredients */}
      <div className="generate-section">
        <p className="generate-section-title">What ingredients do you have?</p>
        <div className="ingredient-input-row">
          <input
            className="form-input"
            type="text"
            value={currentIngredient}
            onChange={(e) => setCurrentIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type an ingredient and press Enter…"
          />
          <button className="btn-primary btn-sm" onClick={addIngredient} style={{ whiteSpace: 'nowrap' }}>
            Add
          </button>
        </div>
        {ingredients.length > 0 && (
          <div className="ingredient-tags-list">
            {ingredients.map((ing, i) => (
              <span key={i} className="ingredient-tag">
                {ing}
                <span className="ingredient-tag-remove" onClick={() => removeIngredient(ing)}>×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dietary Preferences */}
      <div className="generate-section">
        <p className="generate-section-title">Dietary Preferences</p>
        <div className="preference-options">
          {DIETARY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`preference-option${preferences.dietary.includes(opt.id) ? ' active' : ''}`}
              onClick={() => toggleDietary(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine */}
      <div className="generate-section">
        <p className="generate-section-title">Cuisine Style</p>
        <div className="preference-options">
          {CUISINE_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`preference-option${preferences.cuisine === opt ? ' active' : ''}`}
              onClick={() => setPreferences(prev => ({ ...prev, cuisine: opt }))}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Time & Difficulty */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="generate-section">
          <p className="generate-section-title">Cooking Time</p>
          <div className="preference-options">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`preference-option${preferences.cookingTime === opt ? ' active' : ''}`}
                onClick={() => setPreferences(prev => ({ ...prev, cookingTime: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="generate-section">
          <p className="generate-section-title">Difficulty</p>
          <div className="preference-options">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`preference-option${preferences.difficulty === opt ? ' active' : ''}`}
                onClick={() => setPreferences(prev => ({ ...prev, difficulty: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        className="btn-primary"
        onClick={generateRecipe}
        disabled={generating || ingredients.length === 0}
        style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
      >
        {generating ? 'Generating…' : '✨ Generate Recipe'}
      </button>

      {/* Quick suggestions */}
      {!generatedRecipe && !generating && (
        <div className="generate-section" style={{ marginTop: '24px' }}>
          <p className="generate-section-title">💡 Quick Combinations</p>
          <div className="preference-options">
            {QUICK_COMBOS.map((combo, i) => (
              <button
                key={i}
                className="preference-option"
                onClick={() => setIngredients(combo)}
              >
                {combo.join(' + ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generating spinner */}
      {generating && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <div className="spinner" />
          <p className="loading-text">Crafting your recipe…</p>
        </div>
      )}

      {/* Generated Recipe */}
      {generatedRecipe && !generating && (
        <div className="card" style={{ marginTop: '32px' }}>
          <div className="recipe-card-placeholder" style={{ fontSize: '64px', height: '160px' }}>🍽️</div>
          <div className="card-body">
            <div className="recipe-card-category">{generatedRecipe.category || 'Recipe'}</div>
            <h2 className="card-title" style={{ marginTop: '4px' }}>{generatedRecipe.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              {generatedRecipe.description}
            </p>

            {/* Nutrition */}
            {generatedRecipe.nutritional_info && (
              <div style={{ marginBottom: '20px' }}>
                <h3 className="generate-section-title" style={{ marginBottom: '12px' }}>Nutrition Facts</h3>
                <div className="nutrition-grid">
                  {Object.entries(generatedRecipe.nutritional_info).map(([k, v]) => (
                    <div key={k} className="nutrition-item">
                      <div className="nutrition-value">{String(v)}</div>
                      <div className="nutrition-label">{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {generatedRecipe.ingredients && (
              <div style={{ marginBottom: '20px' }}>
                <h3 className="generate-section-title" style={{ marginBottom: '12px' }}>Ingredients</h3>
                <div className="ingredient-tags-list">
                  {generatedRecipe.ingredients.map((ing, i) => (
                    <span key={i} className="ingredient-tag">
                      {typeof ing === 'object' ? `${ing.name} — ${ing.amount || ing.quantity || ''}` : ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {generatedRecipe.instructions && (
              <div style={{ marginBottom: '20px' }}>
                <h3 className="generate-section-title" style={{ marginBottom: '12px' }}>Instructions</h3>
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {generatedRecipe.instructions.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span className="step-number">{i + 1}</span>
                      <span style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                        {typeof step === 'object' ? step.instruction || step.step || JSON.stringify(step) : step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                className="btn-primary btn-sm"
                onClick={saveRecipe}
                disabled={saved}
              >
                {saved ? '✓ Saved' : '📌 Save Recipe'}
              </button>
              <button className="btn-secondary btn-sm" onClick={() => window.print()}>
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="spinner" /></div>}>
      <GenerateContent />
    </Suspense>
  );
}
