import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal } from "react-native";
import optionsMenuStyles from "../styles/OptionsMenuStyles";
import { useNavigation } from "@react-navigation/native";

const OptionsMenu = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const navigateTo = (screen) => {
    setModalVisible(false);
    navigation.navigate(screen);
  };

  return (
    <View style={optionsMenuStyles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={optionsMenuStyles.homeIcon}>🏡</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={optionsMenuStyles.menuButton}
      >
        <Text style={optionsMenuStyles.menuIcon}>⋮</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={optionsMenuStyles.overlay}>
          <View style={optionsMenuStyles.modalCard}>
            <TouchableOpacity
              style={optionsMenuStyles.modalOption}
              onPress={() => navigateTo("ProfileScreen")}
            >
              <Text style={optionsMenuStyles.modalOptionText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={optionsMenuStyles.modalOption}
              onPress={() => navigateTo("Login")}
            >
              <Text style={optionsMenuStyles.modalOptionText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={optionsMenuStyles.modalOption}
              onPress={() => navigateTo("SavedRecipes")}
            >
              <Text style={optionsMenuStyles.modalOptionText}>
                Saved Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={optionsMenuStyles.modalOption}
              onPress={() => navigateTo("HistoryList")}
            >
              <Text style={optionsMenuStyles.modalOptionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                optionsMenuStyles.modalOption,
                optionsMenuStyles.closeButton,
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={optionsMenuStyles.modalOptionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OptionsMenu;
