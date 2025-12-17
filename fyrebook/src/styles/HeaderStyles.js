import { StyleSheet } from "react-native";
import theme from "./theme";

const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.padding,
    backgroundColor: theme.primaryColor,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.margin,
  },
  profileText: {
    color: theme.textLight,
    fontWeight: "bold",
    fontSize: 18,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: theme.backgroundLight,
    padding: theme.padding * 2,
    borderTopLeftRadius: theme.borderRadius,
    borderTopRightRadius: theme.borderRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loggedInText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.textLight,
    marginRight: theme.margin,
  },
  loggedOutText: {
    fontSize: 16,
    color: theme.textLight,
    marginRight: theme.margin,
  },
  logoutButton: {
    padding: theme.padding,
    backgroundColor: theme.errorColor,
    borderRadius: theme.borderRadius,
  },
  logoutText: {
    color: theme.textLight,
    fontWeight: "bold",
  },
});

export default headerStyles;
