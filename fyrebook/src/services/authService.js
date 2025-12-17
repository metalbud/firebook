import { authorize } from "react-native-app-auth";
import {
  googleConfig,
  facebookConfig,
  appleConfig,
} from "../config/authConfig";

export const signInWithGoogle = async () => {
  try {
    const result = await authorize(googleConfig);
    // Handle successful authentication
    return result;
  } catch (error) {
    console.error("Google authentication error:", error);
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await authorize(facebookConfig);
    // Handle successful authentication
    return result;
  } catch (error) {
    console.error("Facebook authentication error:", error);
    throw error;
  }
};

export const signInWithApple = async () => {
  try {
    const result = await authorize(appleConfig);
    // Handle successful authentication
    return result;
  } catch (error) {
    console.error("Apple authentication error:", error);
    throw error;
  }
};
