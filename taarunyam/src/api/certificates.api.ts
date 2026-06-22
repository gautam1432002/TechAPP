import apiClient from './client';
import type { CertificateVerifyResponse } from '../types/certificate.types';

export const getCertificates = async (params?: Record<string, any>) => {
    const { data } = await apiClient.get('/api/admin/certificates/', { params });
    return data;
};

export const generateCertificate = async (payload: { registration_id: string; type: string; prize_position?: string }) => {
    const { data } = await apiClient.post('/api/admin/certificates/generate/', payload);
    return data;
};

export const bulkGenerateCertificates = async (payload: { event_id: string; type: string }) => {
    const { data } = await apiClient.post('/api/admin/certificates/bulk-generate/', payload);
    return data;
};

export const downloadCertificate = async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/admin/certificates/${id}/download/`, { responseType: 'blob' });
    return response.data;
};

export const checkCertificateTaskStatus = async (taskId: string) => {
    const { data } = await apiClient.get(`/api/admin/certificates/task/${taskId}/`);
    return data;
};

export const revokeCertificate = async (id: string) => {
    const { data } = await apiClient.post(`/api/admin/certificates/${id}/revoke/`);
    return data;
};

export const reinstateCertificate = async (id: string) => {
    const { data } = await apiClient.post(`/api/admin/certificates/${id}/reinstate/`);
    return data;
};

export const getCertificateSettings = async () => {
    const { data } = await apiClient.get('/api/admin/certificates/settings/');
    return data;
};

export const updateCertificateSettings = async (payload: any) => {
    const { data } = await apiClient.put('/api/admin/certificates/settings/', payload);
    return data;
};

export const verifyCertificate = async (token: string): Promise<CertificateVerifyResponse> => {
    const { data } = await apiClient.get(`/api/certificates/verify/${token}/`);
    return data.data;
};

/**
 * Issue 3 fix: Download the same ReportLab PDF the email system attaches.
 * Uses the /api/admin/certificates/preview-download/ endpoint.
 * Both the admin Preview download button and email attachment come from this path.
 */
export const downloadCertificatePdfByRegistrationId = async (
    registrationId: string,
    certType?: 'winner' | 'participation',
): Promise<Blob> => {
    const response = await apiClient.post(
        '/api/admin/certificates/preview-download/',
        { registration_id: registrationId, ...(certType ? { cert_type: certType } : {}) },
        { responseType: 'blob' },
    );
    return response.data;
};
