import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  pickerToggle: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f8f8f8",
  },
  picker: {
    width: 150,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 5,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: "contain",
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: "#555",
  },
  removeButton: {
    marginLeft: 10,
    alignSelf: "center",
  },
  removeButtonText: {
    fontSize: 18,
    color: "#ff4d4d",
  },
  noRecipesText: {
    marginTop: 20,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

module.export = styles;
