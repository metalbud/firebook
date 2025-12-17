import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

const GuidedInstructions = ({
  recipeTitle,
  iconStyle = {},
  iconClassName = "",
}) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const storedRecipes = await AsyncStorage.getItem("@saved_recipes");
        if (storedRecipes) {
          const recipes = JSON.parse(storedRecipes);
          const recipe = recipes.find((r) => r.title === recipeTitle);
          if (recipe) {
            const fetchedSteps = recipe.instructions.map(
              (instruction) =>
                `Step ${instruction.step}: ${instruction.description}`
            );
            setSteps(fetchedSteps);
          } else {
            console.warn("Recipe not found");
            setSteps(["Recipe not found."]);
          }
        } else {
          console.warn("No recipes saved");
          setSteps(["No recipes available."]);
        }
      } catch (error) {
        console.error("Error fetching recipes from AsyncStorage", error);
        setSteps(["Error loading recipe."]);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [recipeTitle]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setCurrentStep(0); // Reset to the first step
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowOverlay(true)}
        style={[styles.icon, iconStyle]}
      >
        <Text style={styles.iconText}>📘</Text>
      </TouchableOpacity>

      {showOverlay && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.title}>Guided Instructions</Text>
            <Text style={styles.stepText}>{steps[currentStep]}</Text>

            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity onPress={handleBack} style={styles.button}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              )}

              {currentStep < steps.length - 1 && (
                <TouchableOpacity onPress={handleNext} style={styles.button}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={closeOverlay}
              style={[styles.button, styles.closeButton]}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    cursor: "pointer",
  },
  iconText: {
    fontSize: 24,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    color: "black",
    marginBottom: 20,
    textAlign: "center",
  },
  stepText: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "red",
  },
});

export default GuidedInstructions;
