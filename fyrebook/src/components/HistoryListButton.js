import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HistoryListButton = () => {
  navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("HistoryList");
  };

  return (
    <View style={styles.container}>
      <Button title="🕒" onPress={handlePress} color="#29A887" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});

export default HistoryListButton;
