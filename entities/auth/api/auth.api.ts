import {
  exchangeCodeAsync,
  fetchUserInfoAsync,
  refreshAsync,
  revokeAsync,
  TokenTypeHint,
} from "expo-auth-session";

import type {
  TokenResponse,
  UserInfo,
} from "../model/auth.interfaces";
import { AUTH_CONFIG } from "./authConfig";

export const authApi = {
  async exchangeCodeForToken(
    code: string,
    codeVerifier?: string,
  ): Promise<TokenResponse | null> {
    try {
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: AUTH_CONFIG.clientId,
          code,
          redirectUri: AUTH_CONFIG.redirectUri,
          extraParams: codeVerifier
            ? {
                code_verifier: codeVerifier,
                access_type: "offline",
                prompt: "consent",
              }
            : undefined,
        },
        AUTH_CONFIG.discovery,
      );

      if (!tokenResponse) return null;

      return {
        access_token: tokenResponse.accessToken,
        refresh_token: tokenResponse.refreshToken,
        expires_in: tokenResponse.expiresIn,
      };
    } catch (error) {
      console.error("Token exchange error:", error);
      return null;
    }
  },

  async getUserInfo(accessToken: string): Promise<UserInfo | null> {
    try {
      const userInfo = await fetchUserInfoAsync(
        { accessToken },
        AUTH_CONFIG.discovery,
      );

      return userInfo as UserInfo;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const newTokens = await refreshAsync(
        {
          clientId: AUTH_CONFIG.clientId,
          refreshToken,
        },
        AUTH_CONFIG.discovery,
      );

      return {
        access_token: newTokens.accessToken,
        refresh_token: newTokens.refreshToken,
        expires_in: newTokens.expiresIn,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  revokeToken(token: string, isRefreshToken: boolean) {
    return revokeAsync(
      {
        clientId: AUTH_CONFIG.clientId,
        token,
        tokenTypeHint: isRefreshToken
          ? TokenTypeHint.RefreshToken
          : TokenTypeHint.AccessToken,
      },
      AUTH_CONFIG.discovery,
    );
  },
};
