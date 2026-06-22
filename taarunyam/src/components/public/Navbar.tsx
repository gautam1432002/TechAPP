import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { getSiteSettings } from '../../api/settings.api';
import type { SiteSettings } from '../../types/settings.types';

export default function Navbar() {
    const scrolled = useScrollHeader();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const openRegModal = useAppStore((s) => s.openRegModal);

    useEffect(() => {
        getSiteSettings().then(setSettings).catch(console.error);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                scrolled
                    ? 'backdrop-blur-xl bg-background/80 border-b border-glass-border'
                    : 'bg-transparent'
            )}
        >
            <div className="container mx-auto px-6 py-4">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold glow-text text-white">{settings?.brandName || 'TAARUNYAM'}</h1>
                        <span className="text-sm text-muted-foreground">{settings?.eventYear || ''}</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <button onClick={() => scrollTo('hero')} className="text-foreground hover:text-primary transition-colors">Home</button>
                        <button onClick={() => scrollTo('events')} className="text-foreground hover:text-primary transition-colors">Events</button>
                        <button onClick={() => scrollTo('certificates')} className="text-foreground hover:text-primary transition-colors">Certificates</button>
                        <button
                            onClick={() => openRegModal()}
                            className="bg-gradient-primary text-white font-semibold shadow-glow hover:shadow-glow-accent transform hover:scale-105 transition-all duration-300 px-6 py-2 rounded-lg text-sm shine-effect"
                        >
                            Register Now
                        </button>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X /> : <Menu />}
                    </button>
                </nav>

                {mobileOpen && (
                    <div className="md:hidden mt-4 p-4 bg-glass backdrop-blur-xl rounded-lg border border-glass-border">
                        <div className="flex flex-col space-y-4">
                            <button onClick={() => scrollTo('hero')} className="text-left text-foreground hover:text-primary">Home</button>
                            <button onClick={() => scrollTo('events')} className="text-left text-foreground hover:text-primary">Events</button>
                            <button onClick={() => scrollTo('certificates')} className="text-left text-foreground hover:text-primary">Certificates</button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
