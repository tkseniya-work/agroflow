import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

export const AUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID!,
  scopes: process.env.EXPO_PUBLIC_OAUTH_SCOPES?.split(",") || [],
  redirectUri: makeRedirectUri({
    native: process.env.EXPO_PUBLIC_OAUTH_REDIRECT,
  }),
  discovery: {
    authorizationEndpoint: `${process.env.EXPO_PUBLIC_STS_URL}/connect/authorize`,
    tokenEndpoint: `${process.env.EXPO_PUBLIC_STS_URL}/connect/token`,
    revocationEndpoint: `${process.env.EXPO_PUBLIC_STS_URL}/connect/revocation`,
    userInfoEndpoint: `${process.env.EXPO_PUBLIC_STS_URL}/connect/userinfo`,
    endSessionEndpoint: `${process.env.EXPO_PUBLIC_STS_URL}/connect/endsession`,
    deviceAuthorizationEndpoint: `${process.env.EXPO_PUBLIC_STS_URL}/connect/deviceauthorization`,
  } as const,
  version: Constants.expoConfig?.version || "1.0.0",
};