import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailsScreen from "./src/screens/RecipeDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SavedRecipesScreen from "./src/screens/SavedRecipesScreen";
import HistoryListScreen from "./src/screens/HistoryListScreen";
import NutritionalInfoScreen from "./src/screens/NutritionalInfoScreen";
import SignupScreen from "./src/screens/SignupScreen";
import LoginScreen from "./src/screens/LoginScreen";
import FeedScreen from "./src/screens/FeedScreen";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import TrendingScreen from "./src/screens/TrendingScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import FollowersScreen from "./src/screens/FollowersScreen";
import FollowingScreen from "./src/screens/FollowingScreen";
import EditProfileScreen from "./src/screens/editProfileScreen";
import SettingsScreen from "./src/screens/settingsScreen";
import Toast from "react-native-toast-message";
import { DarkModeProvider } from "./src/contexts/DarkModeContext";
import { UserProvider } from "./src/contexts/userContext";
import { MenuProvider } from "react-native-popup-menu";
import LoadingScreen from "./src/screens/LoadingScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ff6b35',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="TrendingTab"
        component={TrendingScreen}
        options={{
          tabBarLabel: 'Trending',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CreatePostTab"
        component={CreatePostScreen}
        options={{
          tabBarLabel: 'Post',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

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
              {/* Auth Screens */}
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

              {/* Main App Tabs */}
              <Stack.Screen
                name="MainApp"
                component={MainTabs}
                options={{ title: "Firebook App" }}
              />

              {/* Social Screens */}
              <Stack.Screen
                name="PostDetail"
                component={PostDetailScreen}
                options={{ title: "Post Detail" }}
              />
              <Stack.Screen
                name="Followers"
                component={FollowersScreen}
                options={{ title: "Followers" }}
              />
              <Stack.Screen
                name="Following"
                component={FollowingScreen}
                options={{ title: "Following" }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: "Edit Profile" }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: "Settings" }}
              />

              {/* Recipe Screens */}
              <Stack.Screen
                name="RecipeDetails"
                component={RecipeDetailsScreen}
                options={{ title: "Recipe Details" }}
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

              {/* Test Screen */}
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
