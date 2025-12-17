import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../contexts/userContext";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  Share,
  SafeAreaView,
  TextInput,
  Alert,
  Keyboard,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as SecureStore from "expo-secure-store";
import RecipeControls from "../components/RecipeControls";
import RecipeIngredients from "../components/RecipeIngredients";
import RecipeInstructions from "../components/RecipeInstructions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FYREBOOK_BASE_URL } from "@env";
import { DarkModeContext } from "../contexts/DarkModeContext";
import addToSavedRecipes from "../utils/addToSavedRecipes";
import { getSuggestedRecipes } from "../utils/recipeUtils";
import Header from "../components/Header";
import LoadingScreen from "./LoadingScreen";
import styles from "../styles/RecipeDetailStyles";

const RecipeDetailsScreen = () => {
  const { darkMode } = useContext(DarkModeContext);
  const { user } = useContext(UserContext);
  const route = useRoute();
  const navigation = useNavigation();

  // Accept multiple param shapes: { recipe }, { recipeTitle }, or raw recipe object
  const params = route.params || {};
  const incomingRecipe = params.recipe || (params.title ? params : null);
  const recipeId = incomingRecipe?.id || params.id;
  const recipeTitle =
    params.recipeTitle || incomingRecipe?.title || params.title || null;

  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState([]);
  const [useMetric, setUseMetric] = useState(false);
  const [recipeScale, setRecipeScale] = useState(1);
  const [showScaleOptions, setShowScaleOptions] = useState(false);
  const [question, setQuestion] = useState("");
  const [questionHistory, setQuestionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);

  const hasFullRecipeData = (recipeObj) =>
    recipeObj &&
    Array.isArray(recipeObj.ingredients) &&
    recipeObj.ingredients.length > 0 &&
    Array.isArray(recipeObj.instructions) &&
    recipeObj.instructions.length > 0;

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${FYREBOOK_BASE_URL}/api/recipe-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeContext: selectedRecipeDetails.recipe_data,
            question: question.trim(),
            conversationHistory: questionHistory.slice(-3).map((item) => ({
              role: "user",
              content: item.question,
            })),
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setQuestionHistory((prev) => [
        { question: question.trim(), answer: data.answer },
        ...prev,
      ]);
      setQuestion("");
    } catch (error) {
      console.error("Error asking question:", error);
      Alert.alert("Error", "Failed to get an answer. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    const newRecipe = {
      ...selectedRecipeDetails.recipe_data,
      title: `${user?.username || "My"}'s ${
        selectedRecipeDetails.recipe_data.title
      }`,
      ingredients: editedIngredients,
    };
    const recipeToSave = { recipe_data: newRecipe };
    await addToSavedRecipes(recipeToSave);
    setIsEditing(false);
    setIsSaved(true);
    setSelectedRecipeDetails(recipeToSave);
  };

  const handleGetSuggestedRecipes = async () => {
    try {
      const suggestions = await getSuggestedRecipes(recipeTitle);
      setSuggestedRecipes(suggestions);
    } catch (error) {
      console.error("Error fetching suggested recipes:", error);
      Alert.alert("Error", "Failed to fetch suggested recipes");
    }
  };

  const fetchRecipeFromDatabase = async (titleForLookup) => {
    try {
      const response = await fetch(
        `https://${FYREBOOK_BASE_URL}/api/get-saved-recipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipeId: recipeId || incomingRecipe?.id,
            recipeTitle: titleForLookup,
          }),
        }
      );
      if (!response.ok) {
        console.warn("Recipe not found in database.");
        return null;
      }
      const data = await response.json();
      return data.recipe;
    } catch (error) {
      console.error("Error fetching recipe from database:", error);
      return null;
    }
  };

  const fetchSelectedRecipeDetails = async (titleForLookup) => {
    try {
      const response = await fetch(
        `https://${FYREBOOK_BASE_URL}/api/fetch-recipe-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeTitle: titleForLookup }),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch recipe details: ${response.statusText}`
        );
      }
      const data = await response.json();
      setSelectedRecipeDetails(data);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      Alert.alert(
        "Network Error",
        "Unable to fetch recipe details. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRecipeData = async () => {
      if (!recipeTitle && !incomingRecipe) return;
      setLoading(true);

      // Use incoming recipe if it already has full data
      if (hasFullRecipeData(incomingRecipe)) {
        setSelectedRecipeDetails({ recipe_data: incomingRecipe });
        setIsSaved(false);
        setLoading(false);
        return;
      }

      const titleForLookup = incomingRecipe?.title || recipeTitle;

      // Check AsyncStorage (saved recipes)
      const storedRecipes = await AsyncStorage.getItem("@saved_recipes");
      if (storedRecipes) {
        const savedRecipes = JSON.parse(storedRecipes);
        const foundRecipe = savedRecipes.find(
          (r) => r.title === titleForLookup || r.id === recipeId
        );
        if (foundRecipe) {
          setSelectedRecipeDetails({ recipe_data: foundRecipe });
          setIsSaved(true);
          setLoading(false);
          return;
        }
      }

      // Check the database
      const dbRecipe = await fetchRecipeFromDatabase(titleForLookup);
      if (dbRecipe) {
        setSelectedRecipeDetails({ recipe_data: dbRecipe });
        setIsSaved(true);
        setLoading(false);
        return;
      }

      // Fallback to API/LLM fetch if we have a title
      if (titleForLookup) {
        await fetchSelectedRecipeDetails(titleForLookup);
      } else {
        Alert.alert("Recipe Missing", "No recipe title was provided.");
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [recipeTitle, recipeId, incomingRecipe]);

  const handleShareRecipe = async () => {
    if (!selectedRecipeDetails) {
      alert("No recipe data available to share.");
      return;
    }
    const { title, category, description, ingredients, instructions } =
      selectedRecipeDetails.recipe_data;
    const message = `🔥 *${title}* 🔥\n\n📂 Category: ${category}\n\n📝 Description: ${description}\n\n🥕 Ingredients:\n${ingredients
      .map((ing) => `- ${ing.name}: ${ing.amount} (${ing.amount_metric})`)
      .join("\n")}\n\n👩‍🍳 Instructions:\n${instructions
      .map((inst, index) => `${index + 1}. ${inst.description}`)
      .join("\n")}\n\nFind this recipe and more at https://firebook.app`;
    try {
      const shareResult = await Share.share({
        title: `Check out this recipe: ${title}`,
        message,
      });
      if (shareResult.action === Share.sharedAction) {
        try {
          const response = await fetch(
            `https://${FYREBOOK_BASE_URL}/api/track-share`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await SecureStore.getItemAsync(
                  "jwtToken"
                )}`,
              },
              body: JSON.stringify({
                recipe_id: selectedRecipeDetails.recipe_data.id,
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            console.log(`🔥 Awarded ${data.flamesAwarded} flames for sharing!`);
          }
        } catch (error) {
          console.error("Error tracking share:", error);
        }
      }
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: darkMode ? "#222" : "#fff" }}
    >
      <Header />
      <KeyboardAwareScrollView
        style={[styles.container, darkMode && styles.darkContainer]}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 150 : 500}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={0}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      >
        {selectedRecipeDetails ? (
          <View>
            <View
              style={[
                styles.recipeHeaderSection,
                darkMode && styles.darkRecipeHeaderSection,
              ]}
            >
              <Text style={[styles.header, darkMode && styles.darkHeader]}>
                {selectedRecipeDetails.recipe_data?.title || "Recipe Title"}
              </Text>
              <Text style={[styles.category, darkMode && styles.darkCategory]}>
                {selectedRecipeDetails.recipe_data?.category || "Category"}
              </Text>
              <Text
                style={[styles.description, darkMode && styles.darkDescription]}
              >
                {selectedRecipeDetails.recipe_data?.description ||
                  "Recipe description"}
              </Text>
            </View>
            <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
              Ingredients:
            </Text>
            <View
              style={[
                styles.ingredientsContainer,
                darkMode && styles.darkIngredientsContainer,
              ]}
            >
              <RecipeControls
                darkMode={darkMode}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editedIngredients={editedIngredients}
                setEditedIngredients={setEditedIngredients}
                selectedRecipeDetails={selectedRecipeDetails}
                useMetric={useMetric}
                setUseMetric={setUseMetric}
                recipeScale={recipeScale}
                setRecipeScale={setRecipeScale}
                showScaleOptions={showScaleOptions}
                setShowScaleOptions={setShowScaleOptions}
              />
              <RecipeIngredients
                darkMode={darkMode}
                isEditing={isEditing}
                editedIngredients={editedIngredients}
                setEditedIngredients={setEditedIngredients}
                selectedRecipeDetails={selectedRecipeDetails}
                useMetric={useMetric}
                recipeScale={recipeScale}
              />
            </View>
            <RecipeInstructions
              darkMode={darkMode}
              instructions={
                selectedRecipeDetails.recipe_data?.instructions || []
              }
            />

            <View style={{ marginVertical: 15, alignItems: "center" }}>
              {suggestedRecipes.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={[styles.sectionTitle, darkMode && styles.darkText]}
                  >
                    Suggested Recipes:
                  </Text>
                  {suggestedRecipes.map((recipe, index) => (
                    <Text
                      key={index}
                      style={{ color: darkMode ? "#fff" : "#000" }}
                    >
                      • {recipe.title || recipe}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <Button
                  title="Save Changes"
                  onPress={handleSaveChanges}
                  color={darkMode ? "#888" : "#29A887"}
                />
              ) : (
                !isSaved && (
                  <Button
                    title="Save Recipe"
                    onPress={() => addToSavedRecipes(selectedRecipeDetails)}
                    color={darkMode ? "#888" : "#29A887"}
                  />
                )
              )}
              <Button
                title="Share Recipe"
                onPress={handleShareRecipe}
                color="#007AFF"
              />
              <Button
                title="Go Back"
                onPress={() => navigation.goBack()}
                color={darkMode ? "#888" : "#000"}
              />
            </View>

            <View
              style={[
                styles.questionContainer,
                { marginBottom: Platform.OS === "android" ? 200 : 100 },
              ]}
            >
              <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
                Have a Question?
              </Text>
              <TextInput
                style={[
                  styles.questionInput,
                  darkMode && styles.darkQuestionInput,
                ]}
                placeholder="Ask anything about this recipe..."
                placeholderTextColor={darkMode ? "#666" : "#999"}
                multiline={true}
                value={question}
                onChangeText={setQuestion}
                onFocus={() => {
                  setTimeout(() => {
                    this.scrollView?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
              <View style={styles.questionButtonContainer}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={darkMode ? "#888" : "#29A887"}
                  />
                ) : (
                  <Button
                    title="Ask Question"
                    onPress={() => {
                      Keyboard.dismiss();
                      handleAskQuestion();
                    }}
                    color={darkMode ? "#888" : "#29A887"}
                  />
                )}
              </View>
              {questionHistory.map((item, index) => (
                <View key={index} style={styles.questionHistoryItem}>
                  <Text
                    style={[styles.questionText, darkMode && styles.darkText]}
                  >
                    Q: {item.question}
                  </Text>
                  <Text
                    style={[styles.answerText, darkMode && styles.darkText]}
                  >
                    A: {item.answer}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text>No recipe data found.</Text>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RecipeDetailsScreen;
