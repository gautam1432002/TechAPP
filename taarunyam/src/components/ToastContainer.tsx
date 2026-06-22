import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export default function ToastContainer() {
    const toasts = useAppStore((s) => s.toasts);
    const removeToast = useAppStore((s) => s.removeToast);

    useEffect(() => {
        const timers = toasts.map((t) =>
            setTimeout(() => removeToast(t.id), 3500)
        );
        return () => timers.forEach(clearTimeout);
    }, [toasts, removeToast]);

    return (
        <div id="toast-container" className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="glass-card bg-background/90 text-foreground border border-glass-border p-4 rounded-lg shadow-lg min-w-[300px] animate-slide-in-right pointer-events-auto"
                >
                    <div className="font-semibold text-sm">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.message}</div>
                </div>
            ))}
        </div>
    );
}
