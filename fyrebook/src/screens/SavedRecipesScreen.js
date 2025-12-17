import React, { useState, useEffect, useContext } from "react";
import { View, FlatList, Text, StyleSheet, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RecipeItemCardLarge from "../components/RecipeItemCardLarge";
import { DarkModeContext } from "../contexts/DarkModeContext"; // ✅ Import Dark Mode Context
import Header from "../components/Header"; // ✅ Consistent header across screens

const SavedRecipesScreen = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem("@saved_recipes");
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes));
      }
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    }
  };

  const handleRemoveRecipe = async (recipeToRemove) => {
    const updatedRecipes = savedRecipes.filter(
      (r) => r.title !== recipeToRemove.title
    );
    setSavedRecipes(updatedRecipes);
    await AsyncStorage.setItem(
      "@saved_recipes",
      JSON.stringify(updatedRecipes)
    );
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <Header />
      <Text style={[styles.header, darkMode && styles.darkText]}>
        Saved Recipes
      </Text>
      {savedRecipes.length === 0 ? (
        <Text style={[styles.emptyText, darkMode && styles.darkText]}>
          No saved recipes yet!
        </Text>
      ) : (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <RecipeItemCardLarge recipe={item} onRemove={handleRemoveRecipe} />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  darkText: {
    color: "#fff",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
});
export default SavedRecipesScreen;
