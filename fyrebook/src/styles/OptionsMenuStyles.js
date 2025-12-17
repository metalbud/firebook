import { StyleSheet, Platform } from "react-native";
import theme from "./theme";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.padding,
  },
  homeIcon: {
    fontSize: 24,
    marginRight: theme.margin,
  },
  menuButton: {
    padding: theme.padding / 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: theme.backgroundLight,
    borderRadius: theme.borderRadius * 2,
    paddingVertical: theme.padding * 2,
    paddingHorizontal: theme.padding * 2.5,
    borderWidth: 2,
    borderColor: "#999",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  modalOption: {
    marginVertical: theme.margin / 2,
    backgroundColor: theme.secondaryColor,
    borderRadius: theme.borderRadius,
    paddingVertical: theme.padding,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionText: {
    fontSize: 18,
    color: theme.textLight,
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    borderBottomWidth: 0,
    marginTop: theme.margin,
    backgroundColor: theme.errorColor,
    borderRadius: theme.borderRadius,
  },
});
