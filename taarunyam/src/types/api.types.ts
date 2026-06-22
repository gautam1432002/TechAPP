export interface PaginatedResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
    totalPages: number;
    currentPage: number;
}

export interface AdminStats {
    totalParticipants: number;
    totalWinners: number;
    totalEvents: number;
    certificatesIssued: number;
    certificatesSent: number;
    uniqueColleges: number;
}

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'superadmin' | 'admin';
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: AdminUser;
}

export interface EventWiseStat {
    eventId: string;
    eventTitle: string;
    participantCount: number;
    winnerCount: number;
    fillRate: number;
}

export interface CollegeWiseStat {
    college: string;
    participantCount: number;
}

export interface TimelineStat {
    date: string;
    newRegistrations: number;
    cumulativeTotal: number;
}

export interface YearWiseStat {
    year: string;
    count: number;
}
