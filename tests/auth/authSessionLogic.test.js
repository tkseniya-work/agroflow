const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createRefreshedAuthState,
  isRefreshTokenRejected,
} = require("../../.test-build/entities/auth/model/authSession.logic");

const currentAuth = {
  access_token: "old-access-token",
  refresh_token: "refresh-token",
  expires_in: 1800,
  issued_at: 100,
  error: null,
  isLoaded: true,
};

test("refresh keeps the previous lifetime when expires_in is omitted", () => {
  const result = createRefreshedAuthState(
    currentAuth,
    { access_token: "new-access-token" },
    200,
  );

  assert.equal(result.access_token, "new-access-token");
  assert.equal(result.refresh_token, "refresh-token");
  assert.equal(result.expires_in, 1800);
  assert.equal(result.issued_at, 200);
});

test("Expo TokenError with invalid_grant is recognized as an expired session", () => {
  assert.equal(
    isRefreshTokenRejected({
      code: "invalid_grant",
      message: "The provided authorization grant is invalid or expired.",
      params: { error: "invalid_grant" },
    }),
    true,
  );
});

test("temporary network errors do not invalidate the session", () => {
  assert.equal(isRefreshTokenRejected(new Error("Network request failed")), false);
});
