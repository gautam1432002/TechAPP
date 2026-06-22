import { create } from 'zustand';
import { eventsApi } from '../api/events.api';
import { Event } from '../types/event.types';

interface EventsState {
  publicEvents: Event[];
  adminEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  fetchPublicEvents: () => Promise<void>;
  fetchAdminEvents: (params?: any) => Promise<void>;
  setSelectedEvent: (event: Event | null) => void;
  deleteEvent: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  publicEvents: [],
  adminEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  setSelectedEvent: (event) => set({ selectedEvent: event }),

  fetchPublicEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await eventsApi.getPublicEvents();
      set({ publicEvents: res.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to load events', isLoading: false });
    }
  },

  fetchAdminEvents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await eventsApi.getAdminEvents(params);
      const data = res.data.data;
      const list = Array.isArray(data) ? data : (data && Array.isArray((data as any).results) ? (data as any).results : []);
      set({ adminEvents: list, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to load events', isLoading: false });
    }
  },

  deleteEvent: async (id) => {
    try {
      await eventsApi.deleteEvent(id);
      set((state) => ({
        adminEvents: state.adminEvents.filter((e) => e.id !== id),
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to delete event' });
    }
  },
}));
