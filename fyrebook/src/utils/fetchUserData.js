import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { checkTokenExpiration } from "./checkToken";

export const fetchUserData = async (navigation, setUser) => {
  try {
    console.log("🔄 Fetching latest user data...");

    // ✅ Retrieve token from AsyncStorage or SecureStore
    let token = await AsyncStorage.getItem("@jwtToken");
    if (!token) {
      token = await SecureStore.getItemAsync("jwtToken");
    }

    if (!token) {
      console.error("❌ No auth token found");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return null;
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

    checkTokenExpiration(response, navigation);

    const userData = await response.json();
    console.log("✅ Updated user data:", userData);

    if (setUser) {
      setUser(userData); // ✅ Now setUser is passed from the component
    }
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
  }
};
