import React, { useEffect, useState } from "react";
import Link from "next/link";
import PrivacyConsent from "../components/PrivacyConsent";
import {
  AIContentMarker,
  ContentSafetyValidator,
  RecipeSafetyBadge,
} from "../components/ContentSafetyValidator";
import { complianceManager } from "../lib/compliance";

export default function RecipeGenerationPage() {
  const [recipePrompt, setRecipePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const settings = complianceManager.getPrivacySettings();
    if (!settings.dataCollection) {
      const timer = setTimeout(() => setShowPrivacy(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGenerateRecipe = async () => {
    if (!recipePrompt.trim()) return;

    setIsGenerating(true);

    try {
      const mockRecipe = {
        title: `Delicious ${recipePrompt.split(" ")[0] || "Pantry"} Dish`,
        ingredients: [
          `2 cups fresh ${recipePrompt}`,
          "1 tbsp olive oil",
          "Salt and pepper to taste",
          "Fresh herbs for garnish",
        ],
        instructions: [
          `Prepare your ingredients by washing and chopping the ${recipePrompt}`,
          "Heat olive oil in a large pan over medium heat",
          `Add ${recipePrompt} and cook until tender`,
          "Season with salt and pepper to taste",
          "Garnish with fresh herbs and serve hot",
        ],
        nutrition: {
          calories: 250,
          protein: "8g",
          carbs: "30g",
          fat: "12g",
        },
        cookingTime: "20 minutes",
        difficulty: "Easy",
        isAI: true,
        model: "GPT-4o",
      };

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setGeneratedRecipe(mockRecipe);

      await fetch("/api/usage/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          model: "gpt4o",
          requestType: "recipe_generation",
          metadata: { prompt: recipePrompt },
        }),
      });
    } catch (error) {
      console.error("Failed to generate recipe:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const recipeText = generatedRecipe
    ? `${generatedRecipe.title}\n\n${generatedRecipe.ingredients.join(
        "\n"
      )}\n\n${generatedRecipe.instructions.join("\n")}`
    : "";

  return (
    <main className="page stack">
      {showPrivacy && (
        <PrivacyConsent onClose={() => setShowPrivacy(false)} onUpdate={() => {}} />
      )}

      <header className="stack">
        <h1>Recipe Generator</h1>
        <p className="muted">
          Turn your ingredients into chef-grade recipes with AI-powered assistance.
        </p>
      </header>

      <div className="grid grid-2">
        <section className="card stack">
          <div className="stack">
            <h2>What ingredients do you have?</h2>
            <p className="muted">
              Describe what you have available and we’ll generate a recipe.
            </p>
          </div>

          <textarea
            value={recipePrompt}
            onChange={(e) => setRecipePrompt(e.target.value)}
            placeholder="e.g., chicken breast, broccoli, rice, soy sauce..."
            rows={4}
          />

          <div className="row justify-between">
            <div className="row">
              <span className="muted">🤖 AI generation</span>
              <AIContentMarker isAI={true} model="GPT-4o" />
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleGenerateRecipe}
              disabled={isGenerating || !recipePrompt.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" />
                  Generating…
                </>
              ) : (
                "Generate Recipe"
              )}
            </button>
          </div>
        </section>

        <section className="stack">
          {generatedRecipe ? (
            <ContentSafetyValidator content={recipeText} type="recipe">
              <article className="card stack">
                <div className="stack gap-3">
                  <div className="row justify-between">
                    <div className="stack gap-2">
                      <h2>{generatedRecipe.title}</h2>
                      <div className="row">
                        <RecipeSafetyBadge isSafe={true} issues={[]} />
                        <AIContentMarker
                          isAI={generatedRecipe.isAI}
                          model={generatedRecipe.model}
                        />
                      </div>
                    </div>
                    <div className="stack items-end gap-2">
                      <span className="muted">⏱ {generatedRecipe.cookingTime}</span>
                      <span className="muted">📊 {generatedRecipe.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="stack">
                  <h3>Ingredients</h3>
                  <ul className="list">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div className="stack">
                  <h3>Instructions</h3>
                  <ol className="list">
                    {generatedRecipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div className="stack">
                  <h3>Nutritional Information</h3>
                  <div className="grid grid-cols-2">
                    <div className="panel">
                      <div className="muted">Calories</div>
                      <div className="fw-750">{generatedRecipe.nutrition.calories}</div>
                    </div>
                    <div className="panel">
                      <div className="muted">Protein</div>
                      <div className="fw-750">{generatedRecipe.nutrition.protein}</div>
                    </div>
                    <div className="panel">
                      <div className="muted">Carbs</div>
                      <div className="fw-750">{generatedRecipe.nutrition.carbs}</div>
                    </div>
                    <div className="panel">
                      <div className="muted">Fat</div>
                      <div className="fw-750">{generatedRecipe.nutrition.fat}</div>
                    </div>
                  </div>
                </div>

                <div className="row justify-end">
                  <button type="button" className="btn-ghost">
                    Save
                  </button>
                  <button type="button" className="btn-ghost">
                    Share
                  </button>
                  <button type="button" className="btn-primary">
                    Generate New
                  </button>
                </div>
              </article>
            </ContentSafetyValidator>
          ) : (
            <div className="card stack">
              <h3>Ready to cook something amazing?</h3>
              <p className="muted">
                Enter ingredients on the left and we’ll generate a personalized recipe.
              </p>
              <div className="grid grid-cols-2">
                <div className="row">
                  <span>🎯</span>
                  <span className="muted">Personalized recipes</span>
                </div>
                <div className="row">
                  <span>⏱</span>
                  <span className="muted">Step-by-step guidance</span>
                </div>
                <div className="row">
                  <span>📊</span>
                  <span className="muted">Nutritional information</span>
                </div>
                <div className="row">
                  <span>🥗</span>
                  <span className="muted">Dietary awareness</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="privacy-notice">
        <div className="stack gap-3">
          <h3>🛡️ Privacy &amp; AI Notice</h3>
          <p className="privacy-text">
            When you generate recipes, your prompts and ingredients are processed by AI
            models (GPT-4o-mini by OpenAI, GLM-4.5-Flash by Z.ai) to create
            personalized recipes.
          </p>
          <div className="row justify-end">
            <Link href="/privacy-policy" className="btn btn-ghost">
              Read Privacy Policy
            </Link>
            <button type="button" className="btn-primary" onClick={() => setShowPrivacy(true)}>
              Manage Privacy Settings
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
