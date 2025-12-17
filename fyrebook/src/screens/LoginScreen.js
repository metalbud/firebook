import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { FYREBOOK_BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store"; // Secure Storage
import AsyncStorage from "@react-native-async-storage/async-storage"; // Async Storage
import styles from "../styles/SharedStyles"; // Import shared styles

function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState("");
  const passwordRef = useRef(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // New state

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const loginData = { identifier, password, rememberMe };

      const response = await fetch(`https://${FYREBOOK_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Login failed");
      }

      const data = await response.json();
      const { token } = data;

      // Store token securely based on "Remember Me" selection
      if (rememberMe) {
        await AsyncStorage.setItem("@jwtToken", token); // Persistent storage
      } else {
        await SecureStore.setItemAsync("jwtToken", token); // Secure session storage
      }

      setLoginSuccess(true);
      setTimeout(() => navigation.navigate("Home"), 1000); // Navigate after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.inputGroup}>
          <Text>Email or Username:</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            placeholder="Enter your email or username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
            autoComplete="username"
            importantForAutofill="yes"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Password:</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            autoComplete="password"
            importantForAutofill="yes"
          />
        </View>

        {/* Remember Me Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <Text style={{ fontSize: 24, marginRight: 8 }}>
            {rememberMe ? "☑" : "☐"}
          </Text>
          <Text style={styles.checkboxLabel}>Keep Me Logged In</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loginSuccess ? (
          <Text style={styles.success}>✅ Login Successful!</Text>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#29A887" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        )}

        {/* Signup Navigation Link */}
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupLink}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default LoginScreen;
