import apiClient from './client';

export const getEmailLogs = async (params?: Record<string, any>) => {
    const { data } = await apiClient.get('/api/admin/email/logs/', { params });
    return data?.data ?? data;
};

export const getEmailStats = async () => {
    const { data } = await apiClient.get('/api/admin/email/stats/');
    return data?.data ?? data;
};

export const sendCertificateEmail = async (certificateId: string) => {
    const { data } = await apiClient.post('/api/admin/email/send/', { certificate_id: certificateId });
    return data?.data ?? data;
};

export const bulkSendEmails = async (payload: {
    participant_ids: string[];
    template: {
        subject: string;
        greeting: string;
        body: string;
        closing: string;
        signature: string;
    };
}) => {
    const { data } = await apiClient.post('/api/admin/email/bulk-send/', payload);
    // Backend now returns { success, data: { results, sent, failed, total }, message }
    return data?.data ?? data;
};

export const checkEmailTaskStatus = async (taskId: string) => {
    const { data } = await apiClient.get(`/api/admin/email/task/${taskId}/`);
    return data?.data ?? data;
};

export const uploadAndSendEmail = async (formData: FormData) => {
    const { data } = await apiClient.post('/api/admin/email/upload-send/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data?.data ?? data;
};
