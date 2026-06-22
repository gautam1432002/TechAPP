import axios from 'axios';
import { api } from './client';
import { API_BASE_URL, REFRESH_COOKIE_NAME } from '../constants/api.constants';
import { ApiResponse } from '../types/api.types';
import { AdminUser, LoginRequest, LoginResponse, OTPRequestPayload, OTPResetPayload, OTPVerifyPayload } from '../types/auth.types';
import { parseRefreshFromCookie, setToken } from '../utils/storage';

export const authApi = {
  /**
   * Login — returns access token in body, refresh token in Set-Cookie header.
   * We manually extract and store the refresh cookie.
   */
  login: async (payload: LoginRequest) => {
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}/auth/login/`,
      payload,
    );
    // Extract refresh token from Set-Cookie header
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const refreshToken = parseRefreshFromCookie(setCookie);
      if (refreshToken) await setToken('refresh', refreshToken);
    }
    return response;
  },

  /** GET current admin user info */
  getMe: () => api.get<ApiResponse<AdminUser>>('/auth/me/'),

  /** Logout — blacklists refresh token on server */
  logout: async (refreshToken: string) => {
    return api.post('/auth/logout/', null, {
      headers: { Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` },
    });
  },

  /** OTP flow for password reset */
  requestOTP: (payload: OTPRequestPayload) =>
    api.post<ApiResponse<{}>>('/auth/otp/request/', payload),

  verifyOTP: (payload: OTPVerifyPayload) =>
    api.post<ApiResponse<{ reset_token: string }>>('/auth/otp/verify/', payload),

  resetPassword: (payload: OTPResetPayload) =>
    api.post<ApiResponse<{}>>('/auth/otp/reset/', payload),
};
