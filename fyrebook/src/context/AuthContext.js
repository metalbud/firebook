import React, { createContext, useState } from "react";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (provider) => {
    try {
      let result;
      switch (provider) {
        case "google":
          result = await signInWithGoogle();
          break;
        case "facebook":
          result = await signInWithFacebook();
          break;
        case "apple":
          result = await signInWithApple();
          break;
        default:
          throw new Error("Unsupported provider");
      }
      setUser(result);
      // Navigate to the main app screen
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
