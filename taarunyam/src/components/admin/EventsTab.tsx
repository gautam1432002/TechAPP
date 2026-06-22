import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from '../../api/events.api';
import type { TEvent, EventPayload } from '../../types/event.types';

const eventSchema = z.object({
    title: z.string().min(3, 'Title is too short').max(255, 'Title is too long'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(10, 'Description is too short').max(1000, 'Description is too long'),
    icon: z.string().min(1, 'Icon name is required'),
    maxParticipants: z.coerce.number().min(1, 'At least 1 participant'),
    eventDate: z.string().min(1, 'Date is required'),
    prizes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

function getIcon(name: string) {
    const iconName = name
        ? name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        : 'Code';
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon || LucideIcons.Code;
}

const CATEGORY_OPTIONS = [
    'Programming', 'Knowledge', 'Innovation', 'Web Development',
    'Problem Solving', 'Artificial Intelligence', 'Robotics', 'Design', 'Other',
];

export default function EventsTab() {
    const [events, setEvents] = useState<TEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [editing, setEditing] = useState<TEvent | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
    });

    const [search, setSearch] = useState('');

    const loadEvents = async (showSpinner = true) => {
        if (showSpinner) setIsRefreshing(true);
        try {
            const data = await getAdminEvents();
            setEvents(data);
        } catch {
            toast('Error', 'Failed to load events', 'error');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = events.filter(
        (e) =>
            (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (e.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const openEditor = (ev?: TEvent) => {
        setEditing(ev || null);
        reset({
            title: ev?.title || '',
            category: ev?.category || 'Programming',
            description: ev?.description || '',
            icon: ev?.icon || 'code',
            maxParticipants: ev?.maxParticipants ?? ev?.capacity ?? 50,
            eventDate: ev?.eventDate ? new Date(ev.eventDate).toISOString().substring(0, 16) : '',
            prizes: Array.isArray(ev?.prizes) ? ev?.prizes.join(', ') : '',
        });
        setShowEditor(true);
    };

    const closeEditor = () => {
        setShowEditor(false);
        setEditing(null);
    };

    const onSubmit = async (data: EventFormData) => {
        const prizesArr = data.prizes ? data.prizes.split(',').map(s => s.trim()).filter(Boolean) : [];

        const payload: EventPayload = {
            title: data.title,
            category: data.category,
            description: data.description,
            icon: data.icon,
            maxParticipants: data.maxParticipants,
            eventDate: data.eventDate,
            prizes: prizesArr,
            isActive: true,
        };

        setIsSaving(true);
        try {
            if (editing) {
                const updated = await updateEvent(editing.id, payload);
                setEvents(prev => prev.map(ev => ev.id === editing.id ? updated : ev));
                toast('Success', `Event "${payload.title}" updated`, 'success');
            } else {
                const created = await createEvent(payload);
                setEvents(prev => [...prev, created]);
                toast('Success', `Event "${payload.title}" created`, 'success');
            }
            closeEditor();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to save event';
            toast('Error', msg, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete event "${title}"? This cannot be undone.`)) return;
        try {
            await deleteEvent(id);
            setEvents(prev => prev.filter(e => e.id !== id));
            toast('Deleted', `Event "${title}" removed`, 'success');
        } catch {
            toast('Error', 'Failed to delete event', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 w-full">
                    <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by title or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 glass-card w-full h-10 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => loadEvents()}
                        disabled={isRefreshing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-glass border border-glass-border hover:bg-glass-hover text-white rounded-lg text-sm disabled:opacity-50 transition-colors h-10"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => openEditor()}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium h-10"
                    >
                        <Plus className="w-4 h-4" /> Add Event
                    </button>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center border border-white/5 shadow-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Events Configured</h3>
                    <p className="text-muted-foreground max-w-sm">
                        No events in the database. Click "Add Event" to create the first one.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center border border-white/5 shadow-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <LucideIcons.Search className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Matches Found</h3>
                    <p className="text-muted-foreground max-w-sm">
                        No events match your search "{search}".
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((ev) => {
                        const Icon = getIcon(ev.icon || 'code');
                        const prizes = Array.isArray(ev.prizes) ? ev.prizes : [];
                        return (
                            <div key={ev.id} className="glass-card p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex-1 flex items-start gap-4">
                                    <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-white">{ev.title}</h4>
                                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                                                {ev.category || 'Other'}
                                            </span>
                                            {!ev.isActive && (
                                                <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                            {' '}&bull; {ev.maxParticipants || ev.capacity || 0} seats
                                            {prizes.length > 0 && ` • ${prizes[0]}`}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{ev.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => openEditor(ev)}
                                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm rounded flex items-center gap-1 transition-colors"
                                    >
                                        <LucideIcons.Edit className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ev.id, ev.title)}
                                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm rounded flex items-center gap-1 transition-colors"
                                    >
                                        <LucideIcons.Trash className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Editor Modal */}
            {showEditor && (
                <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeEditor}>
                    <div
                        className="glass-card w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeEditor}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-1">{editing ? 'Edit Event' : 'Add New Event'}</h3>
                        <p className="text-sm text-muted-foreground mb-5">Changes are saved to the database and reflected immediately on the homepage.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Event Title *</label>
                                <input
                                    {...register('title')}
                                    disabled={isSaving}
                                    placeholder="e.g. Code Rush"
                                    className="w-full glass-input disabled:opacity-50"
                                />
                                {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
                                    <select
                                        {...register('category')}
                                        disabled={isSaving}
                                        className="w-full glass-select disabled:opacity-50"
                                    >
                                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.category && <p className="text-red-400 text-[10px] mt-1">{errors.category.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Icon (Lucide name)</label>
                                    <input
                                        {...register('icon')}
                                        disabled={isSaving}
                                        placeholder="code, brain, zap..."
                                        className="glass-input disabled:opacity-50"
                                    />
                                    {errors.icon && <p className="text-red-400 text-[10px] mt-1">{errors.icon.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Description *</label>
                                <textarea
                                    {...register('description')}
                                    disabled={isSaving}
                                    placeholder="Event description..."
                                    rows={3}
                                    className="w-full glass-input resize-none disabled:opacity-50"
                                />
                                {errors.description && <p className="text-red-400 text-[10px] mt-1">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Max Participants</label>
                                    <input
                                        {...register('maxParticipants')}
                                        disabled={isSaving}
                                        type="number"
                                        min="1"
                                        className="glass-input disabled:opacity-50"
                                    />
                                    {errors.maxParticipants && <p className="text-red-400 text-[10px] mt-1">{errors.maxParticipants.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Event Date *</label>
                                    <input
                                        {...register('eventDate')}
                                        disabled={isSaving}
                                        type="datetime-local"
                                        className="w-full glass-input disabled:opacity-50"
                                    />
                                    {errors.eventDate && <p className="text-red-400 text-[10px] mt-1">{errors.eventDate.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Prizes (comma-separated)</label>
                                <input
                                    {...register('prizes')}
                                    disabled={isSaving}
                                    placeholder="₹10,000, ₹5,000, ₹2,500"
                                    className="w-full glass-input disabled:opacity-50"
                                />
                                {errors.prizes && <p className="text-red-400 text-[10px] mt-1">{errors.prizes.message}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={closeEditor}
                                    className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-gradient-primary text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isSaving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
