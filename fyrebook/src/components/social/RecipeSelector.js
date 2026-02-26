import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/socialService';

export default function RecipeSelector({ onSelect, selectedRecipeId }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('saved'); // saved, history, all
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRecipes(1, tab);
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchRecipes();
      } else {
        fetchRecipes(1, tab);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRecipes = async (pageNum = 1, currentTab = tab) => {
    setLoading(true);
    try {
      let response;
      if (currentTab === 'saved') {
        response = await api.getRecipes({ page: pageNum, limit: 20 });
        setRecipes(pageNum === 1 ? response.recipes || [] : [...recipes, ...(response.recipes || [])]);
      } else if (currentTab === 'history') {
        // This would need a new API endpoint
        response = await api.getRecipes({ page: pageNum, limit: 20 });
        setRecipes(pageNum === 1 ? response.recipes || [] : [...recipes, ...(response.recipes || [])]);
      } else {
        response = await api.getRecipes({ page: pageNum, limit: 20, search: searchQuery });
        setRecipes(pageNum === 1 ? response.recipes || [] : [...recipes, ...(response.recipes || [])]);
      }

      setPage(pageNum);
      setHasMore(response.recipes && response.recipes.length === 20);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await api.getRecipes({ page: 1, limit: 20, search: searchQuery });
      setRecipes(response.recipes || []);
      setHasMore(response.recipes && response.recipes.length === 20);
    } catch (error) {
      console.error('Error searching recipes:', error);
      Alert.alert('Error', 'Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchRecipes(page + 1);
    }
  };

  const handleSelectRecipe = (recipe) => {
    if (onSelect) {
      onSelect(recipe);
    }
  };

  const renderRecipe = ({ item }) => {
    const isSelected = selectedRecipeId === item.id;
    return (
      <TouchableOpacity
        style={[styles.recipeItem, isSelected && styles.selectedRecipeItem]}
        onPress={() => handleSelectRecipe(item)}
      >
        <View style={styles.recipeIcon}>
          <Text style={styles.recipeIconText}>🍽️</Text>
        </View>
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeTitle, isSelected && styles.selectedRecipeTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.category && (
            <Text style={styles.recipeCategory}>{item.category}</Text>
          )}
          {item.cooking_time && (
            <Text style={styles.recipeMeta}>
              <Ionicons name="time-outline" size={12} color="#999" /> {item.cooking_time} min
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#ff6b35" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabs}>
        {[
          { id: 'saved', label: 'Saved' },
          { id: 'history', label: 'History' },
          { id: 'all', label: 'All' },
        ].map((tabItem) => (
          <TouchableOpacity
            key={tabItem.id}
            style={[styles.tab, tab === tabItem.id && styles.activeTab]}
            onPress={() => setTab(tabItem.id)}
          >
            <Text style={[styles.tabText, tab === tabItem.id && styles.activeTabText]}>
              {tabItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recipe List */}
      {loading && recipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No recipes found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Save some recipes to see them here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipe}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() =>
            loading && recipes.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#ff6b35" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: '#ff6b35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#ff6b35',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectedRecipeItem: {
    backgroundColor: '#fff5ed',
    borderWidth: 2,
    borderColor: '#ff6b35',
  },
  recipeIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeIconText: {
    fontSize: 24,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedRecipeTitle: {
    color: '#ff6b35',
  },
  recipeCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  recipeMeta: {
    fontSize: 12,
    color: '#999',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
