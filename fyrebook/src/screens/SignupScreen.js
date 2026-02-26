import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { FYREBOOK_BASE_URL } from "@env"; // Ensure this is set up correctly in your `.env` file
import { Ionicons } from '@expo/vector-icons';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from "../services/authService";

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState({
    google: false,
    facebook: false,
    apple: false,
  });

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${process.env.FYREBOOK_BASE_URL}/api/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const data = await response.json();
      const { token, user } = data;

      // Store token and user data if they exist
      if (token) {
        await AsyncStorage.setItem("jwtToken", token);
      }

      if (user) {
        await AsyncStorage.setItem("@user_data", JSON.stringify(user));
      } else {
        console.warn("No user data received from signup response");
      }

      // Navigate to Home screen
      navigation.replace("Home");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Signup Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setOAuthLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await signInWithGoogle();
      console.log('Google signup successful:', result);
      Toast.show({
        type: "success",
        text1: "Welcome to Firebook!",
        text2: "Your account has been created successfully.",
      });
      navigation.replace("Home");
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Google Signup Failed', error.message || 'An error occurred during Google signup');
    } finally {
      setOAuthLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleFacebookSignup = async () => {
    setOAuthLoading(prev => ({ ...prev, facebook: true }));
    try {
      const result = await signInWithFacebook();
      console.log('Facebook signup successful:', result);
      Toast.show({
        type: "success",
        text1: "Welcome to Firebook!",
        text2: "Your account has been created successfully.",
      });
      navigation.replace("Home");
    } catch (error) {
      console.error('Facebook signup error:', error);
      Alert.alert('Facebook Signup Failed', error.message || 'An error occurred during Facebook signup');
    } finally {
      setOAuthLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  const handleAppleSignup = async () => {
    setOAuthLoading(prev => ({ ...prev, apple: true }));
    try {
      const result = await signInWithApple();
      console.log('Apple signup successful:', result);
      Toast.show({
        type: "success",
        text1: "Welcome to Firebook!",
        text2: "Your account has been created successfully.",
      });
      navigation.replace("Home");
    } catch (error) {
      console.error('Apple signup error:', error);
      Alert.alert('Apple Signup Failed', error.message || 'An error occurred during Apple signup');
    } finally {
      setOAuthLoading(prev => ({ ...prev, apple: false }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* OAuth Buttons */}
      <View style={oauthStyles.oauthContainer}>
        <TouchableOpacity
          style={[oauthStyles.oauthButton, oauthStyles.googleButton]}
          onPress={handleGoogleSignup}
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
          onPress={handleFacebookSignup}
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
          onPress={handleAppleSignup}
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

      <Text style={styles.label}>Username:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        style={styles.input}
        autoCapitalize="none"
        autoComplete="username"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
        autoComplete="email"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
        style={styles.input}
        autoComplete="password-new"
      />

      <Text style={styles.label}>Confirm Password:</Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry
        style={styles.input}
        autoComplete="password-new"
      />

      <TouchableOpacity
        onPress={handleSignup}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      {/* Login Navigation Link */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
  },
  button: {
    backgroundColor: "#29A887",
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 20,
    color: "#29A887",
    fontSize: 14,
    fontWeight: "600",
  },
});

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

export default SignupScreen;
