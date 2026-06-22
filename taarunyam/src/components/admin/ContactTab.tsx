import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaults';
import { getSiteSettings, updateSiteSettings } from '../../api/settings.api';
import { Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';

export default function ContactTab() {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getSiteSettings()
            .then(setSettings)
            .catch(() => setSettings(DEFAULT_SITE_SETTINGS))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const contact = {
            email: fd.get('email') as string,
            phone: fd.get('phone') as string,
            location: fd.get('location') as string,
        };
        
        try {
            const updated = await updateSiteSettings({ contact });
            setSettings(updated);
            toast('Success', 'Contact information updated', 'success');
        } catch (err) {
            toast('Error', 'Failed to update contact info', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const contactData = settings?.contact || DEFAULT_SITE_SETTINGS.contact;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white glow-text">Contact Information</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Update the contact details displayed on the landing page</p>
                </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Support Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={contactData.email}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                                placeholder="contact@taarunyam.com"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Contact Number
                            </label>
                            <input
                                name="phone"
                                defaultValue={contactData.phone}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            Physical Location
                        </label>
                        <input
                            name="location"
                            defaultValue={contactData.location}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            placeholder="University Campus, Tech City"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                        <button type="submit" className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-bold shadow-glow hover:shadow-glow-accent transition-all flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Contact Info
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
