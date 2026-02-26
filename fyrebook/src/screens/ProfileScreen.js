import React, { useContext, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { DarkModeContext } from "../contexts/DarkModeContext"; // ✅ Global Dark Mode Context
import { UserContext } from "../contexts/userContext"; // ✅ Import Global User Context
import { useFocusEffect } from "@react-navigation/native"; // ✅ Detects when screen is focused
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Header from "../components/Header";
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { user, setUser } = useContext(UserContext); // ✅ Now updates UserContext in real-time
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);
  const [socialStats, setSocialStats] = useState(null);

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

  // ✅ Function to fetch social stats
  const fetchSocialStats = async () => {
    try {
      console.log("🔄 Fetching social stats...");

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
        `https://${process.env.FYREBOOK_BASE_URL}/api/me/social-stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("❌ Failed to fetch social stats:", response.status);
        return;
      }

      const statsData = await response.json();
      console.log("✅ Social stats:", statsData);

      setSocialStats(statsData);
    } catch (error) {
      console.error("❌ Error fetching social stats:", error);
    }
  };

  // ✅ Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchSocialStats();
    }, [])
  );

  // ✅ Pull-to-refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchSocialStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@jwtToken');
              await SecureStore.deleteItemAsync('jwtToken');
              navigation.replace('Login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
          style: 'destructive'
        },
      ]
    );
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
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={[styles.username, darkMode ? styles.darkText : null]}>
            {user ? user.username : "Guest"}
          </Text>
          {user?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
          <Text style={[styles.level, darkMode ? styles.darkText : null]}>
            Level {user?.level || 1} 🚀
          </Text>
          {user?.bio && (
            <Text style={[styles.bio, darkMode ? styles.darkText : null]}>
              {user.bio}
            </Text>
          )}
        </View>

        {/* Social Stats */}
        <View style={[styles.statsContainer, darkMode ? styles.darkBox : null]}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Followers', { userId: user?.id })}
          >
            <Text style={[styles.statValue, darkMode ? styles.darkText : null]}>
              {socialStats?.followers_count || user?.followers_count || 0}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.darkText : null]}>Followers</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Following', { userId: user?.id })}
          >
            <Text style={[styles.statValue, darkMode ? styles.darkText : null]}>
              {socialStats?.following_count || user?.following_count || 0}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.darkText : null]}>Following</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('ProfileTab')} // Show user's posts
          >
            <Text style={[styles.statValue, darkMode ? styles.darkText : null]}>
              {socialStats?.posts_count || user?.posts_count || 0}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.darkText : null]}>Posts</Text>
          </TouchableOpacity>
        </View>

        {/* Gamification Stats */}
        <View style={[styles.gamificationContainer, darkMode ? styles.darkBox : null]}>
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

        {/* Badges */}
        <View style={[styles.badgesContainer, darkMode ? styles.darkBox : null]}>
          <Text style={[styles.sectionTitle, darkMode ? styles.darkText : null]}>
            🏆 Badges Earned:
          </Text>
          {user?.badges && user.badges.length > 0 ? (
            <View style={styles.badgesList}>
              {user.badges.map((badge, index) => (
                <View key={index} style={[styles.badgeItem, darkMode ? styles.darkBadge : null]}>
                  <Text style={[styles.badge, darkMode ? styles.darkText : null]}>
                    {badge}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.badge, darkMode ? styles.darkText : null]}>
              No badges yet! Earn some by completing tasks!
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.actionsContainer, darkMode ? styles.darkBox : null]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.settingsButton]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.switchContainer, darkMode ? styles.darkBox : null]}>
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
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ff6b35",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  verifiedBadge: {
    backgroundColor: "#3b82f6",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  level: {
    fontSize: 18,
    color: "#555",
    marginTop: 5,
  },
  bio: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b35",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  gamificationContainer: {
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
  badgesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeItem: {
    backgroundColor: "#fff9c4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0e68c",
  },
  darkBadge: {
    backgroundColor: "#4a4a00",
    borderColor: "#6a6a00",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  badge: {
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  settingsButton: {
    backgroundColor: "#6b7280",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
