import { create } from 'zustand';
import { participantsApi } from '../api/participants.api';
import { Participant } from '../types/participant.types';

interface ParticipantsState {
  participants: Participant[];
  selectedParticipant: Participant | null;
  totalCount: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;

  // Filters
  searchQuery: string;
  selectedEventId: string;
  isWinnerFilter: boolean | null;

  fetchParticipants: (page?: number) => Promise<void>;
  setSearch: (query: string) => void;
  setEventFilter: (eventId: string) => void;
  setWinnerFilter: (val: boolean | null) => void;
  setSelectedParticipant: (p: Participant | null) => void;
  toggleWinner: (registrationId: string, prizePosition?: string) => Promise<void>;
  toggleAttendance: (registrationId: string) => Promise<void>;
  clearError: () => void;
}

export const useParticipantsStore = create<ParticipantsState>((set, get) => ({
  participants: [],
  selectedParticipant: null,
  totalCount: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedEventId: '',
  isWinnerFilter: null,

  clearError: () => set({ error: null }),
  setSelectedParticipant: (p) => set({ selectedParticipant: p }),

  setSearch: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchParticipants(1);
  },

  setEventFilter: (eventId) => {
    set({ selectedEventId: eventId, currentPage: 1 });
    get().fetchParticipants(1);
  },

  setWinnerFilter: (val) => {
    set({ isWinnerFilter: val, currentPage: 1 });
    get().fetchParticipants(1);
  },

  fetchParticipants: async (page = 1) => {
    set({ isLoading: true, error: null, currentPage: page });
    const { searchQuery, selectedEventId, isWinnerFilter } = get();
    try {
      const res = await participantsApi.getAdminParticipants({
        search: searchQuery || undefined,
        event: selectedEventId || undefined,
        isWinner: isWinnerFilter ?? undefined,
        page,
      });
      // Backend returns PaginatedResponse for this endpoint
      const responseData = res.data as any;
      const nestedData = responseData?.data || responseData || {};
      const results = Array.isArray(nestedData) ? nestedData : (nestedData.results || []);
      const count = nestedData.count ?? results.length;
      set({ participants: results, totalCount: count, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to load participants', isLoading: false });
    }
  },

  toggleWinner: async (registrationId, prizePosition) => {
    try {
      const res = await participantsApi.toggleWinner(registrationId, prizePosition);
      const updated = res.data.data;
      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === registrationId ? updated : p,
        ),
        selectedParticipant:
          state.selectedParticipant?.id === registrationId ? updated : state.selectedParticipant,
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to toggle winner' });
    }
  },

  toggleAttendance: async (registrationId) => {
    try {
      await participantsApi.toggleAttendance(registrationId);
      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === registrationId ? { ...p } : p,
        ),
      }));
      // Re-fetch selected participant if open
      const { selectedParticipant } = get();
      if (selectedParticipant?.id === registrationId) {
        const res = await participantsApi.getAdminParticipant(registrationId);
        set({ selectedParticipant: res.data.data });
      }
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to toggle attendance' });
    }
  },
}));
