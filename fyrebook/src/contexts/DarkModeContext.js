import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkModePreference = async () => {
      try {
        const storedDarkMode = await AsyncStorage.getItem("@dark_mode");
        if (storedDarkMode !== null) {
          setDarkMode(JSON.parse(storedDarkMode));
        }
      } catch (error) {
        console.error("Error loading dark mode preference:", error);
      }
    };

    loadDarkModePreference();
  }, []);

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      await AsyncStorage.setItem("@dark_mode", JSON.stringify(newDarkMode)); // ✅ Save setting
    } catch (error) {
      console.error("Error toggling dark mode:", error);
    }
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children} {/* ✅ Ensure children are correctly passed */}
    </DarkModeContext.Provider>
  );
};
