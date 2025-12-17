/**
 * Utility functions for interacting with backend recipe endpoints.
 */

export async function getSuggestedRecipes(prompt) {
  try {
    const response = await fetch("/api/suggested-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch suggested recipes");
    }
    // The backend returns an array of recipes directly.
    const recipes = await response.json();
    return recipes;
  } catch (error) {
    console.error("Error in getSuggestedRecipes:", error);
    throw error;
  }
}

export async function fetchRecipeDetails(recipeTitle) {
  try {
    const response = await fetch("/api/fetch-recipe-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeTitle }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch recipe details");
    }
    const details = await response.json();
    return details;
  } catch (error) {
    console.error("Error in fetchRecipeDetails:", error);
    throw error;
  }
}
