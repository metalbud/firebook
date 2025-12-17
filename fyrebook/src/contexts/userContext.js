import React, { createContext, useState, useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store"; // Secure Storage for token

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Poll for fresh user data every 20s while logged in
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchUserData(token);
    }, 20000);
    return () => clearInterval(interval);
  }, [token]);

  // Refresh when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && token) {
        fetchUserData(token);
      }
    });
    return () => subscription.remove();
  }, [token]);

  const fetchUserData = async (providedToken) => {
    try {
      const authToken =
        providedToken || token || (await SecureStore.getItemAsync("jwtToken"));
      if (!authToken) {
        console.warn("No auth token found while fetching user data.");
        return null;
      }

      setToken(authToken);
      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user data: ${errorText}`);
      }

      const userData = await response.json();
      setUser(userData);
      await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const checkLoginStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("jwtToken");
      if (storedToken) {
        setToken(storedToken);
        const storedUser = await AsyncStorage.getItem("@user_data");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          fetchUserData(storedToken);
        }
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("jwtToken");
    await AsyncStorage.removeItem("@user_data");
    setUser(null);
    setToken(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, fetchUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
};
