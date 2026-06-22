import { X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import AdminLoginView from './AdminLoginView';
import AdminDashboardView from './AdminDashboardView';

export default function AdminModal() {
    const isOpen = useAppStore((s) => s.isAdminModalOpen);
    const isAuth = useAppStore((s) => s.isAdminAuthenticated);
    const closeAdminModal = useAppStore((s) => s.closeAdminModal);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={closeAdminModal}>
            <div
                className="glass-card w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={closeAdminModal} className="absolute right-4 top-4 text-muted-foreground hover:text-white z-10">
                    <X />
                </button>

                {isAuth ? <AdminDashboardView /> : <AdminLoginView />}
            </div>
        </div>
    );
}
