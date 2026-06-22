import apiClient from './client';
import type {
    Participant,
    RegisterPayload,
    RegisterResponse,
    UpdateParticipantPayload,
    ParticipantLookupResponse,
} from '../types/participant.types';
import type { PaginatedResponse } from '../types/api.types';

export const registerParticipant = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<{ success: boolean; data: { participant: Participant }; message: string }>('/api/participants/register/', payload);
    return {
        message: data.message,
        participant: data.data.participant,
    };
};

export const lookupParticipant = async (query: string): Promise<ParticipantLookupResponse> => {
    const { data } = await apiClient.get<{ success: boolean; data: any }>(`/api/participants/lookup/?q=${encodeURIComponent(query)}`);
    return data.data; // Expected { found: boolean, participant?: Participant }
};

export const getParticipants = async (params?: Record<string, any>): Promise<PaginatedResponse<Participant>> => {
    const { data } = await apiClient.get('/api/admin/participants/', { params });
    // handle custom paginated response wrapped in success: { success: true, data: { count, next, previous, results } }
    if (data.success && data.data) {
        return data.data as PaginatedResponse<Participant>;
    }
    return data as PaginatedResponse<Participant>;
};

export const updateParticipant = async (id: string, payload: UpdateParticipantPayload): Promise<Participant> => {
    const { data } = await apiClient.patch<{ success: boolean; data: Participant }>(`/api/admin/participants/${id}/`, payload);
    return data.data;
};

export const deleteParticipant = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/participants/${id}/`);
};

export const toggleWinner = async (id: string): Promise<Participant> => {
    const { data } = await apiClient.patch<{ success: boolean; data: Participant }>(`/api/admin/participants/${id}/toggle-winner/`);
    return data.data;
};

export const bulkDeleteParticipants = async (ids: string[]): Promise<{ deleted: number }> => {
    await apiClient.post<{ success: boolean; data: any; message: string }>('/api/admin/participants/bulk-delete/', { ids });
    return { deleted: ids.length };
};

export const exportParticipantsCSV = async (): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/participants/export/', { responseType: 'blob' });
    return response.data;
};
