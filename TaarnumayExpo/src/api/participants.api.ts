import { api } from './client';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Participant, RegisterPayload } from '../types/participant.types';

export const participantsApi = {
  // ─── Public ──────────────────────────────────────────────────────────────
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ participant: Participant }>>('/participants/register/', payload),

  lookup: (query: string) =>
    api.get<ApiResponse<{ found: boolean; participant?: { id: string; name: string; certificateId: string } }>>(
      '/participants/lookup/',
      { params: { q: query } },
    ),

  // ─── Admin ───────────────────────────────────────────────────────────────
  getAdminParticipants: (params?: {
    search?: string;
    event?: string;
    isWinner?: boolean;
    page?: number;
  }) => api.get<PaginatedResponse<Participant>>('/admin/participants/', { params }),

  getAdminParticipant: (registrationId: string) =>
    api.get<ApiResponse<Participant>>(`/admin/participants/${registrationId}/`),

  updateParticipant: (registrationId: string, data: Partial<RegisterPayload>) =>
    api.put<ApiResponse<Participant>>(`/admin/participants/${registrationId}/`, data),

  patchParticipant: (registrationId: string, data: Partial<RegisterPayload>) =>
    api.patch<ApiResponse<Participant>>(`/admin/participants/${registrationId}/`, data),

  deleteParticipant: (registrationId: string) =>
    api.delete<ApiResponse<{}>>(`/admin/participants/${registrationId}/`),

  bulkDelete: (ids: string[]) =>
    api.post<ApiResponse<{ deleted: number }>>('/admin/participants/bulk-delete/', { ids }),

  toggleWinner: (registrationId: string, prizePosition?: string) =>
    api.patch<ApiResponse<Participant>>(
      `/admin/participants/${registrationId}/toggle-winner/`,
      { prizePosition: prizePosition ?? '' },
    ),

  toggleAttendance: (registrationId: string, isPresent?: boolean) =>
    api.patch<ApiResponse<{ isPresent: boolean }>>(
      `/admin/participants/${registrationId}/attendance/`,
      isPresent !== undefined ? { isPresent } : {},
    ),

  exportParticipants: (format: 'csv' | 'xlsx' = 'csv') =>
    api.get('/admin/participants/export/', {
      params: { format },
      responseType: 'blob',
    }),
};
