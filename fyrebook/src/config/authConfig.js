/**
 * OAuth Configuration for Firebook Mobile App
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 *    - Create OAuth 2.0 Client ID
 *    - Create OAuth 2.0 Client Secret
 *    - Add Android Package Name: com.metalbud.firebook
 *    - Add SHA-1 fingerprint: <YOUR_SHA_FINGERPRINT>
 *    - Set authorized redirect URI: com.metalbud.firebook:/oauth2callback
 *
 * 2. Go to Facebook Developer Portal (developers.facebook.com)
 *    - Create a new App
 *    - Add Android platform
 *    - Copy App ID and App Secret
 *    - Add Package Name: com.metalbud.firebook
 *    - Add Class: com.metalbud.firebook
 *    - Set Authorized Redirect URI: com.metalbud.firebook:/oauth2callback
 *
 * 3. Go to Apple Developer Program (developer.apple.com)
 *    - Create a Services ID
 *    - Enable Sign in with Apple
 *    - Create a new App ID
 *    - Add Bundle ID: com.metalbud.firebook
 *    - Add Service: Sign in with Apple
 *    - Add Team ID and Key ID
 *    - Generate and download private key (.p8 file)
 *    - Set Return URL: com.metalbud.firebook:/oauth2callback
 *
 * IMPORTANT: Replace the placeholder values below with your actual credentials!
 * Store these securely using environment variables, never commit to version control.
 */

export const googleConfig = {
  issuer: "https://accounts.google.com",
  clientId: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
  redirectUrl: "com.metalbud.firebook:/oauth2callback",
  scopes: ["openid", "profile", "email"],
};

export const facebookConfig = {
  issuer: "https://www.facebook.com",
  clientId: process.env.FACEBOOK_APP_ID || "YOUR_FACEBOOK_CLIENT_ID",
  redirectUrl: "com.metalbud.firebook:/oauth2callback",
  scopes: ["public_profile", "email"],
};

export const appleConfig = {
  issuer: "https://appleid.apple.com",
  clientId: process.env.APPLE_CLIENT_ID || "YOUR_APPLE_CLIENT_ID",
  redirectUrl: "com.metalbud.firebook:/oauth2callback",
  scopes: ["name", "email"],
  // Note: Apple Sign In requires additional setup on Apple Developer portal
};
