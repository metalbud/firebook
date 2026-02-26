import React, { useState, useEffect, useContext } from "react";
import { View, FlatList, Button, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RecipeItemCardSmall from "../components/RecipeItemCardSmall";
import { useNavigation } from "@react-navigation/native";
import { DarkModeContext } from "../contexts/DarkModeContext"; // ✅ Import Dark Mode Context
import Header from "../components/Header";

const HistoryListScreen = () => {
  const { darkMode } = useContext(DarkModeContext); // ✅ Use global dark mode
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem("@history");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);

        // Log the loaded history for debugging
        console.log("Loaded history:", parsedHistory);

        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Unable to load history.");
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem("@history");
      setHistory([]);
      Alert.alert("Success", "History cleared.");
    } catch (error) {
      console.error("Error clearing history:", error);
      Alert.alert("Error", "Unable to clear history.");
    }
  };

  const handleSelectRecipe = (recipe) => {
    if (!recipe || !recipe.title) {
      Alert.alert("Error", "Recipe data is incomplete.");
      return;
    }

    navigation.navigate("RecipeDetails", { recipe });
  };

  return (
    <>
      <Header />
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <Text style={[styles.header, darkMode && styles.darkText]}>
          Viewed Recipes
        </Text>
        {history.length === 0 ? (
          <Text style={[styles.emptyText, darkMode && styles.darkText]}>
            No history available.
          </Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <RecipeItemCardSmall
                recipe={item}
                onPress={() => handleSelectRecipe(item)}
              />
            )}
          />
        )}
        <Button
          title="Clear History"
          onPress={clearHistory}
          color={darkMode ? "#777" : "#007AFF"}
        />
      </View>
    </>
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
    color: "#000",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  darkText: {
    color: "#fff", // ✅ Ensures readability in dark mode
  },
});

export default HistoryListScreen;
