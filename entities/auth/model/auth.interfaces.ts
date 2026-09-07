export interface AuthState {
  access_token: string | null;
  refresh_token: string | null | undefined;
  expires_in: number | null | undefined;
  issued_at: number | null;
  error: string | null;
  isLoaded: boolean
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number | undefined;
  token_type?: string;
}

export interface UserInfo {
  sub: string;
  employee_id: string;
  [key: string]: any;
}

export interface AuthProcessResult {
  success: boolean;
  userInfo?: UserInfo;
  warnings?: string[];
  error?: string;
}