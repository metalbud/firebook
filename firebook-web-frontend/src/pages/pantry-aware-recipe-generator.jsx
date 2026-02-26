import React, { useState, useEffect, useMemo } from 'react';
import { complianceManager } from '../lib/compliance';

// Pantry-aware recipe generation with AI integration
export class RecipeGenerator {
  // Pantry management
  static addToPantry(ingredient, quantity = 1, unit = 'piece') {
    const pantry = this.getPantry();
    const existingIndex = pantry.findIndex(item => item.ingredient === ingredient);
    
    if (existingIndex >= 0) {
      pantry[existingIndex].quantity += quantity;
    } else {
      pantry.push({ ingredient, quantity, unit, addedDate: new Date() });
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebook_pantry', JSON.stringify(pantry));
    }
    return pantry;
  }

  static removeFromPantry(ingredient, quantity = 1) {
    const pantry = this.getPantry();
    const existingIndex = pantry.findIndex(item => item.ingredient === ingredient);
    
    if (existingIndex >= 0) {
      pantry[existingIndex].quantity -= quantity;
      if (pantry[existingIndex].quantity <= 0) {
        pantry.splice(existingIndex, 1);
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebook_pantry', JSON.stringify(pantry));
    }
    return pantry;
  }

  static getPantry() {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('firebook_pantry');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getPantryInventory() {
    return this.getPantry().reduce((inventory, item) => {
      if (!inventory[item.ingredient]) {
        inventory[item.ingredient] = { quantity: 0, unit: item.unit };
      }
      inventory[item.ingredient].quantity += item.quantity;
      return inventory;
    }, {});
  }

  // Dietary restriction support
  static getDietaryRestrictions() {
    const defaults = {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
      keto: false,
      lowCarb: false,
      pescatarian: false,
      customRestrictions: [],
    };

    if (typeof window === 'undefined') return defaults;

    try {
      const stored = localStorage.getItem('firebook_dietary_restrictions');
      return stored ? JSON.parse(stored) : defaults;
    } catch {
      return defaults;
    }
  }

  static updateDietaryRestrictions(restrictions) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebook_dietary_restrictions', JSON.stringify(restrictions));
    }
  }

  // Recipe generation with pantry awareness
  static async generatePantryAwareRecipe(userPrompt, pantryIngredients) {
    const dietaryRestrictions = this.getDietaryRestrictions();
    const pantryInventory = this.getPantryInventory();

    // Build context for AI
    const context = {
      prompt: userPrompt,
      availableIngredients: pantryInventory,
      dietaryRestrictions,
      restrictionsList: Object.entries(dietaryRestrictions)
        .filter(([_, allowed]) => !allowed)
        .map(([restriction]) => restriction)
    };

    // Mock AI generation (in production, this would call actual AI)
    const generatedRecipe = await this.mockAIGenerate(context);
    
    // Recipe validation and optimization
    const validatedRecipe = this.validateRecipe(generatedRecipe, context);
    
    return validatedRecipe;
  }

  // Mock AI generation (replace with actual API calls)
  static async mockAIGenerate(context) {
    // Mock response for development
    return {
      id: `recipe_${Date.now()}`,
      name: `${context.prompt.split(' ')[0]} Special`,
      description: `Delicious ${context.prompt.toLowerCase()} made with your available ingredients`,
      prepTime: 25,
      cookTime: 30,
      servings: 4,
      difficulty: 'Medium',
      dietaryInfo: this.getDietaryTags(context.dietaryRestrictions),
      ingredients: [
        { name: 'Chicken breast', quantity: 2, unit: 'pieces', available: true },
        { name: 'Olive oil', quantity: 2, unit: 'tbsp', available: true },
        { name: 'Garlic', quantity: 3, unit: 'cloves', available: true },
        { name: 'Salt', quantity: 1, unit: 'tsp', available: false },
        { name: 'Pepper', quantity: 1, unit: 'tsp', available: false }
      ],
      instructions: [
        'Season chicken with salt and pepper',
        'Heat olive oil in pan over medium heat',
        'Add garlic and sauté until fragrant',
        'Cook chicken until golden brown',
        'Serve hot with preferred side dish'
      ],
      nutrition: {
        calories: 450,
        protein: 35,
        carbs: 10,
        fat: 25,
        fiber: 2
      },
      tags: ['easy', 'quick', 'healthy', 'poultry'],
      createdAt: new Date().toISOString()
    };
  }

  // Recipe validation and dietary compliance checking
  static validateRecipe(recipe, context) {
    const validatedRecipe = { ...recipe };
    
    // Check dietary compliance
    validatedRecipe.dietaryCompliant = this.checkDietaryCompliance(recipe, context.dietaryRestrictions);
    
    // Calculate available vs needed ingredients
    validatedRecipe.neededIngredients = recipe.ingredients
      .filter(ing => !ing.available)
      .map(ing => `${ing.name} (${ing.quantity} ${ing.unit})`);
    
    // Calculate missing ingredients count
    validatedRecipe.missingCount = validatedRecipe.neededIngredients.length;
    validatedRecipe.coveragePercentage = Math.round(
      ((recipe.ingredients.length - validatedRecipe.missingCount) / recipe.ingredients.length) * 100
    );
    
    return validatedRecipe;
  }

