import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { getPublicEvents } from '../../api/events.api';
import { useAppStore } from '../../store/appStore';
import { DEFAULT_EVENTS } from '../../data/defaults';
import EventCard from './EventCard';
import type { TEvent } from '../../types/event.types';

export default function EventsSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [events, setEvents] = useState<TEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const openEventDetailModal = useAppStore((s) => s.openEventDetailModal);
    const openRegModal = useAppStore((s) => s.openRegModal);

    useEffect(() => {
        getPublicEvents()
            .then((res) => {
                if (res && res.length > 0) {
                    setEvents(res);
                } else {
                    setEvents(DEFAULT_EVENTS);
                }
            })
            .catch(() => setEvents(DEFAULT_EVENTS))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => {
        return ['All', ...new Set(events.map((e) => e.category))];
    }, [events]);

    const filtered = useMemo(() => {
        return events.filter((ev) => {
            const matchCat = selectedCategory === 'All' || ev.category === selectedCategory;
            const matchSearch =
                ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ev.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [events, selectedCategory, searchQuery]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    return (
        <section id="events" className="py-20 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text text-white">Competition Events</h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Choose your battlefield! Six exciting tech competitions designed to challenge and showcase your skills.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-12">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-10 glass-card w-full h-12 rounded-lg bg-glass border border-glass-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat
                                        ? 'bg-gradient-primary text-white border-transparent'
                                        : 'border-glass-border text-muted-foreground hover:text-white bg-transparent'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.length === 0 ? (
                            <div className="col-span-full text-center text-muted-foreground py-10">No events found.</div>
                        ) : (
                            filtered.map((ev) => (
                                <EventCard
                                    key={ev.id}
                                    event={ev}
                                    onDetails={() => openEventDetailModal(ev.id)}
                                    onRegister={() => openRegModal(ev.id)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
