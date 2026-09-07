export { authApi } from "./api/auth.api";
export { AUTH_CONFIG } from "./api/authConfig";
export { useAuthActions } from "./lib/useAuthActions";
export { useAuthState } from "./lib/useAuthState";
export {
  DEFAULT_TOKEN_LIFETIME_SECONDS,
  isTokenExpired,
  isRefreshTokenRejected,
  createRefreshedAuthState,
} from "./model/authSession.logic";
export type {
  AuthState,
  TokenResponse,
  UserInfo,
  AuthProcessResult,
} from "./model/auth.interfaces";
// useAuth/useAuthenticatedAppSession and the underlying auth.state.ts atoms
// are intentionally NOT re-exported here: auth.state.ts imports AsyncStorage
// at module scope, and several real consumers (LoginPage, this entity's own
// api-only tests) need only the light pieces above without pulling that in.
// Import the hooks by their concrete path instead.