  // Check recipe against dietary restrictions
  static checkDietaryCompliance(recipe, restrictions) {
    const restrictionsList = Object.entries(restrictions)
      .filter(([_, allowed]) => !allowed)
      .map(([restriction]) => restriction);

    // Basic compliance checks (expand based on actual recipe analysis)
    const compliance = {
      vegetarian: !restrictions.vegetarian || !recipe.tags?.includes('meat'),
      vegan: !restrictions.vegan || !recipe.tags?.includes('dairy'),
      glutenFree: !restrictions.glutenFree || !recipe.tags?.includes('wheat'),
      dairyFree: !restrictions.dairyFree || !recipe.tags?.includes('dairy'),
      nutFree: !restrictions.nutFree || !recipe.tags?.includes('nuts')
    };

    return Object.values(compliance).every(compliant => compliant);
  }

  // Get dietary tags based on restrictions
  static getDietaryTags(restrictions) {
    const tags = [];
    
    if (restrictions.vegetarian) tags.push('vegetarian');
    if (restrictions.vegan) tags.push('vegan');
    if (restrictions.glutenFree) tags.push('gluten-free');
    if (restrictions.dairyFree) tags.push('dairy-free');
    if (restrictions.nutFree) tags.push('nut-free');
    if (restrictions.keto) tags.push('keto');
    if (restrictions.lowCarb) tags.push('low-carb');
    
    return tags;
  }

  // Ingredient substitution suggestions
  static getSuggestedSubstitutions(ingredient, restrictions) {
    const substitutions = {
      'chicken breast': [
        { substitute: 'tofu', reason: 'vegetarian option', restriction: 'vegetarian' },
        { substitute: 'turkey', reason: 'poultry alternative' },
        { substitute: 'plant-based chicken', reason: 'vegan option', restriction: 'vegan' }
      ],
      'milk': [
        { substitute: 'almond milk', reason: 'dairy-free option', restriction: 'dairyFree' },
        { substitute: 'oat milk', reason: 'dairy-free option', restriction: 'dairyFree' },
        { substitute: 'coconut milk', reason: 'dairy-free option', restriction: 'dairyFree' }
      ],
      'wheat flour': [
        { substitute: 'almond flour', reason: 'gluten-free option', restriction: 'glutenFree' },
        { substitute: 'coconut flour', reason: 'gluten-free option', restriction: 'glutenFree' },
        { substitute: 'rice flour', reason: 'gluten-free option', restriction: 'glutenFree' }
      ]
    };

    return substitutions[ingredient.toLowerCase()] || [];
  }

  // Recipe difficulty calculation
  static calculateDifficulty(recipe) {
    const factors = {
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      ingredientCount: recipe.ingredients.length,
      steps: recipe.instructions.length
    };

    // Difficulty scoring algorithm
    let score = 0;
    score += factors.prepTime > 20 ? 1 : 0; // More prep time = higher difficulty
    score += factors.cookTime > 30 ? 1 : 0; // More cooking time = higher difficulty
    score += factors.ingredientCount > 10 ? 1 : 0; // More ingredients = higher difficulty
    score += factors.steps > 8 ? 1 : 0; // More steps = higher difficulty

    if (score <= 1) return 'Easy';
    if (score <= 2) return 'Medium';
    return 'Hard';
  }
}

