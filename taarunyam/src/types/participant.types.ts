export interface Participant {
    id: string;
    certificateId: string;
    name: string;
    email: string;
    mobile: string;
    college: string;
    course: string;
    year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
    events: string[];
    registeredAt: string;
    isWinner: boolean;
    winnerEvent: string | null;
    certificateIssued: boolean;
    certificateSentAt: string | null;
}

export interface RegisterPayload {
    name: string;
    email: string;
    mobile: string;
    college: string;
    course: string;
    year: string;
    events: string[];
}

export interface RegisterResponse {
    participant: Participant;
    message: string;
}

export interface UpdateParticipantPayload {
    name?: string;
    email?: string;
    mobile?: string;
    college?: string;
    course?: string;
    year?: string;
    events?: string[];
}

export interface ToggleWinnerPayload {
    eventId: string;
}

export interface BulkSendResponse {
    sent: number;
    failed: number;
    message: string;
}

export interface ParticipantLookupResponse {
    found: boolean;
    participant?: Pick<Participant, 'id' | 'name' | 'certificateId'>;
}
