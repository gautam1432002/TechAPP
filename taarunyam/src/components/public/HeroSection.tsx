import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { getSiteSettings } from '../../api/settings.api';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaults';
import type { SiteSettings } from '../../types/settings.types';
import CountdownTimer from './CountdownTimer';

export default function HeroSection() {
    const navigate = useNavigate();
    const openRegModal = useAppStore((s) => s.openRegModal);
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

    useEffect(() => {
        getSiteSettings()
            .then((res) => {
                if (res) setSettings(res);
            })
            .catch(() => {});
    }, []);

    return (
        <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 glow-text uppercase tracking-wider text-white">
                        {settings.mainTitle}
                    </h1>

                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-1 w-16 bg-gradient-primary rounded-full" />
                        <h2 className="text-2xl md:text-3xl font-semibold text-secondary-glow">{settings.subtitle}</h2>
                        <div className="h-1 w-16 bg-gradient-primary rounded-full" />
                    </div>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: `${settings.description}<br/><span class="text-primary-glow font-medium">Where Innovation Meets Competition</span>` }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="glass-card p-6 rounded-xl">
                            <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2 text-white">Date</h3>
                            <p className="text-muted-foreground">{settings.eventDate}</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl">
                            <MapPin className="w-8 h-8 text-secondary mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2 text-white">Venue</h3>
                            <p className="text-muted-foreground">{settings.eventVenue}</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl">
                            <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-2 text-white">Categories</h3>
                            <p className="text-muted-foreground">{settings.categoriesText}</p>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold mb-8 glow-text text-white">Event Starts In</h3>
                        <CountdownTimer targetDate={settings.countdownDate} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => openRegModal()}
                            className="w-full sm:w-auto bg-gradient-primary text-white font-semibold shadow-glow hover:shadow-glow-accent transform hover:scale-105 transition-all duration-300 shine-effect h-16 rounded-xl px-10 text-lg"
                        >
                            Register Now
                        </button>
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full sm:w-auto bg-glass border border-glass-border backdrop-blur-xl text-foreground hover:bg-glass-hover hover:shadow-glow transition-all duration-300 h-16 rounded-xl px-10 text-lg"
                        >
                            Admin Login
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
