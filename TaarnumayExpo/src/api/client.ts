import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, REFRESH_COOKIE_NAME, REQUEST_TIMEOUT } from '../constants/api.constants';
import { clearTokens, getToken, parseRefreshFromCookie, setToken } from '../utils/storage';

// Navigation ref for redirecting to Login on token expiry
// Set this from the root navigator
let _navigateToLogin: (() => void) | null = null;
export const setNavigateToLogin = (fn: () => void) => { _navigateToLogin = fn; };

// ─── Axios Instance ─────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Attach access token ───────────────────────────────

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken('access');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Auto-refresh on 401 ─────────────────────────────

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getToken('refresh');
        if (!refreshToken) throw new Error('No refresh token');

        // Send refresh request with cookie header (mobile workaround)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          null,
          {
            headers: {
              Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}`,
            },
          },
        );

        const newAccess: string = refreshResponse.data?.data?.access;
        if (!newAccess) throw new Error('No access token in refresh response');

        // Save new access token
        await setToken('access', newAccess);

        // Capture rotated refresh token from Set-Cookie header if present
        const setCookie = refreshResponse.headers['set-cookie'];
        if (setCookie) {
          const newRefresh = parseRefreshFromCookie(setCookie);
          if (newRefresh) await setToken('refresh', newRefresh);
        }

        // Retry original request with new access token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalRequest);
      } catch {
        // Refresh failed — clear tokens and redirect to login
        await clearTokens();
        _navigateToLogin?.();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
