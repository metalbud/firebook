'use client';

import { useState } from 'react';

export default function RecipeSelector({ onSelect, selectedRecipeId }) {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'saved', 'history'

  useEffect(() => {
    // In production, this would fetch from API
    // For now, use mock data
    const mockSavedRecipes = [
      { id: 1, title: 'Grandma\'s Pasta Carbonara', category: 'Italian', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, title: 'Classic Beef Wellington', category: 'British', created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 3, title: 'Mediterranean Quinoa Salad', category: 'Healthy', created_at: new Date(Date.now() - 259200000).toISOString() },
    ];

    const mockHistory = [
      { id: 1, title: 'Spicy Thai Curry', created_at: new Date(Date.now() - 43200000).toISOString() },
      { id: 2, title: 'Homemade Pizza', created_at: new Date(Date.now() - 86400000).toISOString() },
    ];

    setSavedRecipes(mockSavedRecipes);
    setHistory(mockHistory);
  }, []);

  const filteredRecipes = () => {
    switch (filter) {
      case 'saved':
        return savedRecipes;
      case 'history':
        return history;
      case 'all':
      default:
        return [...savedRecipes, ...history];
    }
  };

  const displayedRecipes = filteredRecipes().filter(recipe => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  });

  const handleSelectRecipe = (recipe) => {
    if (onSelect) {
      onSelect(recipe);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            color: '#333',
          }}>
            Select Recipe
          </h2>
          <button
            onClick={() => onSelect(null)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#fee',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {['all', 'saved', 'history'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: filter === filterType ? '#ff6b35' : '#e0e0e0',
                color: filter === filterType ? '#ffffff' : '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Recipe List */}
        <div style={{
          overflowY: 'auto',
          flex: 1,
          marginBottom: '20px',
        }}>
          {displayedRecipes.length === 0 && !loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No recipes found</p>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#999' }}>
                {filter === 'all' && 'Try searching or create a new recipe first.'}
                {filter !== 'all' && 'Save some recipes to see them here.'}
              </p>
            </div>
          )}

          {displayedRecipes.length > 0 && (
            displayedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: 0,
                      color: '#333',
                    }}>
                      {recipe.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: '8px 0 0',
                    }}>
                      {recipe.category && <span style={{ fontWeight: '600', color: '#666' }}>• {recipe.category}</span>}
                      {new Date(recipe.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {selectedRecipeId === recipe.id ? (
                    <span style={{ fontSize: '20px' }}>✅</span>
                  ) : null}
                </div>
              </div>
            ))}
          )}
        </div>
      </div>
    </div>
  );
}
