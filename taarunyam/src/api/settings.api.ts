import apiClient from './client';
import type { SiteSettings } from '../types/settings.types';

// Backend always wraps: { success: true, data: { ...settingsObj } }
// The serializer now returns camelCase fields directly.

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const { data } = await apiClient.get('/api/settings/public/');
    // Unwrap the { success, data } envelope
    return (data?.data ?? data) as SiteSettings;
};

export const updateSiteSettings = async (payload: Partial<SiteSettings>): Promise<SiteSettings> => {
    const { data } = await apiClient.put('/api/admin/settings/', payload);
    return (data?.data ?? data) as SiteSettings;
};
