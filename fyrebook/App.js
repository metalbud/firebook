import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailsScreen from "./src/screens/RecipeDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SavedRecipesScreen from "./src/screens/SavedRecipesScreen";
import HistoryListScreen from "./src/screens/HistoryListScreen";
import NutritionalInfoScreen from "./src/screens/NutritionalInfoScreen";
import SignupScreen from "./src/screens/SignupScreen";
import LoginScreen from "./src/screens/LoginScreen";
import Toast from "react-native-toast-message";
import { DarkModeProvider } from "./src/contexts/DarkModeContext";
import { UserProvider } from "./src/contexts/userContext";
import { MenuProvider } from "react-native-popup-menu";
import LoadingScreen from "./src/screens/LoadingScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <DarkModeProvider>
        <MenuProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Firebook" }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: "Login Page" }}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{ title: "Signup Page" }}
              />
              <Stack.Screen
                name="RecipeDetails"
                component={RecipeDetailsScreen}
                options={{ title: "Recipe Details" }}
              />
              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ title: "Profile Page" }}
              />
              <Stack.Screen
                name="SavedRecipes"
                component={SavedRecipesScreen}
                options={{ title: "Saved Recipes" }}
              />
              <Stack.Screen
                name="HistoryList"
                component={HistoryListScreen}
                options={{ title: "History List" }}
              />
              <Stack.Screen
                name="NutritionList"
                component={NutritionalInfoScreen}
                options={{ title: "Nutrition List" }}
              />
              <Stack.Screen
                name="LoadingScreen"
                component={LoadingScreen}
                options={{ title: "Loading Screen -Test Only-" }}
              />
            </Stack.Navigator>
            <Toast />
          </NavigationContainer>
        </MenuProvider>
      </DarkModeProvider>
    </UserProvider>
  );
}
