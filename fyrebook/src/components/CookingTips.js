// CookingTips.js

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CookingTips = () => {
  // A collection of handy cooking tips
  const tips = [
    "Always preheat your pans before cooking.",
    "Keep your knives sharp to make prep easier and safer.",
    "Taste as you go to adjust seasonings.",
    "Clean as you go to keep your kitchen tidy.",
    "Rest meat after cooking for better flavor and juiciness.",
    "Use a thermometer for perfectly cooked meats.",
    "Let quality ingredients speak for themselves.",
    "Use fresh herbs to brighten any dish.",
    "Balance acidity and sweetness in sauces.",
    "Marinate proteins to enhance flavor and tenderness.",
    "Season your food gradually and taste often.",
    "Pre-measure spices to streamline your cooking process.",
    "Always have a sharp knife for safety and efficiency.",
    "Use a cast iron skillet for even heat distribution.",
    "Let meat rest before slicing to retain juices.",
    "Deglaze your pan to add depth to your sauces.",
    "Keep your workspace organized for smoother cooking.",
    "Experiment with international spices to discover new flavors.",
    "Invest in good-quality cookware that heats evenly.",
    "Keep a small notebook of your favorite recipes and hacks.",
  ];

  // Function to fetch a random tip
  const getRandomTip = () => tips[Math.floor(Math.random() * tips.length)];

  // State to store the current tip
  const [tip, setTip] = useState(getRandomTip());

  // Handler to update the tip when the button is pressed

  useEffect(() => {
    const interval = setInterval(() => {
      setTip(getRandomTip());
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={["transparent", "#8B0000", "#FF4500", "#FFD700"]} // Fire-themed gradient
      locations={[0, 0.7, 0.85, 1]} // Adjusted locations
      style={styles.container}
    >
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.tipContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  safeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  tipContainer: {
    paddingHorizontal: 20,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    width: "100%",
  },
  tipText: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    width: "100%",
    flexShrink: 1,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  textContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
});

export default CookingTips;
