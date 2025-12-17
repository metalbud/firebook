import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  assistantMessage: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  ingredient: {
    fontSize: 16,
    marginVertical: 5,
    paddingLeft: 10,
  },
  instructionStep: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 16,
    color: "#555",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  footerContainer: {
    marginTop: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});

export default styles;
