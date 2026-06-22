import apiClient from './client';
import type { TEvent, EventPayload } from '../types/event.types';

// Backend wraps responses as: { success: true, data: [...] | {...} }
// The DRF router also wraps the list in pagination: { count, next, previous, results }
// Admin viewset wraps that further: { success: true, data: { count, results } }

const unwrap = (response: any): any => {
    const payload = response?.data ?? response;
    if (payload?.results && Array.isArray(payload.results)) {
        return payload.results;
    }
    return payload;
};

export const getPublicEvents = async (): Promise<TEvent[]> => {
    const { data } = await apiClient.get('/api/events/');
    const payload = unwrap(data);
    return Array.isArray(payload) ? payload : [];
};

export const getAdminEvents = async (): Promise<TEvent[]> => {
    const { data } = await apiClient.get('/api/admin/events/');
    const payload = unwrap(data);
    return Array.isArray(payload) ? payload : [];
};

export const createEvent = async (payload: EventPayload): Promise<TEvent> => {
    const { data } = await apiClient.post('/api/admin/events/', payload);
    return unwrap(data) as TEvent;
};

export const updateEvent = async (id: string, payload: Partial<EventPayload>): Promise<TEvent> => {
    const { data } = await apiClient.put(`/api/admin/events/${id}/`, payload);
    return unwrap(data) as TEvent;
};

export const deleteEvent = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/events/${id}/`);
};
