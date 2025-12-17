export const googleConfig = {
  issuer: "https://accounts.google.com",
  clientId: "YOUR_GOOGLE_CLIENT_ID",
  redirectUrl: "com.yourapp:/oauth2redirect/google",
  scopes: ["openid", "profile", "email"],
};

export const facebookConfig = {
  issuer: "https://www.facebook.com",
  clientId: "YOUR_FACEBOOK_CLIENT_ID",
  redirectUrl: "com.yourapp:/oauth2redirect/facebook",
  scopes: ["public_profile", "email"],
};

export const appleConfig = {
  issuer: "https://appleid.apple.com",
  clientId: "YOUR_APPLE_CLIENT_ID",
  redirectUrl: "com.yourapp:/oauth2redirect/apple",
  scopes: ["name", "email"],
};
