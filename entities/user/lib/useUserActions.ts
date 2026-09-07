import { userApi } from "../api/user.api";

export const useUserActions = () => ({
  changePassword: userApi.changePassword,
  resetPassword: userApi.resetPassword,
});
