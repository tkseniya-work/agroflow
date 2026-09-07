import type { AuthState, TokenResponse } from "./auth.interfaces";

export const DEFAULT_TOKEN_LIFETIME_SECONDS = 3600;

export const isTokenExpired = (auth: AuthState): boolean => {
  if (!auth.access_token || !auth.issued_at || !auth.expires_in) {
    return true;
  }

  const expiryTime = auth.issued_at + auth.expires_in * 1000;
  const bufferTime = 5 * 60 * 1000;

  return Date.now() >= expiryTime - bufferTime;
};

const getErrorValue = (error: unknown, key: string): unknown => {
  if (!error || typeof error !== "object") return undefined;
  return (error as Record<string, unknown>)[key];
};

export const isRefreshTokenRejected = (error: unknown): boolean => {
  const params = getErrorValue(error, "params");
  const response = getErrorValue(error, "response");
  const responseData = getErrorValue(response, "data");
  const codes = [
    getErrorValue(error, "code"),
    getErrorValue(error, "error"),
    getErrorValue(params, "error"),
    getErrorValue(responseData, "error"),
  ];

  if (codes.some((code) => code === "invalid_grant")) {
    return true;
  }

  return error instanceof Error && error.message.includes("invalid_grant");
};

export const createRefreshedAuthState = (
  currentAuth: AuthState,
  newTokens: TokenResponse,
  issuedAt = Date.now(),
): AuthState => ({
  ...currentAuth,
  access_token: newTokens.access_token,
  refresh_token: newTokens.refresh_token || currentAuth.refresh_token,
  expires_in:
    newTokens.expires_in ||
    currentAuth.expires_in ||
    DEFAULT_TOKEN_LIFETIME_SECONDS,
  issued_at: issuedAt,
  error: null,
  isLoaded: true,
});
