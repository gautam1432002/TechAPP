// ─── Participant (Flat) ─────────────────────────────────────────────────────
export interface Participant {
  id: string;                   // Registration ID e.g. "TAR-2026-001"
  certificateId: string;
  name: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  events: string[];             // array of event slugs
  registeredAt: string;
  isWinner: boolean;
  winnerEvent: string | null;
  certificateIssued: boolean;
  certificateSentAt: string | null;
}

// ─── Public Registration ────────────────────────────────────────────────────
export interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  events: string[];
}

// ─── Certificate ────────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  qr_token: string;
  registration_id: string;
  type: 'participation' | 'winner';
  prize_position: string;
  pdf_url: string | null;
  issued_at: string;
  is_valid: boolean;
  // Nested / expanded fields
  participant_name?: string;
  event_title?: string;
}

// ─── Verification ──────────────────────────────────────────────────────────
export interface VerificationResult {
  isValid: boolean;
  certificateId: string;
  participant: {
    name: string;
    college: string;
  };
  event: {
    title: string;
    date: string;
  };
  type: 'participation' | 'winner' | 'entry-pass';
  issuedAt: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────
export interface OverviewAnalytics {
  totalParticipants: number;
  totalEvents: number;
  totalCertificates: number;
  totalWinners: number;
  totalRegistrations: number;
  activeEvents: number;
}

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  participantCount: number;
  winnerCount: number;
  fillRate: number;
}

export interface RegistrationTimeline {
  date: string;
  newRegistrations: number;
  cumulativeTotal: number;
}

// ─── Contact ───────────────────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  is_read: boolean;
  created_at: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}
