// ─── Admin User ────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
}

// ─── Auth State ────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  user: AdminUser;
}

export interface OTPRequestPayload {
  email: string;
}

export interface OTPVerifyPayload {
  email: string;
  otp: string;
}

export interface OTPResetPayload {
  reset_token: string;
  new_username: string;
  new_password: string;
  confirm_password: string;
}
