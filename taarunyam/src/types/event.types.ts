export interface TEvent {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    maxParticipants: number;
    capacity?: number;           // raw backend field (optionalized)
    prizes: string[];
    eventDate: string;
    event_date?: string;        // raw backend field (optionalized)
    isActive: boolean;
    is_active?: boolean;
    order?: number;
    participantCount?: number;
    slug?: string;
    venue?: string;
}

export interface EventPayload {
    title: string;
    description: string;
    category: string;
    icon: string;
    maxParticipants: number;
    prizes: string[];
    eventDate: string;
    isActive: boolean;
}
