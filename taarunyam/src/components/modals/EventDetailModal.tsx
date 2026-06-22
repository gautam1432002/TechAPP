import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { DEFAULT_EVENTS } from '../../data/defaults';

function getIcon(name: string) {
    const iconName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon || LucideIcons.Code;
}

export default function EventDetailModal() {
    const isOpen = useAppStore((s) => s.isEventDetailModalOpen);
    const selectedEventId = useAppStore((s) => s.selectedEventId);
    const closeModal = useAppStore((s) => s.closeEventDetailModal);
    const openRegModal = useAppStore((s) => s.openRegModal);
    const events = DEFAULT_EVENTS;

    if (!isOpen || !selectedEventId) return null;

    const ev = events.find((e) => e.id === selectedEventId);
    if (!ev) return null;

    const Icon = getIcon(ev.icon || ev.title.charAt(0).toLowerCase());

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeModal}>
            <div className="glass-card w-full max-w-2xl rounded-xl p-6 relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute right-4 top-4 text-muted-foreground hover:text-white">
                    <X />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-primary/20 border border-primary/30">
                        <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white glow-text">{ev.title}</h3>
                        <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded border border-secondary/30">
                            {ev.category}
                        </span>
                    </div>
                </div>

                <p className="text-gray-300 mb-6">{ev.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass-card p-3 rounded text-sm text-gray-300">
                        <div className="font-bold text-white mb-1">Prizes</div>
                        {Array.isArray(ev.prizes) ? ev.prizes.join(', ') : ev.prizes}
                    </div>
                    <div className="glass-card p-3 rounded text-sm text-gray-300">
                        <div className="font-bold text-white mb-1">Participants</div>
                        Max {ev.maxParticipants || 'Unlimited'}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={closeModal} className="px-4 py-2 border border-glass-border rounded-lg text-white hover:bg-white/10">
                        Close
                    </button>
                    <button
                        onClick={() => { closeModal(); openRegModal(ev.id); }}
                        className="px-4 py-2 bg-gradient-primary rounded-lg text-white font-medium"
                    >
                        Register Now
                    </button>
                </div>
            </div>
        </div>
    );
}
