import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Badge, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/socialService';

export default function NotificationBell({ style }) {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await api.getNotifications({
        page: 1,
        limit: 50,
        filter: 'unread',
      });
      const count = response.notifications?.length || 0;
      setUnreadCount(count);

      // Animate if there are new notifications
      if (count > 0) {
        animateBell();
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateBell = useCallback(() => {
    // Shake animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const handlePress = () => {
    navigation.navigate('NotificationsTab');
  };

  const getIconName = () => {
    if (unreadCount > 0) {
      return 'notifications';
    }
    return 'notifications-outline';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={getIconName()}
          size={24}
          color={unreadCount > 0 ? '#ff6b35' : '#666'}
        />
      </Animated.View>

      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff6b35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 12,
  },
});
