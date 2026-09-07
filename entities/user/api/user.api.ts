import axios, { isAxiosError } from "axios";

import { API } from "./endpoints/user.endpoints";
import { getAuthHeaders } from "../../../shared/lib/apiUtils";
import type { ChangePasswordRequest, ResetPasswordRequest } from "../model/user.types";

export const userApi = {
  async changePassword(request: ChangePasswordRequest) {
    try {
      const requestData = JSON.stringify({
        userName: request.userName,
        oldPassword: request.oldPassword,
        password: request.password,
        confirmPassword: request.confirmPassword,
        userId: request.userId,
      });

      const response = await axios.post(API.changePassword, requestData, {
        headers: getAuthHeaders(request.accessToken),
      });

      return response.data as string;
    } catch (error) {
      if (!isAxiosError(error) || !error.response) {
        console.error("Unexpected error changing password:", error);
      }
      return "Пароль не изменен. Попробуйте еще раз";
    }
  },

  async resetPassword(request: ResetPasswordRequest) {
    try {
      if (!request) return false;

      const requestData = JSON.stringify({
        email: request.email,
      });

      await axios.post(API.resetPassword, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  },
};
