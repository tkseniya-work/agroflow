export interface ChangePasswordRequest {
  accessToken: string | null;
  userName: string | null;
  oldPassword: string | null;
  password: string | null;
  confirmPassword: string | null;
  userId: string | null;
}

export interface ResetPasswordRequest {
  email: string | null;
}
