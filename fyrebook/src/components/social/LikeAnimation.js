import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LikeAnimation({ visible, onComplete }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);

      // Animate scale from 0 to 1.5
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Animate opacity from 1 to 0
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) {
            onComplete();
          }
        });
      });
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name="heart" size={40} color="#ff6b35" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
});
