import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/RecipeDetailStyles";

const RecipeInstructions = ({ darkMode, instructions }) => {
  return (
    <>
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
        Instructions:
      </Text>
      {instructions.map((instruction, index) => (
        <View
          key={index}
          style={[styles.instructionStep, darkMode && styles.darkBox]}
        >
          <Text style={[styles.stepNumber, darkMode && styles.darkText]}>
            Step {index + 1}:
          </Text>
          <Text style={[styles.stepDescription, darkMode && styles.darkText]}>
            {instruction.description}
          </Text>
        </View>
      ))}
    </>
  );
};

export default RecipeInstructions;
