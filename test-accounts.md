# Firebook Test Accounts

## Production Server
- **URL**: https://firebook.app
- **Backend API**: https://firebook.app/api (port 3000)
- **Frontend**: https://firebook.app (port 4000 via PM2)

## Test Accounts

### Test User 1 (Recommended for testing)
- **Username**: `simpletest`
- **Email**: `simpletest@firebook.app`
- **Password**: `testpass123`
- **ID**: 6
- **Created**: 2026-03-06
- **Status**: ✅ Verified working

### Test User 2
- **Username**: `testuser`
- **Email**: `testuser@firebook.app`
- **Password**: `Test1234!`
- **ID**: 5
- **Created**: 2026-03-06
- **Note**: May have password hash issues

### Test User 3 (Chef)
- **Username**: `testchef`
- **Email**: `test@firebook.app`
- **Password**: *Unknown (hashed in database)*
- **ID**: 4

### Main Account
- **Username**: `metalbud`
- **Email**: `kpcantu@gmail.com`
- **Password**: *Unknown (contact owner)*
- **ID**: 1

## PM2 Processes

```bash
pm2 list
```

Current processes:
- `firebook-website` (id: 0) - Next.js frontend on port 4000
- `firebook-api` (id: 1) - Backend API on port 3000

## Database Access

```bash
# MySQL connection
mysql -u metalbud -p'blunts1111' fyrebook

# Query users
SELECT id, username, email FROM users LIMIT 10;

# Get specific user details
SELECT * FROM users WHERE username='testuser';
```

## API Endpoints

**Note**: Routes are at the root path, NOT under `/api/`. Apache proxies certain routes to backend on port 3000.

### Authentication
- **POST** `/signup` - Create new account
- **POST** `/login` - Login and get JWT token (uses `identifier` field, not `username`)
- **POST** `/logout` - Logout (client-side token deletion)
- **GET** `/me` - Get current user info (requires JWT)

### Recipes
- **POST** `/api/generate-recipe` - Generate AI recipe
- **POST** `/api/get-saved-recipe` - Get recipe by title
- **POST** `/api/fetch-recipe-details` - Fetch recipe details by title
- **POST** `/api/save-recipe` - Save recipe to user's collection
- **GET** `/api/random-recipes` - Get random recipes

### Social Features
- **GET** `/posts` - Get posts (feed)
- **POST** `/posts` - Create a post
- **GET** `/notifications` - Get user notifications
- **POST** `/likes` - Like/unlike a post
- **POST** `/comments` - Comment on a post
- **POST** `/follows` - Follow/unfollow a user
- **GET** `/users` - Get user profile

## Testing Login

```bash
# Test login via curl (simpletest - recommended)
curl -X POST https://firebook.app/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "simpletest", "password": "testpass123"}'

# Expected response
{
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h"
}

# Use the token for authenticated requests
curl https://firebook.app/me \
  -H "Authorization: Bearer <token_here>"
```

## Quick Recipe Feature

The generate page now has two modes:

1. **Quick Recipe Mode** (default)
   - User types recipe name (e.g., "Beef stroganoff")
   - App checks database for match
   - If not found, generates new recipe using AI

2. **Advanced Ingredients Mode**
   - User selects ingredients from a list
   - Generates recipes based on selected ingredients

## Known Issues Fixed

- ✅ Removed `output: 'standalone'` from next.config.mjs
- ✅ Fixed UserContext to return default values during build prerender
- ✅ Backend API server now running on port 3000
- ✅ Frontend Next.js server running on port 4000
- ✅ Both processes managed by PM2
- ✅ Apache proxy configured for auth routes (`/login`, `/signup`, `/me`)
- ✅ Apache proxy configured for `/api/` routes (recipe endpoints)
- ✅ Quick recipe feature deployed to production

## Apache Proxy Configuration

The following routes are proxied from Apache (port 443) to the backend (port 3000):
- `/api/*` → Backend recipe endpoints
- `/login` → Backend login
- `/signup` → Backend signup
- `/me` → Backend user info
- `/posts` → Backend social posts
- `/likes` → Backend likes
- `/comments` → Backend comments
- `/follows` → Backend follows
- `/notifications` → Backend notifications
- `/users` → Backend user profiles
- `/auth/*` → Backend OAuth routes
- `/generate-recipe` → Backend recipe generation
- `/fetch-recipe-details` → Backend recipe details
- `/random-recipes` → Backend random recipes
- `/save-recipe` → Backend save recipe
