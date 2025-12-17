import React, { useContext } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import CookingTips from "../components/CookingTips";
import { DarkModeContext } from "../contexts/DarkModeContext";

const LoadingScreen = ({
  message = "Generating your recipe...",
  subMessage = "Hang tight while we gather ingredients and instructions.",
}) => {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <SafeAreaView
      style={[styles.safeContainer, darkMode && styles.darkContainer]}
    >
      <View style={styles.topContainer}>
        <ActivityIndicator
          size="large"
          color={darkMode ? "#FFB65C" : "#E4571E"}
        />
        <Text style={[styles.loadingMessage, darkMode && styles.darkText]}>
          {message}
        </Text>
        <Text style={[styles.subMessage, darkMode && styles.darkText]}>
          {subMessage}
        </Text>
      </View>
      <View style={styles.middleContainer}>
        <CookingTips />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFF7EF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  darkContainer: {
    backgroundColor: "#140B0B",
  },
  topContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  middleContainer: {
    flex: 3,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMessage: {
    marginTop: 10,
    fontSize: 18,
    color: "#E4571E",
    textAlign: "center",
    fontWeight: "700",
  },
  subMessage: {
    fontSize: 14,
    color: "#5C4335",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
  darkText: {
    color: "#FFE9DC",
  },
});

export default LoadingScreen;
