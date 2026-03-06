// React Components Integration Guide

## 1. Install Compliance Components
Add these components to your main app structure:

```jsx
// Add to your main layout or app component
import PrivacyConsent from '../components/PrivacyConsent';
import { ContentSafetyValidator, RecipeSafetyBadge, AIContentMarker } from '../components/ContentSafetyValidator';
import AITransparencyReport from '../components/AITransparencyReport';
import { complianceManager } from '../lib/compliance';

// In your main component:
function App() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Initialize compliance
  useEffect(() => {
    const settings = complianceManager.getPrivacySettings();
    if (!settings.dataCollection) {
      setShowPrivacy(true);
    }
  }, []);

  return (
    <>
      <PrivacyConsent onClose={() => setShowPrivacy(false)} />
      {/* Your existing app components */}
    </>
  );
}
```

## 2. Integrate Content Safety in Recipe Components
Update your recipe generation components:

```jsx
// RecipeDisplay component
function RecipeDisplay({ recipe }) {
  return (
    <ContentSafetyValidator content={recipe.content} type="recipe">
      <RecipeSafetyBadge isSafe={recipe.isSafe} issues={recipe.issues} />
      <AIContentMarker isAI={recipe.isAI} model={recipe.model} />
      <div className="recipe-content">
        {recipe.content}
      </div>
    </ContentSafetyValidator>
  );
}
```

## 3. Add Privacy Controls to User Settings
```jsx
// Settings component
function Settings() {
  const [showTransparency, setShowTransparency] = useState(false);
  
  return (
    <div className="settings">
      <h2>Privacy & AI Settings</h2>
      
      <div className="privacy-controls">
        <label>
          <input type="checkbox" />
          Enable AI features
        </label>
        
        <label>
          <input type="checkbox" />
          Allow personalization
        </label>
        
        <label>
          <input type="checkbox" />
          Earn credits via ads
        </label>
        
        <button onClick={() => setShowTransparency(true)}>
          View AI Transparency Report
        </button>
        
        <button onClick={() => complianceManager.exportUserData()}>
          Export My Data
        </button>
      </div>
      
      {showTransparency && (
        <div className="transparency-modal">
          <AITransparencyReport />
        </div>
      )}
    </div>
  );
}
```

## 4. Update Backend API Endpoints
Add privacy-related endpoints to your backend:

```javascript
// Add to your server.js or routes
app.get('/api/privacy/transparency', (req, res) => {
  const report = transparencyManager.getTransparencyReport();
  res.json(report);
});

app.post('/api/privacy/export', authenticateToken, async (req, res) => {
  try {
    const data = await complianceManager.exportUserData(req.user.user_id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

app.post('/api/privacy/delete', authenticateToken, async (req, res) => {
  try {
    await complianceManager.deleteUserData(req.user.user_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});
```

## 5. Add CSS for Compliance Components
Add these styles to your CSS file:

```css
/* Privacy Dialog Styles */
.consent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.consent-dialog {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.consent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.consent-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Content Safety Styles */
.content-with-warnings {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.warning-banner {
  background: #fff3cd;
  border-bottom: 1px solid #ffeaa7;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.warning-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

/* AI Transparency Styles */
.ai-transparency-report {
  max-width: 800px;
  margin: 0 auto;
}

.model-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Safety Badge Styles */
.safety-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.safety-badge.safe {
  background: #d4edda;
  color: #155724;
}

.safety-badge.warning {
  background: #fff3cd;
  color: #856404;
}

/* AI Content Marker Styles */
.ai-content-marker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.75rem;
}
```