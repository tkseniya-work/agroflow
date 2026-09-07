import { authApi } from "../api/auth.api";

export const useAuthActions = () => ({
  exchangeCodeForToken: authApi.exchangeCodeForToken,
  getUserInfo: authApi.getUserInfo,
});
