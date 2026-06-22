import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getSiteSettings } from '../../api/settings.api';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaults';
import type { SiteSettings } from '../../types/settings.types';

export default function ContactSection() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

    useEffect(() => {
        getSiteSettings()
            .then((res) => {
                if (res) setSettings(res);
            })
            .catch(() => {});
    }, []);

    return (
        <section id="contact" className="py-20 bg-background-secondary">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text text-white">Contact Us</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Get in touch with us for any queries</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-6 rounded-xl text-center">
                        <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-white">Email</h3>
                        <p className="text-muted-foreground">{settings.contact.email}</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <Phone className="w-8 h-8 text-secondary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-white">Phone</h3>
                        <p className="text-muted-foreground">{settings.contact.phone}</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <MapPin className="w-8 h-8 text-accent mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-white">Location</h3>
                        <p className="text-muted-foreground">{settings.contact.location}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
