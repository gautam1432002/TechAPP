import { api } from './client';
import { ApiResponse } from '../types/api.types';
import { Certificate } from '../types/participant.types';

export const certificatesApi = {
  list: (params?: { page?: number }) =>
    api.get<ApiResponse<Certificate[]>>('/admin/certificates/', { params }),

  generate: (payload: { registration_id: string; type?: string }) =>
    api.post<ApiResponse<Certificate>>('/admin/certificates/generate/', payload),

  bulkGenerate: (payload: { event_id?: string; registration_ids?: string[] }) =>
    api.post<ApiResponse<{ task_id: string }>>('/admin/certificates/bulk-generate/', payload),

  getTaskStatus: (taskId: string) =>
    api.get<ApiResponse<{ status: string; result?: any }>>(`/admin/certificates/task/${taskId}/`),

  download: (certId: string) =>
    api.get(`/admin/certificates/${certId}/download/`, { responseType: 'blob' }),

  revoke: (certId: string) =>
    api.post<ApiResponse<{}>>(`/admin/certificates/${certId}/revoke/`),

  reinstate: (certId: string) =>
    api.post<ApiResponse<{}>>(`/admin/certificates/${certId}/reinstate/`),

  getSettings: () =>
    api.get<ApiResponse<any>>('/admin/certificates/settings/'),

  getStats: () =>
    api.get<ApiResponse<any>>('/admin/certificates/stats/'),
};
