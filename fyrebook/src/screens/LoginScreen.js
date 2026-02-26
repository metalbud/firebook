import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
} from "react-native";
import { FYREBOOK_BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store"; // Secure Storage
import AsyncStorage from "@react-native-async-storage/async-storage"; // Async Storage
import styles from "../styles/SharedStyles"; // Import shared styles
import { Ionicons } from '@expo/vector-icons';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from "../services/authService";

function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState("");
  const passwordRef = useRef(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // New state
  const [oauthLoading, setOAuthLoading] = useState({
    google: false,
    facebook: false,
    apple: false,
  });

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

  const handleGoogleLogin = async () => {
    setOAuthLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await signInWithGoogle();
      console.log('Google login successful:', result);
      setLoginSuccess(true);
      setTimeout(() => navigation.navigate("Home"), 1000);
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Google Login Failed', error.message || 'An error occurred during Google login');
    } finally {
      setOAuthLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleFacebookLogin = async () => {
    setOAuthLoading(prev => ({ ...prev, facebook: true }));
    try {
      const result = await signInWithFacebook();
      console.log('Facebook login successful:', result);
      setLoginSuccess(true);
      setTimeout(() => navigation.navigate("Home"), 1000);
    } catch (error) {
      console.error('Facebook login error:', error);
      Alert.alert('Facebook Login Failed', error.message || 'An error occurred during Facebook login');
    } finally {
      setOAuthLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  const handleAppleLogin = async () => {
    setOAuthLoading(prev => ({ ...prev, apple: true }));
    try {
      const result = await signInWithApple();
      console.log('Apple login successful:', result);
      setLoginSuccess(true);
      setTimeout(() => navigation.navigate("Home"), 1000);
    } catch (error) {
      console.error('Apple login error:', error);
      Alert.alert('Apple Login Failed', error.message || 'An error occurred during Apple login');
    } finally {
      setOAuthLoading(prev => ({ ...prev, apple: false }));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        {/* OAuth Buttons */}
        <View style={oauthStyles.oauthContainer}>
          <TouchableOpacity
            style={[oauthStyles.oauthButton, oauthStyles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={oauthLoading.google}
          >
            {oauthLoading.google ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="logo-google" size={24} color="#fff" />
            )}
            <Text style={oauthStyles.oauthButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[oauthStyles.oauthButton, oauthStyles.facebookButton]}
            onPress={handleFacebookLogin}
            disabled={oauthLoading.facebook}
          >
            {oauthLoading.facebook ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="logo-facebook" size={24} color="#fff" />
            )}
            <Text style={oauthStyles.oauthButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[oauthStyles.oauthButton, oauthStyles.appleButton]}
            onPress={handleAppleLogin}
            disabled={oauthLoading.apple}
          >
            {oauthLoading.apple ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="logo-apple" size={24} color="#fff" />
            )}
            <Text style={oauthStyles.oauthButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={oauthStyles.dividerContainer}>
          <View style={oauthStyles.divider} />
          <Text style={oauthStyles.dividerText}>OR</Text>
          <View style={oauthStyles.divider} />
        </View>

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

const oauthStyles = StyleSheet.create({
  oauthContainer: {
    width: '100%',
    marginBottom: 24,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  oauthButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
});

export default LoginScreen;
