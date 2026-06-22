// Base URL — change to your LAN IP for physical device testing
// Android emulator maps 10.0.2.2 → your PC's localhost
export const API_BASE_URL = 'http://10.254.6.154:8000/api';

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS: 'taarnumay_access_token',
  REFRESH: 'taarnumay_refresh_token',
} as const;

// Cookie name used by the backend
export const REFRESH_COOKIE_NAME = 'taarunyam_refresh';

// Request timeout in ms
export const REQUEST_TIMEOUT = 15000;
