import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEYS } from '../constants/api.constants';

// ─── Token Storage ──────────────────────────────────────────────────────────

export const getToken = async (key: 'access' | 'refresh'): Promise<string | null> => {
  try {
    const storageKey = key === 'access' ? TOKEN_KEYS.ACCESS : TOKEN_KEYS.REFRESH;
    return await AsyncStorage.getItem(storageKey);
  } catch {
    return null;
  }
};

export const setToken = async (key: 'access' | 'refresh', value: string): Promise<void> => {
  try {
    const storageKey = key === 'access' ? TOKEN_KEYS.ACCESS : TOKEN_KEYS.REFRESH;
    await AsyncStorage.setItem(storageKey, value);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS);
    await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH);
  } catch (e) {
    console.error('Failed to clear tokens', e);
  }
};

// ─── Generic Storage ────────────────────────────────────────────────────────

export const storeData = async (key: string, value: string): Promise<void> => {
  await AsyncStorage.setItem(key, value);
};

export const getData = async (key: string): Promise<string | null> => {
  return await AsyncStorage.getItem(key);
};

export const removeData = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

// ─── Parse refresh token from Set-Cookie header ─────────────────────────────
// The backend sends refresh via HttpOnly cookie; on mobile we capture it manually
export const parseRefreshFromCookie = (setCookieHeader: string | string[]): string | null => {
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const h of headers) {
    if (h.includes('taarunyam_refresh=')) {
      const match = h.match(/taarunyam_refresh=([^;]+)/);
      if (match) return match[1];
    }
  }
  return null;
};
