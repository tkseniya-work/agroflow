import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import {
  accessTokenAtom,
  authAtom,
  authInitializedAtom,
  initializeAuthAtom,
  isAuthenticatedAtom,
  loginAtom,
  logoutAtom,
  refreshTokenAtom,
  stableAuthStateAtom,
  tokenExpiryAtom,
} from "../model/auth.state";
import { AuthState } from "../model/auth.interfaces";
import { authApi } from "../api/auth.api";
import {
  createRefreshedAuthState,
  isRefreshTokenRejected,
  isTokenExpired,
} from "../model/authSession.logic";

let tokenRefreshPromise: Promise<string | null> | null = null;
let latestAuthState: AuthState | null = null;

export const useAuth = () => {
  const auth = useAtomValue(stableAuthStateAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const timeUntilExpiry = useAtomValue(tokenExpiryAtom);
  const access_token = useAtomValue(accessTokenAtom);
  const refresh_token = useAtomValue(refreshTokenAtom);
  const isInitialized = useAtomValue(authInitializedAtom);

  const initializeAuth = useSetAtom(initializeAuthAtom);
  const login = useSetAtom(loginAtom);
  const logout = useSetAtom(logoutAtom);
  const setAuth = useSetAtom(authAtom);

  useEffect(() => {
    if (auth.isLoaded) {
      latestAuthState = auth;
    }
  }, [auth]);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  const loginWithTokens = useCallback(
    (accessToken: string, refreshToken?: string, expiresIn?: number) => {
      latestAuthState = {
        access_token: accessToken,
        refresh_token: refreshToken || null,
        expires_in: expiresIn ?? 3600,
        issued_at: Date.now(),
        error: null,
        isLoaded: true,
      };
      login({ accessToken, refreshToken, expiresIn });
    },
    [login]
  );

  const refreshAuthToken = useCallback(async () => {
    const currentAuth = latestAuthState?.isLoaded ? latestAuthState : auth;

    if (!currentAuth.isLoaded || !currentAuth.refresh_token) {
      console.error("Token refresh failed:", new Error("No refresh token available"));
      return null;
    }

    if (tokenRefreshPromise) {
      return tokenRefreshPromise;
    }

    try {
      tokenRefreshPromise = authApi
        .refreshToken(currentAuth.refresh_token)
        .then((newTokens) => {
          const nextAuth = createRefreshedAuthState(currentAuth, newTokens);

          latestAuthState = nextAuth;
          setAuth(nextAuth);

          return newTokens.access_token;
        })
        .finally(() => {
          tokenRefreshPromise = null;
        });

      return await tokenRefreshPromise;
    } catch (error) {
      if (isRefreshTokenRejected(error)) {
        latestAuthState = null;
        logout();
        return null;
      }

      console.error("Token refresh failed:", error);
      return null;
    }
  }, [auth, logout, setAuth]);

  const getValidAccessToken = useCallback(async () => {
    const currentAuth = latestAuthState?.isLoaded ? latestAuthState : auth;

    if (!currentAuth.isLoaded) {
      return null;
    }

    if (currentAuth.access_token && !isTokenExpired(currentAuth)) {
      return currentAuth.access_token;
    }

    if (!currentAuth.refresh_token) return null;

    try {
      return await refreshAuthToken();
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }, [auth, refreshAuthToken]);

  const logoutWithReset = useCallback(() => {
    latestAuthState = null;
    logout();
  }, [logout]);

  return {
    // Состояние
    auth,
    isAuthenticated,
    isLoading: !auth.isLoaded || !isInitialized,
    isLoaded: auth.isLoaded && isInitialized,
    isInitialized,
    error: auth.error,
    access_token,
    refresh_token,
    expires_in: auth.expires_in,
    timeUntilExpiry,

    // Действия
    login: loginWithTokens,
    logout: logoutWithReset,
    refreshToken: refreshAuthToken,
    getValidAccessToken,

    // Вспомогательные
    hasValidToken: isAuthenticated && !auth.error,
  };
};
