import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkModeContext } from "../contexts/DarkModeContext";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../contexts/userContext";

const Header = () => {
  const { darkMode } = useContext(DarkModeContext);
  const { user, logout, fetchUserData } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileInitials, setProfileInitials] = useState("??");
  const [profileColor, setProfileColor] = useState("#ccc");
  const slideAnim = useRef(new Animated.Value(300)).current;
  const navigation = useNavigation();

  const showMenu = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const hideMenu = () => {
    Animated.spring(slideAnim, {
      toValue: 300,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => setModalVisible(false));
  };

  const generateProfileInitials = useCallback((username) => {
    if (username) {
      const initials = username.substring(0, 2).toUpperCase();
      setProfileInitials(initials);
      setProfileColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    }
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setIsLoggedIn(true);
        generateProfileInitials(userData.username);
      } else {
        setIsLoggedIn(false);
      }
    };
    loadUserData();
  }, [generateProfileInitials]);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      generateProfileInitials(user.username);
    } else {
      setIsLoggedIn(false);
    }
  }, [user, generateProfileInitials]);

  const handleLogout = async () => {
    try {
      hideMenu();
      await Promise.all([
        SecureStore.deleteItemAsync("jwtToken"),
        AsyncStorage.removeItem("@jwtToken"),
        AsyncStorage.removeItem("@user_data"),
      ]);
      setIsLoggedIn(false);
      setProfileInitials("??");
      setProfileColor("#ccc");
      if (logout) {
        logout();
      }
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.error("Logout error:", error);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  const modalContainerStyle = {
    ...styles.modalContainer,
    backgroundColor: darkMode ? "#140B0B" : "#FFF7EF",
    borderLeftColor: darkMode
      ? "rgba(255, 146, 72, 0.35)"
      : "rgba(255, 107, 44, 0.22)",
  };

  const modalUsernameStyle = {
    ...styles.modalUsernameText,
    color: darkMode ? "#FFE9DC" : "#2C140C",
  };

  const userSectionStyle = {
    ...styles.userSection,
    borderBottomColor: darkMode ? "#2E1A14" : "#F0E1D7",
  };

  const modalButtonStyle = {
    ...styles.modalButton,
    backgroundColor: darkMode
      ? "rgba(255, 107, 44, 0.15)"
      : "rgba(255, 107, 44, 0.1)",
    borderColor: darkMode ? "rgba(255, 146, 72, 0.4)" : "#FF9B58",
  };

  const modalButtonTextStyle = {
    ...styles.modalButtonText,
    color: darkMode ? "#FFD7A3" : "#8A2B06",
    textShadowColor: "rgba(0, 0, 0, 0.18)",
  };

  const dangerButtonStyle = {
    backgroundColor: darkMode ? "rgba(255, 85, 68, 0.2)" : "#ffe5de",
    borderColor: darkMode ? "#FF8B70" : "#E85C50",
  };

  return (
    <LinearGradient
      colors={
        darkMode
          ? ["#140B0B", "#1E0E0C", "#2C120F"]
          : ["#FFB65C", "#FF8244", "#E44716"]
      }
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.headerContainer}>
        <View style={styles.brandRow}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <View style={styles.logoPlaceholder}>
              <View style={styles.logoGlow} />
              <Text style={styles.logoText}>FBR</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text
              style={[
                styles.brandTitle,
                !darkMode && styles.brandTitleLight,
              ]}
            >
              Firebook
            </Text>
            <Text
              style={[
                styles.brandSubtitle,
                !darkMode && styles.brandSubtitleLight,
              ]}
            >
              Cook bold, stay classy
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsLabel}>Flames</Text>
            <Text style={styles.statsValue}>{user?.flames || 0}</Text>
          </View>
          <TouchableOpacity onPress={showMenu} style={styles.menuButton}>
            <View style={styles.menuLines}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-out Menu */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideMenu}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              modalContainerStyle,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={userSectionStyle}>
              <View
                style={[styles.profileIcon, { backgroundColor: profileColor }]}
              >
                <Text style={styles.profileText}>{profileInitials}</Text>
              </View>
              <Text style={modalUsernameStyle}>
                {user?.username || "Guest"}
              </Text>
            </View>
            <TouchableOpacity
              style={modalButtonStyle}
              onPress={() => {
                hideMenu();
                navigation.navigate("Home");
              }}
            >
              <Text style={modalButtonTextStyle}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalButtonStyle}
              onPress={() => {
                hideMenu();
                navigation.navigate("LoadingScreen");
              }}
            >
              <Text style={modalButtonTextStyle}>
                Loading Screen -Test Only-
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalButtonStyle}
              onPress={() => {
                hideMenu();
                navigation.navigate("ProfileScreen");
              }}
            >
              <Text style={modalButtonTextStyle}>Profile</Text>
            </TouchableOpacity>
            {isLoggedIn ? (
              <TouchableOpacity
                style={[styles.modalButton, dangerButtonStyle]}
                onPress={handleLogout}
              >
                <Text style={modalButtonTextStyle}>Logout</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={modalButtonStyle}
                onPress={() => {
                  hideMenu();
                  navigation.navigate("Login");
                }}
              >
                <Text style={modalButtonTextStyle}>Login</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={modalButtonStyle}
              onPress={() => {
                hideMenu();
                navigation.navigate("SavedRecipes");
              }}
            >
              <Text style={modalButtonTextStyle}>Saved Recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalButtonStyle}
              onPress={() => {
                hideMenu();
                navigation.navigate("HistoryList");
              }}
            >
              <Text style={modalButtonTextStyle}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, dangerButtonStyle]}
              onPress={hideMenu}
            >
              <Text style={modalButtonTextStyle}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: 40,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    overflow: "hidden",
  },
  logoGlow: {
    position: "absolute",
    width: "120%",
    height: "120%",
    backgroundColor: "rgba(255, 107, 44, 0.25)",
    opacity: 0.85,
    transform: [{ rotate: "12deg" }],
  },
  logoText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#fff",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  brandTitleLight: {
    color: "#1B0F0B",
    textShadowColor: "rgba(255, 255, 255, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  brandSubtitleLight: {
    color: "#2C140C",
    textShadowColor: "rgba(255, 255, 255, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    minWidth: 96,
  },
  statsLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  menuButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuLines: {
    gap: 3,
  },
  menuLine: {
    width: 22,
    height: 2.5,
    backgroundColor: "#fff",
    borderRadius: 10,
    opacity: 0.9,
  },
  modalBackground: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    marginLeft: "auto",
    height: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    borderLeftWidth: 1,
  },
  userSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modalUsernameText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  modalButton: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default Header;