// Pantry-aware Recipe Generator Component
export const PantryRecipeGenerator = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(RecipeGenerator.getDietaryRestrictions());
  const [pantryItems, setPantryItems] = useState(RecipeGenerator.getPantry());

  // Generate recipe with pantry awareness
  const generateRecipe = async () => {
    if (!userPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const recipe = await RecipeGenerator.generatePantryAwareRecipe(
        userPrompt, 
        pantryItems
      );
      setRecipes(prev => [recipe, ...prev]);
      setSelectedRecipe(recipe);
    } catch (error) {
      console.error('Recipe generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update dietary restrictions
  const updateRestrictions = (restriction, value) => {
    const newRestrictions = { ...dietaryRestrictions, [restriction]: value };
    setDietaryRestrictions(newRestrictions);
    RecipeGenerator.updateDietaryRestrictions(newRestrictions);
  };

  // Get pantry suggestions
  const getPantrySuggestions = useMemo(() => {
    const inventory = RecipeGenerator.getPantryInventory();
    return Object.keys(inventory).slice(0, 10); // Top 10 items
  }, [pantryItems]);

  return (
    <main className="page stack pantry-recipe-generator">
      <header className="generator-header stack">
        <h1>🍳 Pantry-Aware Recipe Generator</h1>
        <p>Generate recipes based on what you have in your pantry</p>
      </header>

      <div className="generator-content stack">
        {/* Dietary Restrictions */}
        <section className="card stack dietary-restrictions">
          <h3>Dietary Restrictions</h3>
          <div className="restriction-grid grid grid-auto-220">
            {Object.entries(dietaryRestrictions).filter(([key]) => key !== 'customRestrictions').map(([key, value]) => (
              <label key={key} className="restriction-checkbox row">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateRestrictions(key, e.target.checked)}
                />
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            ))}
          </div>
        </section>

        {/* Recipe Generation Input */}
        <section className="card stack recipe-input-section">
          <h3>What do you want to cook today?</h3>
          <div className="input-group row">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., chicken dinner, vegetarian pasta, healthy breakfast..."
              className="recipe-input flex-1"
            />
            <button
              type="button"
              onClick={generateRecipe}
              disabled={isGenerating || !userPrompt.trim()}
              className="generate-button btn-primary"
            >
              {isGenerating ? '🔄 Generating...' : '🍳 Generate Recipe'}
            </button>
          </div>
          
          {/* Pantry Suggestions */}
          <div className="pantry-suggestions">
            <h4>Available Ingredients:</h4>
            <div className="suggestion-tags row">
              {getPantrySuggestions.map(ingredient => (
                <span key={ingredient} className="ingredient-tag pill">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Recipe Results */}
        {recipes.length > 0 && (
          <section className="card stack recipe-results">
            <h3>Generated Recipes</h3>
            {recipes.map(recipe => (
              <div 
                key={recipe.id} 
                className={`card clickable recipe-card ${selectedRecipe?.id === recipe.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="recipe-header">
                  <h4>{recipe.name}</h4>
                  <div className="recipe-meta row gap-2">
                    <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                    <span>👥 {recipe.servings} servings</span>
                    <span>📊 {recipe.difficulty}</span>
                  </div>
                </div>
                
                <div className="recipe-coverage">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${recipe.coveragePercentage}%` }}
                    ></div>
                  </div>
                  <span>{recipe.coveragePercentage}% ingredients available</span>
                </div>

                {recipe.missingCount > 0 && (
                  <div className="missing-ingredients">
                    <small>Need: {recipe.missingCount} ingredients</small>
                  </div>
                )}

                <div className="dietary-tags row">
                  {recipe.dietaryInfo.map(tag => (
                    <span key={tag} className="dietary-tag pill">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Selected Recipe Details */}
        {selectedRecipe && (
          <section className="card stack recipe-details">
            <div className="recipe-details-header">
              <h2>{selectedRecipe.name}</h2>
              <p>{selectedRecipe.description}</p>
            </div>

            <div className="recipe-details-content">
              <div className="recipe-info">
                <div className="info-grid grid grid-cols-2">
                  <div className="info-item">
                    <strong>Prep Time:</strong> {selectedRecipe.prepTime} min
                  </div>
                  <div className="info-item">
                    <strong>Cook Time:</strong> {selectedRecipe.cookTime} min
                  </div>
                  <div className="info-item">
                    <strong>Difficulty:</strong> {selectedRecipe.difficulty}
                  </div>
                  <div className="info-item">
                    <strong>Servings:</strong> {selectedRecipe.servings}
                  </div>
                </div>
              </div>

              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <div className="ingredients-list stack gap-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className={`ingredient-item ${ingredient.available ? 'available' : 'missing'}`}>
                      <span
                        className={`ingredient-status ${ingredient.available ? 'available' : 'missing'}`}
                        aria-hidden="true"
                      >
                        {ingredient.available ? '✅' : '❌'}
                      </span>
                      <span>{ingredient.quantity} {ingredient.unit} {ingredient.name}</span>
                      {!ingredient.available && (
                        <span className="substitution-hint">
                          (Missing)
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {selectedRecipe.neededIngredients.length > 0 && (
                  <div className="shopping-list">
                    <h4>🛒 Shopping List:</h4>
                    <ul className="list">
                      {selectedRecipe.neededIngredients.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="instructions-section">
                <h3>Instructions</h3>
                <ol className="instructions-list list">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="nutrition-section">
                <h3>Nutrition Information</h3>
                <div className="nutrition-grid grid grid-cols-2">
                  <div className="nutrition-item">
                    <strong>Calories:</strong> {selectedRecipe.nutrition.calories}
                  </div>
                  <div className="nutrition-item">
                    <strong>Protein:</strong> {selectedRecipe.nutrition.protein}g
                  </div>
                  <div className="nutrition-item">
                    <strong>Carbs:</strong> {selectedRecipe.nutrition.carbs}g
                  </div>
                  <div className="nutrition-item">
                    <strong>Fat:</strong> {selectedRecipe.nutrition.fat}g
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default PantryRecipeGenerator;
