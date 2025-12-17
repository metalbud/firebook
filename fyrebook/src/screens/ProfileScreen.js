import React, { useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { DarkModeContext } from "../contexts/DarkModeContext"; // ✅ Global Dark Mode Context
import { UserContext } from "../contexts/userContext"; // ✅ Import Global User Context
import { useFocusEffect } from "@react-navigation/native"; // ✅ Detects when screen is focused
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Header from "../components/Header";

const ProfileScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { user, setUser } = useContext(UserContext); // ✅ Now updates UserContext in real-time
  const [refreshing, setRefreshing] = React.useState(false);

  // ✅ Function to fetch updated user data
  const fetchUserData = async () => {
    try {
      console.log("🔄 Fetching latest user data...");

      // ✅ Retrieve token from AsyncStorage or SecureStore
      let token = await AsyncStorage.getItem("@jwtToken");
      if (!token) {
        token = await SecureStore.getItemAsync("jwtToken");
      }

      if (!token) {
        console.error("❌ No auth token found");
        return;
      }

      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("❌ Failed to fetch user data:", response.status);
        return;
      }

      const userData = await response.json();
      console.log("✅ Updated user data:", userData);

      setUser(userData); // ✅ Update UserContext with new data
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    }
  };

  // ✅ Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  // ✅ Pull-to-refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#222" : "#fff" }}>
      <Header />
      <ScrollView
        style={[styles.container, darkMode ? styles.darkContainer : null]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.profileHeader, darkMode ? styles.darkBox : null]}>
          <Text style={[styles.username, darkMode ? styles.darkText : null]}>
            {user ? user.username : "Guest"}
          </Text>
          <Text style={[styles.level, darkMode ? styles.darkText : null]}>
            Level {user?.level || 1} 🚀
          </Text>
        </View>

        <View style={[styles.statsContainer, darkMode ? styles.darkBox : null]}>
          <Text style={[styles.statsText, darkMode ? styles.darkText : null]}>
            🔥 Flames: {user?.flames || 0}
          </Text>
          <Text style={[styles.statsText, darkMode ? styles.darkText : null]}>
            📚 Recipes Saved: {user?.totalRecipesSaved || 0}
          </Text>
          <Text style={[styles.statsText, darkMode ? styles.darkText : null]}>
            🔥 Streak: {user?.streakDays || 0} Days
          </Text>
        </View>

        <View
          style={[styles.badgesContainer, darkMode ? styles.darkBox : null]}
        >
          <Text
            style={[styles.sectionTitle, darkMode ? styles.darkText : null]}
          >
            🏆 Badges Earned:
          </Text>
          {user?.badges && user.badges.length > 0 ? (
            user.badges.map((badge, index) => (
              <Text
                key={index}
                style={[styles.badge, darkMode ? styles.darkText : null]}
              >
                {badge}
              </Text>
            ))
          ) : (
            <Text style={[styles.badge, darkMode ? styles.darkText : null]}>
              No badges yet! Earn some by completing tasks!
            </Text>
          )}
        </View>

        <View
          style={[styles.switchContainer, darkMode ? styles.darkBox : null]}
        >
          <Text style={[styles.switchText, darkMode ? styles.darkText : null]}>
            🌙 Dark Mode
          </Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  darkContainer: {
    backgroundColor: "#121212", // ✅ Improved dark mode background color
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  level: {
    fontSize: 18,
    color: "#555",
  },
  statsContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 20,
  },
  darkBox: {
    backgroundColor: "#1E1E1E",
  },
  statsText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  badgesContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  badge: {
    fontSize: 16,
    color: "#666",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  switchText: {
    fontSize: 16,
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
});

export default ProfileScreen;
