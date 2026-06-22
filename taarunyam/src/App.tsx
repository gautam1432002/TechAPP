import { Outlet } from 'react-router-dom';
import ParticleBackground from './components/public/ParticleBackground';
import Navbar from './components/public/Navbar';
import ToastContainer from './components/ToastContainer';
import EventDetailModal from './components/modals/EventDetailModal';
import RegistrationModal from './components/modals/RegistrationModal';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background text-foreground font-poppins relative">
                <ParticleBackground />
                <Navbar />
                <main className="relative z-10">
                    <Outlet />
                </main>

                {/* Global modals */}
                <EventDetailModal />
                <RegistrationModal />
                <ToastContainer />
            </div>
        </ErrorBoundary>
    );
}
