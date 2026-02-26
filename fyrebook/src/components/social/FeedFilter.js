import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedFilter({ feedType, onFeedTypeChange }) {
  const filters = [
    { id: 'global', label: 'Global', icon: 'earth-outline' },
    { id: 'following', label: 'Following', icon: 'people-outline' },
    { id: 'trending', label: 'Trending', icon: 'trending-up-outline' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = feedType === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterButton, isActive && styles.activeFilter]}
            onPress={() => onFeedTypeChange(filter.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? filter.icon.replace('-outline', '') : filter.icon}
              size={20}
              color={isActive ? '#fff' : '#666'}
            />
            <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#fff',
  },
});
