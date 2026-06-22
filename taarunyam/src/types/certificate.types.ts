export type CertificateType = 'participation' | 'winner' | 'entry-pass';

export interface Certificate {
    id: string;
    participantId: string;
    eventId: string;
    type: CertificateType;
    issuedAt: string;
    qrToken: string;
    isValid: boolean;
    downloadedAt: string | null;
}

export interface CertificateVerifyResponse {
    isValid: boolean;
    certificateId: string;
    participant: { name: string; college: string };
    event: { title: string; date: string };
    type: CertificateType;
    issuedAt: string;
    certSettings?: CertSettings;
}

export interface CertificateStats {
    total: number;
    sent: number;
    pending: number;
    byType: { participation: number; winner: number };
}

export interface Authority {
    name: string;
    title: string;
    signature: string; // Base64 image
}

export interface CertSettings {
    organizerLogo: string; // Base64 image
    organizerName: string;
    eventName: string; // Dynamic but editable skeleton
    participation: {
        title: string;
        mainText: string;
        subText: string;
        eventDetails: string;
    };
    winner: {
        title: string;
        mainText: string;
        achievementText: string;
        eventDetails: string;
    };
    authorities: {
        coordinator: Authority;
        hod: Authority;
        principal: Authority;
    };
}
