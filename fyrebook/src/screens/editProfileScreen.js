import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/socialService';

export default function EditProfileScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigation = useNavigation();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaTypes: ['photo'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: {
          type: 'high',
          allowsMultipleSelection: false,
        },
        options: {
          storageBase64: false,
        maxFiles: 1,
        includeBase64: true,
        selectionLimit: 1,
        mediaType: 'photo',
        includeExif: false,
      },
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        setAvatar(uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.updateProfile({
        username: username.trim(),
        bio: bio.trim(),
        avatar_url: avatar,
      });

      // Update user context
      setLoading(false);

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Text style={styles.label}>Avatar</Text>
            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.avatarUploadButton}
            >
              <View style={styles.avatarUploadContent}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>📷</Text>
                  </View>
                )}
              </View>
              <Text style={styles.avatarUploadText}>
                {avatar ? 'Change' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Username */}
          <View>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              autoCapitalize="none"
              editable={user?.provider === 'email'}
            />
          </View>

          {/* Email - read-only */}
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnly]}
              value={email}
              onChangeText={setEmail}
              placeholder="Your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={user?.provider === 'email'}
              placeholderTextColor="#999"
            />
          </View>

          {/* Bio */}
          <View>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.textInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself..."
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {bio.length}/500
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[styles.submitButton, (!username.trim() || loading) && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#666666" />
            <Text style={styles.loadingText}>Saving changes...</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontWeight: '700,
    color: '#333',
  },
  backButtonText: {
    fontSize: 20,
    color: '#666',
    paddingRight: 8,
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    padding: 16,
    borderRadius: 8,
    alignSelf: 'stretch',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignSelf: 'stretch',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  readOnly: {
    backgroundColor: '#f9fafb',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  avatarSection: {
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholder: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  avatarText: {
    color: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarUploadButton: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 6,
  },
  avatarUploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatarUploadText: {
    color: '#fff',
    fontSize: 14,
  },
  formContainer: {
    paddingBottom: 40,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
});
