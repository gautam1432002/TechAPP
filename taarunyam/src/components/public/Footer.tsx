import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { getSiteSettings } from '../../api/settings.api';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaults';
import type { SiteSettings } from '../../types/settings.types';

export default function Footer() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

    useEffect(() => {
        getSiteSettings()
            .then((res) => {
                if (res) setSettings(res);
            })
            .catch(() => {});
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="relative py-20 border-t border-glass-border">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold glow-text mb-4 text-white">{settings.brandName}</h3>
                        <p className="text-muted-foreground mb-4">{settings.footer.description}</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-primary"><Facebook /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Twitter /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Instagram /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><button onClick={() => scrollTo('hero')} className="text-muted-foreground hover:text-primary">Home</button></li>
                            <li><button onClick={() => scrollTo('events')} className="text-muted-foreground hover:text-primary">Events</button></li>
                            <li><button onClick={() => scrollTo('certificates')} className="text-muted-foreground hover:text-primary">Certificates</button></li>
                            <li><button onClick={() => scrollTo('contact')} className="text-muted-foreground hover:text-primary">Contact</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">Additional Info</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{settings.footer.extraInfo}</p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-glass-border text-center">
                    <p className="text-muted-foreground text-sm">{settings.footer.copyright}</p>
                </div>
            </div>
        </footer>
    );
}
