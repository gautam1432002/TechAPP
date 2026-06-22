import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

export default function ProtectedRoute() {
    const isAuth = useAppStore((s) => s.isAdminAuthenticated);

    if (!isAuth) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
}
