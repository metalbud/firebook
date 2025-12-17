import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/HomeScreenStyles";
import RecipeItemCardSmall from "../components/RecipeItemCardSmall";
import RandomRecipesScreen from "./RandomRecipeScreen";
import Header from "../components/Header";
import { DarkModeContext } from "../contexts/DarkModeContext"; // バ. Import Dark Mode Context
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const { darkMode } = useContext(DarkModeContext); // バ. Use global dark mode
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  // バ. Load saved recipes from AsyncStorage
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

  // バ. Fetch recipe suggestions
  const fetchRecipeOptions = async () => {
    if (!userPrompt.trim()) {
      alert("Please enter a recipe request.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/suggested-recipes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: userPrompt }),
        }
      );

      const data = await response.json();
      setRecipeOptions(data.recipes || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Unable to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[
          styles.screen,
          darkMode ? styles.screenDark : styles.screenLight,
        ]}
      >
        <Header style={styles.header} />

        <LinearGradient
          colors={
            darkMode
              ? ["#140B0B", "#1F0E0C", "#2B120D"]
              : ["#FFE4CC", "#FF9B58", "#E4571E"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, darkMode && styles.heroCardDark]}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text
                style={[
                  styles.kicker,
                  darkMode ? styles.kickerDark : styles.kickerLight,
                ]}
              >
                Ignite your menu
              </Text>
              <Text
                style={[
                  styles.heroTitle,
                  darkMode ? styles.heroTitleDark : styles.heroTitleLight,
                ]}
              >
                Classy heat for home cooks
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  darkMode ? styles.heroSubtitleDark : styles.heroSubtitleLight,
                ]}
              >
                Tell us what you are craving and we will spark tailored recipes
                in seconds.
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{savedRecipes.length} saved</Text>
              <Text style={styles.badgeSub}>embers banked</Text>
            </View>
          </View>

          <View style={[styles.searchSection, darkMode && styles.searchSectionDark]}>
            <TextInput
              style={[styles.input, darkMode && styles.darkTextInput]}
              placeholder="What should we cook tonight?"
              placeholderTextColor={darkMode ? "#d6c7bd" : "#7a5948"}
              value={userPrompt}
              onChangeText={setUserPrompt}
              clearButtonMode="while-editing"
              returnKeyType="done"
              onSubmitEditing={() => {
                fetchRecipeOptions();
                Keyboard.dismiss();
              }}
            />
            <TouchableOpacity
              style={[styles.searchButton, darkMode && styles.darkButton]}
              onPress={() => {
                fetchRecipeOptions();
                Keyboard.dismiss();
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.searchButtonText}>Ignite</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {loading ? (
          <ActivityIndicator
            style={styles.loadingIndicator}
            size="large"
            color={darkMode ? "#FF9B58" : "#FF6B2C"}
          />
        ) : (
          <FlatList
            data={recipeOptions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <RecipeItemCardSmall
                recipe={item}
                source="HomeScreen"
                onPress={() => navigation.navigate("RecipeDetails", item)}
              />
            )}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      darkMode && styles.sectionTitleDark,
                    ]}
                  >
                    Sparks for you
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      darkMode && styles.sectionSubtitleDark,
                    ]}
                  >
                    Fresh pulls curated from your prompt.
                  </Text>
                </View>
                <View
                  style={[
                    styles.countPill,
                    darkMode && styles.countPillDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.countPillText,
                      darkMode && styles.countPillTextDark,
                    ]}
                  >
                    {recipeOptions.length} ready
                  </Text>
                </View>
              </View>
            }
            ListFooterComponent={<RandomRecipesScreen />}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;
