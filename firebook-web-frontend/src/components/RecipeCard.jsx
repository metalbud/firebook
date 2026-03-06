'use client';

import Link from 'next/link';

const CATEGORY_EMOJI = {
  Desserts: '🍰',
  Breakfast: '🍳',
  Dinner: '🍽️',
  Appetizers: '🥗',
  Soups: '🍲',
  Salads: '🥙',
  Snacks: '🍿',
  Beverages: '🥤',
  Vegetarian: '🥦',
  Seafood: '🐟',
  Kids: '🧒',
};

export default function RecipeCard({ recipe, index = 0, onRemove }) {
  if (!recipe) return null;

  const emoji = CATEGORY_EMOJI[recipe.category] || '🔥';
  const recipeUrl = recipe.id
    ? `/recipe/${recipe.id}?title=${encodeURIComponent(recipe.title || '')}`
    : `/recipe/0?title=${encodeURIComponent(recipe.title || '')}`;

  return (
    <div className="recipe-card">
      <div className="recipe-card-placeholder">{emoji}</div>

      <div className="recipe-card-body">
        <div className="recipe-card-category">
          {recipe.category || 'Recipe'}
        </div>

        <h3 className="recipe-card-title">
          {recipe.title || 'Untitled Recipe'}
        </h3>

        <p className="recipe-card-desc">
          {recipe.description
            ? recipe.description.slice(0, 100) + (recipe.description.length > 100 ? '…' : '')
            : 'No description available.'}
        </p>

        <div className="recipe-card-actions">
          <Link href={recipeUrl} className="btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            View Recipe
          </Link>

          {onRemove && (
            <button
              className="btn-danger btn-sm"
              onClick={() => onRemove(recipe)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
