import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import addToSavedRecipes from "../utils/addToSavedRecipes";
import { checkIfSaved } from "../utils/recipeUtils";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu"; // ✅ Import menu component
import { DarkModeContext } from "../contexts/DarkModeContext"; // ✅ Import Dark Mode Context

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

const RecipeItemCardLarge = ({ recipe, showSaveButton = true, onRemove }) => {
  const navigation = useNavigation();
  const { darkMode } = useContext(DarkModeContext);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      setIsSaved(await checkIfSaved(recipe));
    };
    fetchSavedStatus();
  }, []);

  const handlePress = () => {
    navigation.navigate("RecipeDetails", {
      recipeTitle: recipe.title,
    });
  };

  const handleSaveRecipe = async () => {
    if (isSaved) return;
    try {
      await addToSavedRecipes(recipe);
      setIsSaved(true);
    } catch (error) {
      console.error("❌ Error saving recipe:", error);
    }
  };

  const handleRemoveRecipe = async () => {
    if (onRemove) {
      await onRemove(recipe);
    }
  };

  const icon = categoryIcons[recipe.category] || categoryIcons.Default;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, darkMode && styles.darkCard]}>
        <TouchableOpacity onPress={handlePress}>
          <Image source={icon} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.header}>
          <TouchableOpacity style={styles.textContainer} onPress={handlePress}>
            <Text style={[styles.title, darkMode && styles.darkText]}>
              {String(recipe.title) || "No Title Available"}
            </Text>
            <Text
              style={[styles.description, darkMode && styles.darkText]}
              numberOfLines={3}
            >
              {String(recipe.description) || "No Description Available"}
            </Text>
          </TouchableOpacity>

          <Menu>
            <MenuTrigger customStyles={{ triggerWrapper: styles.menuTrigger }}>
              <Text style={[styles.menuIcon, darkMode && styles.darkText]}>
                ⋮
              </Text>
            </MenuTrigger>
            <MenuOptions>
              <MenuOption
                onSelect={handleRemoveRecipe}
                text="Remove from List"
              />
            </MenuOptions>
          </Menu>
        </View>

        {showSaveButton && !isSaved && (
          <TouchableOpacity
            style={[styles.saveButton, darkMode && styles.darkSaveButton]}
            onPress={handleSaveRecipe}
          ></TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#1E1E1E",
    shadowColor: "#000",
    borderColor: "#444",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 150, // Fixed height for consistency
    resizeMode: "cover",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  darkText: {
    color: "#fff",
  },
  menuIcon: {
    fontSize: 24,
    padding: 10,
    color: "#888",
  },
  saveButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#29A887",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  darkSaveButton: {
    backgroundColor: "#444",
  },
});
export default RecipeItemCardLarge;
