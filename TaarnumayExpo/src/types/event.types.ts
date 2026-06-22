// ─── Event ─────────────────────────────────────────────────────────────────
export type EventCategory =
  | 'Programming'
  | 'Knowledge'
  | 'Innovation'
  | 'Web Development'
  | 'Problem Solving'
  | 'Artificial Intelligence'
  | 'Robotics'
  | 'Design'
  | 'Other';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  icon: string;
  venue: string;
  event_date: string;
  eventDate: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number;
  maxParticipants: number;
  registration_deadline: string | null;
  is_active: boolean;
  isActive: boolean;
  banner_image: string | null;
  prizes: string[];
  participant_count: number;
  winner_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  category: EventCategory;
  icon?: string;
  venue?: string;
  eventDate: string;
  start_time?: string;
  end_time?: string;
  maxParticipants?: number;
  registration_deadline?: string;
  isActive?: boolean;
  prizes?: string[];
}
