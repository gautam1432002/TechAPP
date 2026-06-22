import { api } from './client';
import { ApiResponse } from '../types/api.types';
import {
  EventAnalytics,
  OverviewAnalytics,
  RegistrationTimeline,
  VerificationResult,
  ContactMessage,
  ContactPayload,
} from '../types/participant.types';

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  getOverview: () =>
    api.get<ApiResponse<OverviewAnalytics>>('/admin/analytics/overview/'),

  getEventsBreakdown: () =>
    api.get<ApiResponse<EventAnalytics[]>>('/admin/analytics/events/breakdown/'),

  getRegistrationsTimeline: () =>
    api.get<ApiResponse<RegistrationTimeline[]>>('/admin/analytics/registrations/'),
};

// ─── Verification ─────────────────────────────────────────────────────────────
export const verificationApi = {
  verifyCertificate: (qrToken: string) =>
    api.get<ApiResponse<VerificationResult>>(`/verify/${qrToken}/`),
};

// ─── Contact ─────────────────────────────────────────────────────────────────
export const contactApi = {
  submitContact: (payload: ContactPayload) =>
    api.post<ApiResponse<{}>>('/contact/', payload),

  // Admin
  getMessages: (params?: { page?: number }) =>
    api.get<ApiResponse<ContactMessage[]>>('/admin/contact/', { params }),

  markRead: (id: string) =>
    api.post<ApiResponse<{}>>(`/admin/contact/${id}/read/`),
};

// ─── Email ────────────────────────────────────────────────────────────────────
export const emailApi = {
  getLogs: (params?: { page?: number }) =>
    api.get<ApiResponse<any[]>>('/admin/email/logs/', { params }),

  getStats: () =>
    api.get<ApiResponse<any>>('/admin/email/stats/'),

  sendEmails: (payload: any) =>
    api.post<ApiResponse<{ task_id: string }>>('/admin/email/send/', payload),

  getTaskStatus: (taskId: string) =>
    api.get<ApiResponse<{ status: string }>>(`/admin/email/task/${taskId}/`),
};
