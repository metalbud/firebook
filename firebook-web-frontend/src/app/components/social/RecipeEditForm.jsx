'use client';

import { useState } from 'react';

export default function RecipeEditForm({ recipe, onSave, onCancel }) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [category, setCategory] = useState(recipe?.category || '');
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [cookingTime, setCookingTime] = useState(recipe?.cooking_time || 30);
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || 'medium');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setCategory(recipe.category || '');
      setServings(recipe.servings || 4);
      setCookingTime(recipe.cooking_time || 30);
      setDifficulty(recipe.difficulty || 'medium');
      if (typeof recipe.ingredients === 'object') {
        setIngredients(recipe.ingredients.map(ing => ing.name + ': ' + ing.amount));
      }
      if (typeof recipe.instructions === 'object') {
        setInstructions(recipe.instructions.map(step => step.text).join('\n'));
      }
    }
  }, [recipe]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      servings: parseInt(servings) || 4,
      cooking_time: parseInt(cookingTime) || 30,
      difficulty: difficulty,
      ingredients: ingredients,
      instructions: instructions,
    };

    if (onSave) {
      onSave(recipeData);
    }
  };

  const handleAddIngredient = () => {
    const newIngredients = ingredients + '\n' + `Ingredient ${ingredients.split('\n').length + 1}: `;
    setIngredients(newIngredients);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            color: '#333',
          }}>
            Edit Recipe
          </h2>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#fee',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Fields */}
        <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recipe title"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter recipe description"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">Select category</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Asian">Asian</option>
              <option value="American">American</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="French">French</option>
              <option value="Indian">Indian</option>
              <option value="Thai">Thai</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>

          {/* Servings, Cooking Time, Difficulty */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
              }}>
                Servings
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
              }}>
                Cooking Time (min)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
              }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}>
              Ingredients (one per line)
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Ingredient: Amount (e.g., Flour: 2 cups)"
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              style={{
                padding: '8px 16px',
                border: '1px dashed #ddd',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                color: '#666',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '8px',
                cursor: 'pointer',
              }}
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}>
              Instructions (one step per line)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step 1: Preheat oven..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '24px',
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#fee',
                color: '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#ff6b35',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
