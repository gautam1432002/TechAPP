import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { getSiteSettings, updateSiteSettings } from '../../api/settings.api';
import { Type, AlignLeft, Calendar, MapPin, Grid, Clock, Save, Loader2 } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../../data/defaults';

export default function DashboardContentTab() {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getSiteSettings()
            .then(setSettings)
            .catch(() => {
                setSettings(DEFAULT_SITE_SETTINGS);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = {
            brandName: fd.get('brandName') as string,
            eventYear: fd.get('eventYear') as string,
            mainTitle: fd.get('mainTitle') as string,
            subtitle: fd.get('subtitle') as string,
            description: fd.get('description') as string,
            eventDate: fd.get('eventDate') as string,
            eventVenue: fd.get('eventVenue') as string,
            categoriesText: fd.get('categoriesText') as string,
            countdownDate: fd.get('countdownDate') as string,
        };
        
        try {
            const updated = await updateSiteSettings(payload);
            setSettings(updated);
            toast('Success', 'Dashboard content updated', 'success');
        } catch (err) {
            toast('Error', 'Failed to update settings', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeSettings = settings || DEFAULT_SITE_SETTINGS;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white glow-text">Landing Page Content</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Update the primary hero section text, descriptions, and countdown</p>
                </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Global Branding */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary" />
                                Navbar Brand Name
                            </label>
                            <input
                                name="brandName"
                                defaultValue={activeSettings.brandName}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary" />
                                Global Event Year
                            </label>
                            <input
                                name="eventYear"
                                defaultValue={activeSettings.eventYear}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Headers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary" />
                                Main Event Title
                            </label>
                            <input
                                name="mainTitle"
                                defaultValue={activeSettings.mainTitle}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4 text-primary" />
                                Subtitle
                            </label>
                            <input
                                name="subtitle"
                                defaultValue={activeSettings.subtitle}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-primary" />
                            Hero Description
                        </label>
                        <textarea
                            name="description"
                            defaultValue={activeSettings.description}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20 custom-scrollbar resize-none"
                        />
                    </div>

                    {/* Date/Venue */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Event Date Text
                            </label>
                            <input
                                name="eventDate"
                                defaultValue={activeSettings.eventDate}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Venue
                            </label>
                            <input
                                name="eventVenue"
                                defaultValue={activeSettings.eventVenue}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Categories/Countdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Grid className="w-4 h-4 text-primary" />
                                Categories Text
                            </label>
                            <input
                                name="categoriesText"
                                defaultValue={activeSettings.categoriesText}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Countdown Target
                            </label>
                            <input
                                name="countdownDate"
                                type="datetime-local"
                                defaultValue={activeSettings.countdownDate.substring(0, 16)}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-white/20 color-scheme-dark"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                        <button type="submit" className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-bold shadow-glow hover:shadow-glow-accent transition-all flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Landing Config
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
