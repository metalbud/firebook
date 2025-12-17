import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store"; // ✅ Import SecureStore
import Toast from "react-native-toast-message";

const addToSavedRecipes = async (recipe) => {
  console.log("📌 Save button pressed, initiating recipe save...");

  if (!recipe || !recipe.recipe_data) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Invalid recipe data.",
    });
    return;
  }

  try {
    // ✅ Check both SecureStore and AsyncStorage for the token
    let token = await AsyncStorage.getItem("@jwtToken");
    if (!token) {
      token = await SecureStore.getItemAsync("jwtToken"); // Fallback to SecureStore
    }

    console.log("🔹 Retrieved Token from Storage:", token);

    if (!token) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "You need to be logged in to save recipes.",
      });
      return;
    }

    // ✅ Retrieve locally saved recipes
    const storedRecipes = await AsyncStorage.getItem("@saved_recipes");
    let savedRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];

    // ✅ Check if the recipe is already saved
    if (
      savedRecipes.some(
        (savedRecipe) => savedRecipe.title === recipe.recipe_data.title
      )
    ) {
      Toast.show({
        type: "info",
        text1: "Already Saved",
        text2: "This recipe is already in your saved list.",
      });
      return;
    }

    // ✅ Add to local storage first
    savedRecipes.push(recipe.recipe_data);
    await AsyncStorage.setItem("@saved_recipes", JSON.stringify(savedRecipes));
    console.log("✅ Recipe added to local saved list.");

    // ✅ Send to backend with token
    const response = await fetch(
      `https://${process.env.FYREBOOK_BASE_URL}/api/save-recipe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Attach token
        },
        body: JSON.stringify(recipe.recipe_data),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Server Response Error:", data);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: data.error || "Failed to save the recipe to the database.",
      });
      return;
    }

    // ✅ Success: Show confirmation toast
    Toast.show({
      type: "success",
      text1: "Recipe Saved!",
      text2: "Successfully saved to your list and the database.",
    });

    console.log("📡 Recipe successfully saved to the database.");
  } catch (error) {
    console.error("❌ Error adding recipe to saved list:", error);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Unable to save the recipe. Please try again.",
    });
  }
};

export default addToSavedRecipes;
