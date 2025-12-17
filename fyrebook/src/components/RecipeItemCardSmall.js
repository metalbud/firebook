import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ToastAndroid,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import addToSavedRecipes from "../utils/addToSavedRecipes";
import { checkIfSaved } from "../utils/recipeUtils"; // ƒo. Import shared function
import { DarkModeContext } from "../contexts/DarkModeContext"; // ƒo. Import Dark Mode Context
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import theme from "../styles/theme";

const categoryIcons = {
  Desserts: require("../../assets/icons/desserts.png"),
  Breakfast: require("../../assets/icons/breakfast.png"),
  Dinner: require("../../assets/icons/dinner.png"),
  Appetizers: require("../../assets/icons/appetizers.png"),
  Soups: require("../../assets/icons/soups.png"),
  Salads: require("../../assets/icons/salads.png"),
  Snacks: require("../../assets/icons/snacks.png"),
  Beverages: require("../../assets/icons/beverages.png"),
  Vegetarian: require("../../assets/icons/vegetarian.png"),
  Seafood: require("../../assets/icons/seafood.png"),
  Kids: require("../../assets/icons/kids.png"),
  Default: require("../../assets/icons/default.png"),
};

const RecipeItemCardSmall = ({
  recipe = {},
  showSaveButton = true,
  onPress,
}) => {
  const navigation = useNavigation();
  const { darkMode } = useContext(DarkModeContext); // ƒo. Use global dark mode
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!recipe) return;
      setIsSaved(await checkIfSaved(recipe)); // ƒo. Use shared function
    };
    fetchSavedStatus();
  }, [recipe]);

  const fetchRecipeFromDatabase = async () => {
    try {
      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/get-saved-recipe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId: recipe.id }),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.recipe;
    } catch (error) {
      console.error("Error fetching recipe from database:", error);
      return null;
    }
  };

  const handlePress = async () => {
    if (onPress) {
      onPress(recipe);
      return;
    }
    if (!recipe) return;
    setLoading(true);
    const fetchedRecipe = await fetchRecipeFromDatabase(recipe.id);
    setLoading(false);
    if (fetchedRecipe) {
      navigation.navigate("RecipeDetails", { recipe: fetchedRecipe });
    } else {
      navigation.navigate("RecipeDetails", { recipeTitle: recipe.title });
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe || isSaved) return;

    try {
      let token = await AsyncStorage.getItem("@jwtToken");

      if (!token) {
        token = await SecureStore.getItemAsync("jwtToken"); // Try SecureStore
      }

      if (!token) {
        showToast("Authentication required. Please log in again.");
        return;
      }

      // Always fetch full recipe details before saving
      const fetchedRecipe = await fetchRecipeFromDatabase(recipe.id);
      const recipeToSave = fetchedRecipe || recipe;

      if (
        !recipeToSave.ingredients ||
        !recipeToSave.instructions ||
        (Array.isArray(recipeToSave.ingredients) &&
          recipeToSave.ingredients.length === 0) ||
        (Array.isArray(recipeToSave.instructions) &&
          recipeToSave.instructions.length === 0)
      ) {
        throw new Error("Complete recipe data not available.");
      }

      await addToSavedRecipes(recipeToSave);
      setIsSaved(true);

      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/save-recipe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: recipeToSave.title,
            description: recipeToSave.description,
            category: recipeToSave.category,
            ingredients: recipeToSave.ingredients,
            instructions: recipeToSave.instructions,
            nutritional_info: recipeToSave.nutritional_info,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save the recipe.");
      }

      showToast("Recipe saved! You earned flames.");
    } catch (error) {
      console.error("Error saving recipe:", error);
      showToast("Failed to save the recipe.");
    }
  };

  // ƒo. Show toast on Android, Alert on iOS
  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Notification", message);
    }
  };

  const icon = categoryIcons[recipe.category] || categoryIcons.Default;

  return (
    <TouchableOpacity
      style={[styles.card, darkMode && styles.darkCard, loading && styles.cardDisabled]}
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={loading}
    >
      <View style={[styles.flameBar, darkMode && styles.flameBarDark]} />
      <View style={[styles.iconContainer, darkMode && styles.iconContainerDark]}>
        <Image source={icon} style={styles.iconImage} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, darkMode && styles.titleDark]}
            numberOfLines={1}
          >
            {String(recipe.title) || "No Title Available"}
          </Text>
          <View
            style={[
              styles.categoryTag,
              darkMode && styles.categoryTagDark,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                darkMode && styles.categoryTextDark,
              ]}
            >
              {(recipe.category || "Recipe").toUpperCase()}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.description, darkMode && styles.descriptionDark]}
          numberOfLines={2}
        >
          {String(recipe.description) || "No Description Available"}
        </Text>

        {showSaveButton && (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                darkMode && styles.saveButtonDark,
                (isSaved || loading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveRecipe}
              disabled={isSaved || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>
                {isSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.18)",
    shadowColor: "rgba(0, 0, 0, 0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: theme.charcoal,
    borderColor: "rgba(255, 146, 72, 0.35)",
    shadowColor: "#000",
  },
  cardDisabled: {
    opacity: 0.8,
  },
  flameBar: {
    width: 6,
    height: 72,
    borderRadius: 10,
    backgroundColor: theme.primaryColor,
    marginRight: 12,
  },
  flameBarDark: {
    backgroundColor: "#FF9248",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "rgba(255, 107, 44, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerDark: {
    backgroundColor: "rgba(255, 107, 44, 0.18)",
    borderColor: "rgba(255, 146, 72, 0.35)",
  },
  iconImage: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B0F0B",
    flex: 1,
  },
  titleDark: {
    color: "#fff",
  },
  categoryTag: {
    backgroundColor: "rgba(255, 107, 44, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.24)",
  },
  categoryTagDark: {
    backgroundColor: "rgba(255, 107, 44, 0.2)",
    borderColor: "rgba(255, 146, 72, 0.36)",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A2B06",
    letterSpacing: 0.5,
  },
  categoryTextDark: {
    color: "#FFE9DC",
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "#4A332A",
    lineHeight: 18,
  },
  descriptionDark: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#1B0F0B",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  saveButtonDark: {
    backgroundColor: "#2B1A17",
    borderColor: "rgba(255, 146, 72, 0.35)",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.primaryColor,
    letterSpacing: 0.4,
  },
});

export default RecipeItemCardSmall;
