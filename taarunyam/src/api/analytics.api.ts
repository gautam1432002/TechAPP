import apiClient from './client';
import type {
    AdminStats,
    EventWiseStat,
    CollegeWiseStat,
    TimelineStat,
    YearWiseStat,
} from '../types/api.types';

export const getAdminStats = async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: AdminStats }>('/api/admin/analytics/overview/');
    return data.data;
};

export const getEventWiseStats = async (): Promise<EventWiseStat[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: EventWiseStat[] }>('/api/admin/analytics/events/breakdown/');
    return data.data;
};

export const getCollegeWiseStats = async (): Promise<CollegeWiseStat[]> => {
    // Optional stub for frontend that requires it
    return [];
};

export const getRegistrationTimeline = async (): Promise<TimelineStat[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: TimelineStat[] }>('/api/admin/analytics/registrations/');
    return data.data;
};

export const getYearWiseStats = async (): Promise<YearWiseStat[]> => {
    // Optional stub for frontend that requires it
    return [];
};
