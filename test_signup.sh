#!/bin/bash
echo "Testing /api/signup endpoint..."
curl -X POST http://localhost:3003/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser3","email":"test3@firebook.app","password":"testpass123"}'

echo ""
echo "Testing /api/login endpoint..."
curl -X POST http://localhost:3003/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser3","password":"testpass123"}'

echo ""
echo "Testing /api/me endpoint..."
curl -X GET http://localhost:3003/api/me \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json"

echo ""
echo "Testing /api/refresh-token endpoint..."
curl -X POST http://localhost:3003/api/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"test_refresh_token"}'

echo ""
echo "Testing /api/user-recipes endpoint..."
curl -X GET http://localhost:3003/api/user-recipes \
  -H "Authorization: bearer fake_token"

echo ""
echo "All tests completed!"
