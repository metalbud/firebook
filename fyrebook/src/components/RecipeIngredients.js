import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styles from "../styles/RecipeDetailStyles";

const RecipeIngredients = ({
  darkMode,
  isEditing,
  editedIngredients,
  setEditedIngredients,
  selectedRecipeDetails,
  useMetric,
  recipeScale,
}) => {
  return (
    <>
      {isEditing ? (
        <>
          {editedIngredients.map((ingredient, index) => (
            <View
              key={index}
              style={[
                styles.ingredientRow,
                darkMode && styles.darkIngredientRow,
              ]}
            >
              <TextInput
                style={[
                  styles.ingredientInput,
                  darkMode && styles.darkIngredientInput,
                ]}
                value={ingredient.name}
                onChangeText={(text) => {
                  const newIngredients = [...editedIngredients];
                  newIngredients[index] = { ...ingredient, name: text };
                  setEditedIngredients(newIngredients);
                }}
                placeholder="Ingredient name"
                placeholderTextColor={darkMode ? "#666" : "#999"}
              />
              <View style={styles.amountContainer}>
                <TextInput
                  style={[
                    styles.amountInput,
                    darkMode && styles.darkIngredientInput,
                  ]}
                  value={
                    useMetric ? ingredient.amount_metric : ingredient.amount
                  }
                  onChangeText={(text) => {
                    const newIngredients = [...editedIngredients];
                    if (useMetric) {
                      newIngredients[index] = {
                        ...ingredient,
                        amount_metric: text,
                      };
                    } else {
                      newIngredients[index] = { ...ingredient, amount: text };
                    }
                    setEditedIngredients(newIngredients);
                  }}
                  placeholder={
                    useMetric
                      ? "Amount (e.g. 450g, 1L)"
                      : "Amount (e.g. 2 cups, 1/2 tsp)"
                  }
                  placeholderTextColor={darkMode ? "#666" : "#999"}
                />
                <TextInput
                  style={[
                    styles.unitInput,
                    darkMode && styles.darkIngredientInput,
                  ]}
                  value={useMetric ? ingredient.unit_metric : ingredient.unit}
                  onChangeText={(text) => {
                    const newIngredients = [...editedIngredients];
                    if (useMetric) {
                      newIngredients[index] = {
                        ...ingredient,
                        unit_metric: text,
                      };
                    } else {
                      newIngredients[index] = { ...ingredient, unit: text };
                    }
                    setEditedIngredients(newIngredients);
                  }}
                  placeholder="Unit"
                  placeholderTextColor={darkMode ? "#666" : "#999"}
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  const newIngredients = editedIngredients.filter(
                    (_, i) => i !== index
                  );
                  setEditedIngredients(newIngredients);
                }}
              >
                <Text style={styles.buttonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditedIngredients([
                ...editedIngredients,
                {
                  name: "",
                  amount: "",
                  amount_metric: "",
                },
              ]);
            }}
          >
            <Text style={styles.buttonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.ingredientsGrid}>
          {selectedRecipeDetails.recipe_data?.ingredients.map(
            (ingredient, index) => (
              <View
                key={index}
                style={[
                  styles.ingredientItem,
                  darkMode && styles.darkIngredientItem,
                ]}
              >
                <Text
                  style={[styles.ingredientName, darkMode && styles.darkText]}
                >
                  {ingredient.name}
                </Text>
                <Text
                  style={[styles.ingredientAmount, darkMode && styles.darkText]}
                >
                  {useMetric
                    ? `${ingredient.amount_metric}`
                    : `${ingredient.amount}`}
                </Text>
              </View>
            )
          )}
        </View>
      )}
    </>
  );
};

export default RecipeIngredients;
