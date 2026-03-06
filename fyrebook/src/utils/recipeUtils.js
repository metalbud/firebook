/**
 * Utility functions for interacting with backend recipe endpoints.
 */

import { FYREBOOK_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function checkIfSaved(recipe) {
  try {
    if (!recipe) return false;
    const storedRecipes = await AsyncStorage.getItem("@saved_recipes");
    if (!storedRecipes) return false;
    const savedRecipes = JSON.parse(storedRecipes);
    return savedRecipes.some(
      (r) => r.title === recipe.title || (recipe.id && r.id === recipe.id)
    );
  } catch (error) {
    console.error("Error checking if recipe is saved:", error);
    return false;
  }
}

export async function getSuggestedRecipes(prompt) {
  try {
    const response = await fetch(
      `https://${FYREBOOK_BASE_URL}/api/suggested-recipes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch suggested recipes");
    }
    const recipes = await response.json();
    return recipes;
  } catch (error) {
    console.error("Error in getSuggestedRecipes:", error);
    throw error;
  }
}

export async function fetchRecipeDetails(recipeTitle) {
  try {
    const response = await fetch(
      `https://${FYREBOOK_BASE_URL}/api/fetch-recipe-details`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeTitle }),
      }
    );
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
