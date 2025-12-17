import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { FYREBOOK_BASE_URL } from "@env"; // Ensure this is set up correctly in your `.env` file

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

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
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Sign Up
      </Text>

      <Text>Username:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Text>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Text>Password:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Text>Confirm Password:</Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleSignup}
        style={{
          backgroundColor: "#29A887",
          padding: 15,
          alignItems: "center",
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;
