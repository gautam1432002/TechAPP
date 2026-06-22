import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export function useToast() {
    const addToast = useAppStore((s) => s.addToast);

    const toast = useCallback((title: string, message: string, type: ToastType = 'info') => {
        addToast({ title, message, type });
    }, [addToast]);

    return { toast };
}
