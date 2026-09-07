import { revokeAsync, TokenTypeHint } from "expo-auth-session";

import { authApi, AUTH_CONFIG } from "../../entities/auth";

jest.mock("expo-auth-session", () => ({
  exchangeCodeAsync: jest.fn(),
  fetchUserInfoAsync: jest.fn(),
  refreshAsync: jest.fn(),
  revokeAsync: jest.fn(),
  makeRedirectUri: jest.fn(() => "com.example.agroflow://redirect"),
  TokenTypeHint: {
    AccessToken: "access_token",
    RefreshToken: "refresh_token",
  },
}));

const mockRevokeAsync = revokeAsync as jest.Mock;

describe("authApi.revokeToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRevokeAsync.mockResolvedValue(true);
  });

  test("revokes a refresh token without opening a browser", async () => {
    await authApi.revokeToken("refresh-token", true);

    expect(mockRevokeAsync).toHaveBeenCalledWith(
      {
        clientId: AUTH_CONFIG.clientId,
        token: "refresh-token",
        tokenTypeHint: TokenTypeHint.RefreshToken,
      },
      AUTH_CONFIG.discovery,
    );
  });

  test("falls back to access-token revocation", async () => {
    await authApi.revokeToken("access-token", false);

    expect(mockRevokeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "access-token",
        tokenTypeHint: TokenTypeHint.AccessToken,
      }),
      AUTH_CONFIG.discovery,
    );
  });
});
