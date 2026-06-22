import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import App from '../App';
import HomePage from '../pages/HomePage';
import VerifyCertificatePage from '../pages/VerifyCertificatePage';
import AdminPage from '../pages/AdminPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminDashboardView from '../components/admin/AdminDashboardView';
import AdminLoginView from '../components/admin/AdminLoginView';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
                <App />
            </Suspense>
        ),
        children: [
            { index: true, element: <HomePage /> },
            { path: 'verify/:qrToken', element: <VerifyCertificatePage /> },
        ],
    },
    {
        path: '/admin',
        element: <AdminPage />,
        children: [
            { index: true, element: <AdminLoginView /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: 'dashboard', element: <AdminDashboardView /> },
                ]
            }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);

export default router;
