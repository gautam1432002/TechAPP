import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { clearTokens, getToken, setToken } from '../utils/storage';
import { AdminUser } from '../types/auth.types';

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadStoredAuth: async () => {
    try {
      const token = await getToken('access');
      if (!token) return;
      // Verify the token is still valid by fetching user info
      const res = await authApi.getMe();
      set({ user: res.data.data, accessToken: token, isAuthenticated: true });
    } catch {
      await clearTokens();
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ username, password });
      const { access, user } = res.data.data;
      await setToken('access', access);
      set({ user, accessToken: access, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Login failed. Check credentials.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const refresh = await getToken('refresh');
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Ignore logout errors
    } finally {
      await clearTokens();
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
