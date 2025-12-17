import React, { useState, useEffect, useContext } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import RecipeItemCardSmall from "../components/RecipeItemCardSmall";
import { DarkModeContext } from "../contexts/DarkModeContext"; // ✅ Import global dark mode
import AsyncStorage from "@react-native-async-storage/async-storage";

const RandomRecipesScreen = () => {
  const { darkMode } = useContext(DarkModeContext); // ✅ Use global dark mode
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      // ✅ Step 1: Load saved recipes from AsyncStorage first
      const storedRecipes = await AsyncStorage.getItem("@random_recipes");
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
        setLoading(false);
      } else {
        // ✅ Step 2: If no saved recipes, fetch new ones from the API
        fetchRandomRecipes();
      }
    } catch (error) {
      console.error("Error loading recipes from storage:", error);
      fetchRandomRecipes(); // ✅ Fallback to API call
    }
  };

  const fetchRandomRecipes = async () => {
    try {
      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/random-recipes?limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch random recipes");
      }

      const data = await response.json();

      // ✅ Ensure full recipe data exists before saving
      const enrichedRecipes = await Promise.all(
        data.recipes.map(async (recipe) => {
          const fullRecipe = await fetchFullRecipeIfNeeded(recipe);
          return { ...fullRecipe, id: recipe.id || fullRecipe.id };
        })
      );

      // ✅ Save to AsyncStorage for faster access next time
      await AsyncStorage.setItem(
        "@random_recipes",
        JSON.stringify(enrichedRecipes)
      );

      setRecipes(enrichedRecipes);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      Alert.alert("Error", "Unable to fetch random recipes.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch full recipe data if missing details (prevents LLM call)
  const fetchFullRecipeIfNeeded = async (recipe) => {
    if (recipe.ingredients && recipe.instructions) {
      return recipe; // ✅ Already has full details
    }

    // ✅ Check AsyncStorage first
    const storedRecipes = await AsyncStorage.getItem("@saved_recipes");
    if (storedRecipes) {
      const savedRecipes = JSON.parse(storedRecipes);
      const foundRecipe = savedRecipes.find((r) => r.title === recipe.title);
      if (foundRecipe) {
        return foundRecipe; // ✅ Return saved recipe
      }
    }

    // ✅ If not found in storage, try fetching from the database
    try {
      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/get-saved-recipe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeTitle: recipe.title }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.recipe;
      }
    } catch (error) {
      console.error("Error fetching full recipe from database:", error);
    }

    return recipe; // ✅ Return the original recipe if no additional data is found
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.header, darkMode && styles.darkText]}>
        Featured Recipes
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color={darkMode ? "#bbb" : "#29A887"} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RecipeItemCardSmall recipe={item} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  darkContainer: {
    backgroundColor: "#121212", // ✅ Dark mode background
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  darkText: {
    color: "#fff", // ✅ Ensures readability in dark mode
  },
});

export default RandomRecipesScreen;
