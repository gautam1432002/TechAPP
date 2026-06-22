import { api } from './client';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Event, CreateEventPayload } from '../types/event.types';
import { Participant } from '../types/participant.types';

export const eventsApi = {
  // ─── Public ──────────────────────────────────────────────────────────────
  getPublicEvents: () =>
    api.get<ApiResponse<Event[]>>('/events/'),

  // ─── Admin ───────────────────────────────────────────────────────────────
  getAdminEvents: (params?: { search?: string; ordering?: string; page?: number }) =>
    api.get<ApiResponse<Event[]>>('/admin/events/', { params }),

  getAdminEvent: (id: string) =>
    api.get<ApiResponse<Event>>(`/admin/events/${id}/`),

  createEvent: (data: FormData) =>
    api.post<ApiResponse<Event>>('/admin/events/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateEvent: (id: string, data: Partial<CreateEventPayload> | FormData) =>
    api.put<ApiResponse<Event>>(`/admin/events/${id}/`, data, {
      headers:
        data instanceof FormData
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' },
    }),

  patchEvent: (id: string, data: Partial<CreateEventPayload>) =>
    api.patch<ApiResponse<Event>>(`/admin/events/${id}/`, data),

  deleteEvent: (id: string) =>
    api.delete<ApiResponse<{}>>(`/admin/events/${id}/`),

  getEventParticipants: (eventId: string, params?: { page?: number }) =>
    api.get<PaginatedResponse<Participant>>(
      `/admin/events/${eventId}/participants/`,
      { params },
    ),
};
