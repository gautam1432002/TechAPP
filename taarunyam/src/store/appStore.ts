import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types/api.types';
import type { CertificateType } from '../types/certificate.types';

interface Toast {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

interface AppState {
    // ─── Admin auth ───
    adminToken: string | null;
    adminUser: AdminUser | null;
    isAdminAuthenticated: boolean;
    adminLogin: (token: string, user: AdminUser) => void;
    adminLogout: () => void;

    // ─── Modal visibility ───
    isAdminModalOpen: boolean;
    openAdminModal: () => void;
    closeAdminModal: () => void;

    isRegModalOpen: boolean;
    preselectedEventId: string | null;
    openRegModal: (eventId?: string) => void;
    closeRegModal: () => void;

    isEditParticipantModalOpen: boolean;
    editParticipantId: string | null;
    openEditParticipantModal: (id: string) => void;
    closeEditParticipantModal: () => void;

    isEventDetailModalOpen: boolean;
    selectedEventId: string | null;
    openEventDetailModal: (id: string) => void;
    closeEventDetailModal: () => void;

    isCertModalOpen: boolean;
    certPreviewData: {
        participant: any;
        eventId: string;
        type: CertificateType;
    } | null;
    openCertModal: (data: AppState['certPreviewData']) => void;
    closeCertModal: () => void;

    // ─── Toast notifications ───
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Admin auth
            adminToken: null,
            adminUser: null,
            isAdminAuthenticated: false,
            adminLogin: (token, user) =>
                set({ adminToken: token, adminUser: user, isAdminAuthenticated: true }),
            adminLogout: () =>
                set({ adminToken: null, adminUser: null, isAdminAuthenticated: false }),

            // Admin modal
            isAdminModalOpen: false,
            openAdminModal: () => set({ isAdminModalOpen: true }),
            closeAdminModal: () => set({ isAdminModalOpen: false }),

            // Registration modal
            isRegModalOpen: false,
            preselectedEventId: null,
            openRegModal: (eventId) =>
                set({ isRegModalOpen: true, preselectedEventId: eventId || null }),
            closeRegModal: () =>
                set({ isRegModalOpen: false, preselectedEventId: null }),

            // Edit participant modal
            isEditParticipantModalOpen: false,
            editParticipantId: null,
            openEditParticipantModal: (id) =>
                set({ isEditParticipantModalOpen: true, editParticipantId: id }),
            closeEditParticipantModal: () =>
                set({ isEditParticipantModalOpen: false, editParticipantId: null }),

            // Event detail modal
            isEventDetailModalOpen: false,
            selectedEventId: null,
            openEventDetailModal: (id) =>
                set({ isEventDetailModalOpen: true, selectedEventId: id }),
            closeEventDetailModal: () =>
                set({ isEventDetailModalOpen: false, selectedEventId: null }),

            // Certificate modal
            isCertModalOpen: false,
            certPreviewData: null,
            openCertModal: (data) =>
                set({ isCertModalOpen: true, certPreviewData: data }),
            closeCertModal: () =>
                set({ isCertModalOpen: false, certPreviewData: null }),

            // Toasts
            toasts: [],
            addToast: (toast) => {
                const id = Date.now().toString() + Math.random().toString(36).substring(2);
                const newToast = { ...toast, id };
                const toasts = [...get().toasts, newToast];
                if (toasts.length > 4) toasts.shift();
                set({ toasts });
            },
            removeToast: (id) =>
                set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
        }),
        {
            name: 'taarunyam-auth-storage',
            partialize: (state) => ({
                adminToken: state.adminToken,
                adminUser: state.adminUser,
                isAdminAuthenticated: state.isAdminAuthenticated,
            }),
        }
    )
);
