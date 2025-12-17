import React from "react";
import { View, Button, StyleSheet } from "react-native";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
} from "../services/authService";

const AuthScreen = () => {
  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={signInWithGoogle} />
      <Button title="Sign in with Facebook" onPress={signInWithFacebook} />
      <Button title="Sign in with Apple" onPress={signInWithApple} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});

export default AuthScreen;
