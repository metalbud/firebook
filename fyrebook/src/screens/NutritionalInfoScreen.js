import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const NutritionalInfoScreen = ({ route }) => {
  const { nutritionalInfo } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Nutritional Information</Text>
      {nutritionalInfo ? (
        <>
          <Text style={styles.infoText}>
            Calories: {nutritionalInfo.calories_per_serving} kcal
          </Text>
          <Text style={styles.infoText}>
            Fat: {nutritionalInfo.fat_per_serving} g
          </Text>
          <Text style={styles.infoText}>
            Protein: {nutritionalInfo.protein_per_serving} g
          </Text>
          <Text style={styles.infoText}>
            Carbohydrates: {nutritionalInfo.carbs_per_serving} g
          </Text>
          <Text style={styles.infoText}>
            Fiber: {nutritionalInfo.fiber_per_serving} g
          </Text>
          <Text style={styles.infoText}>
            Sugars: {nutritionalInfo.sugar_per_serving} g
          </Text>
        </>
      ) : (
        <Text style={styles.emptyText}>
          No nutritional information available.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default NutritionalInfoScreen;
