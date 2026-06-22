import { Calendar, Trophy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { TEvent } from '../../types/event.types';

interface Props {
    event: TEvent;
    onDetails: () => void;
    onRegister: () => void;
}

function getIcon(name: string) {
    const iconName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon || LucideIcons.Code;
}

/** Normalize prizes to always be a string array, regardless of backend format. */
function normalizePrizes(prizes: unknown): string[] {
    if (Array.isArray(prizes)) return prizes.map(String);
    if (prizes && typeof prizes === 'object') return Object.values(prizes as Record<string, unknown>).map(String);
    if (typeof prizes === 'string') return prizes ? [prizes] : [];
    return [];
}

export default function EventCard({ event, onDetails, onRegister }: Props) {
    const Icon = getIcon(event.icon || event.title.charAt(0).toLowerCase());
    const prizes = normalizePrizes(event.prizes);

    return (
        <div className="glass-card group hover:scale-[1.02] transition-all duration-300 rounded-xl overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />

            <div className="p-6 relative z-10 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                        {event.category}
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-glow transition-colors text-white">
                    {event.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {event.eventDate ? new Date(event.eventDate).toDateString() : (event.event_date ? new Date(event.event_date).toDateString() : '—')}
                    </div>
                    {prizes.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-winner" />
                            <span className="text-winner">{prizes[0]}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 pt-0 relative z-10 flex gap-2">
                <button onClick={onDetails} className="flex-1 border border-glass-border bg-glass hover:bg-glass-hover text-white py-2 rounded-lg text-sm">
                    Details
                </button>
                <button onClick={onRegister} className="flex-1 bg-gradient-primary text-white font-medium py-2 rounded-lg text-sm shadow-glow hover:shadow-glow-accent">
                    Register
                </button>
            </div>
        </div>
    );
}
