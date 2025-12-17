import { StyleSheet } from "react-native";
import theme from "./theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.padding * 2,
    justifyContent: "center",
    backgroundColor: theme.backgroundLight,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.margin * 2,
    color: theme.textDark,
  },
  inputGroup: {
    marginBottom: theme.margin * 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: theme.padding,
    borderRadius: theme.borderRadius,
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: theme.margin,
    textAlign: "center",
  },
  success: {
    color: "green",
    marginBottom: theme.margin,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.primaryColor,
    padding: theme.padding * 1.2,
    borderRadius: theme.borderRadius,
    alignItems: "center",
    marginTop: theme.margin,
  },
  buttonText: {
    color: theme.textLight,
    fontSize: 18,
    fontWeight: "bold",
  },
  signupLink: {
    marginTop: theme.margin,
    color: theme.secondaryColor,
    textAlign: "center",
    fontSize: 16,
  },
});
