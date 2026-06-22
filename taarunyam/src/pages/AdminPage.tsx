import { Outlet } from 'react-router-dom';
import ParticleBackground from '../components/public/ParticleBackground';
import ToastContainer from '../components/ToastContainer';

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-poppins relative">
            <ParticleBackground />

            <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

                <div className="relative w-full max-w-6xl glass-card rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl">
                    <Outlet />
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}
