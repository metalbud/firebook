#!/bin/bash
API_BASE="http://firebook.app"
echo "=== Testing Firebook API Endpoints ==="
echo ""

echo "1. Testing /api/signup..."
SIGNUP_RESULT=$(curl -s -X POST "$API_BASE/api/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@firebook.app","password":"testpass123"}')
echo "Result: $SIGNUP_RESULT"
echo ""

echo "2. Testing /api/login..."
LOGIN_RESULT=$(curl -s -X POST "$API_BASE/api/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"testpass123"}')
echo "Result: $LOGIN_RESULT"
echo ""

echo "3. Testing /api/me with token..."
TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.token // empty' 2>/dev/null)
if [ -n "$TOKEN" ]; then
  echo "No token found, skipping /me test"
else
  ME_RESULT=$(curl -s -X GET "$API_BASE/api/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  echo "Result: $ME_RESULT"
fi
echo ""

echo "4. Testing /api/refresh-token..."
REFRESH_RESULT=$(curl -s -X POST "$API_BASE/api/refresh-token" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"test_token"}')
echo "Result: $REFRESH_RESULT"
echo ""

echo "5. Testing /api/user-recipes (requires auth)..."
if [ -n "$TOKEN" ]; then
  echo "No token found, skipping /user-recipes test"
else
  RECIPES_RESULT=$(curl -s -X GET "$API_BASE/api/user-recipes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  echo "Result: $RECIPES_RESULT"
fi
echo ""

echo "=== All tests completed! ==="
