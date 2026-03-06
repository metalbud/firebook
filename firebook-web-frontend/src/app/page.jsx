"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { apiCall, API_ENDPOINTS } from "../lib/api";
import RecipeCard from "../components/RecipeCard";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    setLoadingFeatured(true);
    try {
      const res = await apiCall(`${API_ENDPOINTS.RANDOM_RECIPES}?limit=6`);
      if (res.ok) {
        const data = await res.json();
        setFeatured(data.recipes || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch featured recipes:", err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleIgnite = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/generate?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="hero-card">
        <h1 className="hero-title">Ignite your menu 🔥</h1>
        <p className="hero-subtitle">
          Describe what you have and we&apos;ll generate the perfect recipe.
        </p>
        <form className="hero-search" onSubmit={handleIgnite}>
          <input
            className="hero-input"
            type="text"
            placeholder="Chicken, garlic, lemon…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-ignite" type="submit">
            Ignite 🔥
          </button>
        </form>
      </div>

      {/* Login CTA */}
      {!isAuthenticated && (
        <div className="login-cta">
          <p className="login-cta-text">
            Log in or sign up to save recipes, track your streak, and earn flames!
          </p>
          <div className="login-cta-actions">
            <Link href="/login" className="btn-primary" style={{ borderRadius: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', height: '40px', padding: '0 18px', fontSize: '14px' }}>
              Log in
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Sign up free
            </Link>
          </div>
        </div>
      )}

      {/* Featured Recipes */}
      <div style={{ marginTop: "32px" }}>
        <h2 className="section-heading">
          <span className="flame-accent">🔥</span> Featured Recipes
        </h2>

        {loadingFeatured ? (
          <>
            <div className="spinner" />
            <p className="loading-text">Loading recipes…</p>
          </>
        ) : featured.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <p className="empty-state-title">No recipes yet</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {featured.map((recipe, i) => (
              <RecipeCard key={recipe.id || i} recipe={recipe} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
