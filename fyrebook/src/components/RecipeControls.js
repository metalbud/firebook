import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/RecipeDetailStyles";

const RecipeControls = ({
  darkMode,
  isEditing,
  setIsEditing,
  editedIngredients,
  setEditedIngredients,
  selectedRecipeDetails,
  useMetric,
  setUseMetric,
  recipeScale,
  setRecipeScale,
  showScaleOptions,
  setShowScaleOptions,
}) => {
  return (
    <View style={styles.ingredientsHeader}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setIsEditing(!isEditing);
          if (!isEditing) {
            setEditedIngredients([...selectedRecipeDetails.recipe_data.ingredients]);
          }
        }}
      >
        <Text style={styles.editButtonText}>
          {isEditing ? "Done" : "Edit"}
        </Text>
      </TouchableOpacity>
      <View style={styles.controlsContainer}>
        <View style={styles.measurementContainer}>
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[
                styles.pillButton,
                !useMetric && styles.pillButtonActive,
                styles.pillLeft,
              ]}
              onPress={() => setUseMetric(false)}
            >
              <Text
                style={[
                  styles.pillButtonText,
                  !useMetric && styles.pillButtonTextActive,
                ]}
              >
                US
              </Text>
            </TouchableOpacity>
            <View style={styles.pillDivider} />
            <TouchableOpacity
              style={[
                styles.pillButton,
                useMetric && styles.pillButtonActive,
                styles.pillRight,
              ]}
              onPress={() => setUseMetric(true)}
            >
              <Text
                style={[
                  styles.pillButtonText,
                  useMetric && styles.pillButtonTextActive,
                ]}
              >
                Metric
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.scaleContainer}>
          <Text style={[styles.scaleLabel, darkMode && styles.darkText]}>
            Serving Size:
          </Text>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                darkMode && styles.darkDropdownButton,
              ]}
              onPress={() => setShowScaleOptions(!showScaleOptions)}
            >
              <Text
                style={[styles.dropdownButtonText, darkMode && styles.darkText]}
              >
                {recipeScale}x
              </Text>
            </TouchableOpacity>
            {showScaleOptions && (
              <View
                style={[
                  styles.dropdownMenu,
                  darkMode && styles.darkDropdownMenu,
                ]}
              >
                {[0.5, 1, 1.5, 2].map((scale) => (
                  <TouchableOpacity
                    key={scale}
                    style={[
                      styles.dropdownItem,
                      recipeScale === scale && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setRecipeScale(scale);
                      setShowScaleOptions(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        darkMode && styles.darkText,
                        recipeScale === scale && styles.dropdownItemTextActive,
                      ]}
                    >
                      {scale}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecipeControls;
