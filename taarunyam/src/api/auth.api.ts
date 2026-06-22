import apiClient from './client';
import type { LoginPayload, LoginResponse } from '../types/api.types';

export const loginAdmin = async (payload: LoginPayload): Promise<LoginResponse> => {
    // Expected response format: { success, data: { access, user }, message }
    const { data } = await apiClient.post<{ success: boolean; data: { access: string; user: import('../types/api.types').AdminUser } }>('/api/auth/login/', payload);
    return { token: data.data.access, refreshToken: '', user: data.data.user };
};

export const logoutAdmin = async (): Promise<void> => {
    await apiClient.post('/api/auth/logout/');
};

export const getMe = async (): Promise<import('../types/api.types').AdminUser> => {
    const { data } = await apiClient.get<{ success: boolean; data: import('../types/api.types').AdminUser }>('/api/auth/me/');
    return data.data;
};

// OTP Flows
export const requestOtp = async (email: string): Promise<void> => {
    await apiClient.post('/api/auth/otp/request/', { email });
};

export const verifyOtp = async (email: string, otp: string): Promise<{ resetToken: string }> => {
    const { data } = await apiClient.post<{ success: boolean; data: { reset_token: string } }>('/api/auth/otp/verify/', { email, otp });
    return { resetToken: data.data.reset_token };
};

export const resetPassword = async (payload: Record<string, any>): Promise<void> => {
    // payload matches OTPResetSerializer { reset_token, new_username, new_password, confirm_password }
    await apiClient.post('/api/auth/otp/reset/', payload);
};
