import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigation = useNavigation();

  const [darkMode, setDarkMode] = useState(user?.dark_mode || false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'No', onPress: () => {} },
        { text: 'Yes', onPress: () => logout() },
      ],
      [
        { text: 'Cancel', onPress: () => {} },
      ],
    ],
    { cancelable: true }
    );
  };

  const handleToggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);

    try {
      await fetch('http://localhost:3000/api/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await localStorage.getItem('firebook_token')}`,
        },
        body: JSON.stringify({ dark_mode: newValue ? 1 : 0 }),
      });

      Alert.alert('Success', 'Dark mode updated!');
    } catch (err) {
      console.error('Error updating dark mode:', err);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'No', onPress: () => {} },
        { text: 'Yes', onPress: () => {
          // Delete account functionality would need implementation
          Alert.alert('Info', 'Account deletion requires backend implementation.');
        }},
        { text: 'Cancel', onPress: () => {} },
      ],
      [
        { text: 'Cancel', onPress: () => {} },
      ],
      { cancelable: true }
    ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Firebook',
      'Firebook Social Media MVP\n\nVersion: 1.0.0\n\n\n© 2026 Firebook. All rights reserved.',
      [
        { text: 'OK', onPress: () => {} },
      ],
      { cancelable: true }
    ]
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌙 Appearance</Text>
          </View>

          <View style={styles.sectionContent}>
            <Text style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </Text>
            <Switch
              value={darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#7675ea', true: '#ff6b35' }}
            />
          </View>

          <View style={[styles.settingItem, styles.settingItemBorder]}>
            <Text style={styles.settingLabel}>App Icon Color</Text>
            <Text style={[styles.settingValue, styles.settingValueText]}>
              {darkMode ? '🔴' : '☀️'}
            </Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </Text>
            <Switch
              value={true}
              trackColor={{ false: '#7675ea', true: '#ff6b35' }}
              disabled
            />
            <Text style={styles.settingNote}>
              Coming soon...
            </Text>
          </View>

            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </Text>
            <Switch
              value={true}
              trackColor={{ false: '#7675ea', true: '#ff6b35' }}
              disabled
            />
            <Text style={[styles.settingValue, styles.settingValueText]}>
              Enabled
            </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>In-App Notifications</Text>
            </Text>
            <Switch
              value={true}
              trackColor={{ false: '#7675ea', true: '#ff6b35' }}
            />
            <Text style={[styles.settingValue, styles.settingValueText]}>
              Enabled
            </Text>
          </View>
        </View>
      </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Account</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.accountActions}>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => handleDeleteAccount}
              >
                <Text style={styles.dangerButtonText}>Delete Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleAbout()}
              >
                <Text style={styles.secondaryButtonText}>About</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <Text style={styles.settingLabel}>Username</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {user?.username || 'Not set'}
              </Text>
            </View>

            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {user?.email || 'Not set'}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Provider</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {user?.provider || 'email'}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Joined</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {new Date(user?.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <Text style={styles.settingLabel}>Level</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {user?.level || 1}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Flames</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {user?.flames || 0}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Badges</Text>
              <Text style={[styles.settingValue, styles.settingValueText]}>
                {user?.badges ? JSON.parse(user.badges).length : 0} badges
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#333',
  },
  backButtonText: {
    fontSize: 20,
    color: '#666',
    paddingRight: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600,
    marginBottom: 12,
    color: '#333',
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  settingValue: {
    flex: 1,
    textAlign: 'right',
  },
  settingValueText: {
    color: '#666',
    fontSize: 14,
  },
  settingItemBorder: {
    flex: 1,
  },
  accountActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
  },
  logoutButton: {
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#fee',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
  },
  logoutSection: {
    marginTop: 32,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});
