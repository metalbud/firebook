"use client";

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { apiCall, API_ENDPOINTS } from '../../../lib/api';

function RecipeDetailContent({ id }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeTitle = searchParams.get('title');

  const { isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [question, setQuestion] = useState('');
  const [questionHistory, setQuestionHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [recipeScale, setRecipeScale] = useState(1);
  const [useMetric, setUseMetric] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id, recipeTitle]);

  const loadRecipe = async () => {
    setLoading(true);
    try {
      const storedRecipes = localStorage.getItem('firebook_saved_recipes');
      if (storedRecipes) {
        const savedRecipes = JSON.parse(storedRecipes);
        const found = savedRecipes.find(r => r.id == id || r.title === recipeTitle);
        if (found) {
          setRecipe(found);
          setIsSaved(true);
          setLoading(false);
          return;
        }
      }

      if (recipeTitle) {
        const response = await apiCall('/api/fetch-recipe-details', {
          method: 'POST',
          body: JSON.stringify({ recipeTitle }),
        });

        if (response.ok) {
          const data = await response.json();
          setRecipe(data.recipe_data || data.recipe || data);
        } else {
          throw new Error('Recipe not found');
        }
      }
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Failed to load recipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    try {
      const storedRecipes = localStorage.getItem('firebook_saved_recipes');
      const savedRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
      if (!savedRecipes.find(r => r.id === recipe.id || r.title === recipe.title)) {
        savedRecipes.push(recipe);
        localStorage.setItem('firebook_saved_recipes', JSON.stringify(savedRecipes));
      }
      if (isAuthenticated) {
        await apiCall(API_ENDPOINTS.SAVE_RECIPE, {
          method: 'POST',
          body: JSON.stringify({ recipe }),
        });
      }
      setIsSaved(true);
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  };

  const handleShareRecipe = async () => {
    if (!recipe) return;
    const message = `🔥 ${recipe.title}\n\n${recipe.description || ''}\n\nfirebook.app`;
    if (navigator.share) {
      await navigator.share({ title: recipe.title, text: message }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message);
      alert('Recipe copied to clipboard!');
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !recipe) return;
    setIsAsking(true);
    try {
      const response = await apiCall('/api/recipe-question', {
        method: 'POST',
        body: JSON.stringify({
          recipeContext: recipe,
          question: question.trim(),
          conversationHistory: questionHistory.slice(-3).map(item => ({
            role: 'user',
            content: item.question,
          })),
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setQuestionHistory(prev => [{ question: question.trim(), answer: data.answer }, ...prev]);
      setQuestion('');
    } catch (err) {
      console.error('Error asking question:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const scaleIngredient = (amount) => {
    if (!amount) return amount;
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return amount;
    return (parsed * recipeScale).toFixed(1).replace(/\.0$/, '');
  };

  if (loading) {
    return (
      <div className="page-content-narrow" style={{ textAlign: 'center', paddingTop: '48px' }}>
        <div className="spinner" />
        <p className="loading-text">Loading recipe…</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="page-content-narrow">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-title">{error || 'Recipe not found'}</p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none', marginTop: '16px', display: 'inline-flex' }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content-narrow">
      {/* Title card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="recipe-card-placeholder" style={{ height: '180px', fontSize: '72px' }}>🍽️</div>
        <div className="card-body">
          {recipe.category && (
            <div className="recipe-card-category" style={{ marginBottom: '6px' }}>{recipe.category}</div>
          )}
          <h1 className="card-title" style={{ fontSize: '26px', marginBottom: '10px' }}>{recipe.title}</h1>
          {recipe.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{recipe.description}</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-body">
          <div className="scale-controls">
            <span className="scale-label">Scale:</span>
            {[0.5, 1, 1.5, 2, 3].map(s => (
              <button
                key={s}
                className={`preference-option${recipeScale === s ? ' active' : ''}`}
                style={{ padding: '4px 12px', fontSize: '13px' }}
                onClick={() => setRecipeScale(s)}
              >
                {s}x
              </button>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={useMetric} onChange={e => setUseMetric(e.target.checked)} />
              Metric
            </label>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-body">
          <h2 className="card-title">🥕 Ingredients</h2>
          <div className="ingredient-tags-list" style={{ marginTop: '12px' }}>
            {(recipe.ingredients || []).map((ing, i) => (
              <span key={i} className="ingredient-tag">
                {typeof ing === 'object'
                  ? `${scaleIngredient(useMetric ? ing.amount_metric : ing.amount) || ''} ${ing.name || ''}`
                  : ing}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-body">
          <h2 className="card-title">👩‍🍳 Instructions</h2>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            {(recipe.instructions || []).map((inst, i) => (
              <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span className="step-number">{i + 1}</span>
                <span style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                  {typeof inst === 'object' ? inst.description || inst.instruction || inst.step : inst}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Nutrition */}
      {recipe.nutritional_info && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-body">
            <h2 className="card-title">🥗 Nutrition</h2>
            <div className="nutrition-grid" style={{ marginTop: '12px' }}>
              {Object.entries(recipe.nutritional_info).map(([k, v]) => (
                <div key={k} className="nutrition-item">
                  <div className="nutrition-value">{String(v)}</div>
                  <div className="nutrition-label">{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!isSaved ? (
            <button className="btn-primary btn-sm" onClick={handleSaveRecipe}>💾 Save Recipe</button>
          ) : (
            <button className="btn-secondary btn-sm" disabled>✓ Saved</button>
          )}
          <button className="btn-secondary btn-sm" onClick={handleShareRecipe}>📤 Share</button>
          <button className="btn-secondary btn-sm" onClick={() => router.back()}>← Back</button>
        </div>
      </div>

      {/* AI Q&A */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-body">
          <h2 className="card-title">❓ Ask about this recipe</h2>
          <div className="qa-section" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                className="form-textarea"
                placeholder="Ask anything about this recipe…"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={2}
                style={{ minHeight: '60px' }}
              />
              <button
                className="btn-primary btn-sm"
                onClick={handleAskQuestion}
                disabled={isAsking || !question.trim()}
                style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
              >
                {isAsking ? 'Asking…' : 'Ask'}
              </button>
            </div>

            {questionHistory.map((item, i) => (
              <div key={i} className="qa-answer" style={{ marginTop: '12px' }}>
                <p style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--ember)' }}>Q: {item.question}</p>
                <p style={{ lineHeight: '1.6' }}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage({ params }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="page-content-narrow" style={{ textAlign: 'center', paddingTop: '48px' }}><div className="spinner" /></div>}>
      <RecipeDetailContent id={id} />
    </Suspense>
  );
}
