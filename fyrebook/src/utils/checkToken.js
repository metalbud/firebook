import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

export const checkTokenExpiration = async (response, navigation) => {
  if (response.status === 401 || response.status === 403) {
    // ✅ Remove stored token immediately
    await SecureStore.deleteItemAsync("jwtToken");

    // ✅ Show toast notification
    Toast.show({
      type: "error",
      text1: "Session Expired",
      text2: "Please log in again.",
    });

    // ✅ Delay navigation slightly to allow toast to show
    setTimeout(() => {
      navigation.navigate("Login");
    }, 1500); // Adjust delay as needed (1.5s)
  }
};
