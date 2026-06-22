import { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { BarChart2, PieChart, TrendingUp, Users, Loader2, Trophy } from 'lucide-react';
import { getParticipants } from '../../api/participants.api';
import { getAdminStats } from '../../api/analytics.api';
import { getAdminEvents } from '../../api/events.api';
import { useToast } from '../../hooks/useToast';
import type { Participant } from '../../types/participant.types';
import type { AdminStats } from '../../types/api.types';
import type { TEvent } from '../../types/event.types';

// Chart colour palette
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#34d399'];

export default function AnalyticsTab() {
    const [events, setEvents] = useState<TEvent[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            getAdminStats(),
            getParticipants({ pageSize: 1000 }),
            getAdminEvents(),
        ]).then(([statsRes, partRes, eventsRes]) => {
            setStats(statsRes);
            setParticipants(partRes.results);
            setEvents(eventsRes);
        }).catch((err) => {
            console.error(err);
            setError(true);
            toast('Error', 'Failed to load analytics data', 'error');
        }).finally(() => setIsLoading(false));
    }, [toast]);

    const statsSummary = useMemo(() => {
        const validParticipants = participants.filter(p => p.events && p.events.length > 0);
        return {
            totalEvents: stats?.totalEvents ?? events.length,
            totalParticipants: stats?.totalParticipants ?? participants.length,
            totalWinners: stats?.totalWinners ?? participants.filter(p => p.isWinner).length,
            uniqueColleges: stats?.uniqueColleges ?? new Set(participants.map(p => p.college)).size,
            avgEventsPerParticipant: validParticipants.length > 0
                ? (validParticipants.reduce((sum, p) => sum + p.events.length, 0) / validParticipants.length).toFixed(1)
                : '0',
        };
    }, [stats, participants, events]);

    // Build chart data — participants per event
    const eventChartData = useMemo(() => {
        return events.map((ev) => {
            const count = participants.filter(p => (p.events || []).includes(ev.id)).length;
            const capacity = ev.maxParticipants || ev.capacity || 0;
            return {
                name: ev.title.length > 12 ? ev.title.substring(0, 12) + '…' : ev.title,
                fullName: ev.title,
                participants: count,
                capacity: capacity || undefined,
                fillPct: capacity ? Math.min((count / capacity) * 100, 100) : null,
            };
        });
    }, [events, participants]);

    // Category distribution
    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        events.forEach(e => {
            const cat = e.category || 'Other';
            map[cat] = (map[cat] || 0) + 1;
        });
        return Object.entries(map).map(([name, count]) => ({ name, count }));
    }, [events]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="glass-card p-12 rounded-xl text-center">
                <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-white mb-2">Analytics Unavailable</h3>
                <p className="text-muted-foreground">We couldn't load the real-time statistics. Please check your connection.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <Users className="w-6 h-6 text-primary" />, value: statsSummary.totalParticipants, label: 'Participants' },
                    { icon: <BarChart2 className="w-6 h-6 text-secondary" />, value: statsSummary.totalEvents, label: 'Events' },
                    { icon: <Trophy className="w-6 h-6 text-yellow-400" />, value: statsSummary.totalWinners, label: 'Winners' },
                    { icon: <TrendingUp className="w-6 h-6 text-accent" />, value: statsSummary.uniqueColleges, label: 'Colleges' },
                ].map(card => (
                    <div key={card.label} className="glass-card p-4 rounded-xl text-center">
                        <div className="flex justify-center mb-2">{card.icon}</div>
                        <div className="text-3xl font-bold text-white">{card.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Participation Bar Chart (Recharts) */}
            {eventChartData.length > 0 && (
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-1">Participants per Event</h3>
                    <p className="text-sm text-muted-foreground mb-6">Live count from database registrations</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={eventChartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                formatter={(value: number, _name: string, props: any) => [
                                    `${value} participant${value !== 1 ? 's' : ''}`,
                                    props.payload.fullName,
                                ]}
                                labelFormatter={() => ''}
                            />
                            <Bar dataKey="participants" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                {eventChartData.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Capacity fill bars */}
            {eventChartData.some(e => e.capacity) && (
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Capacity Utilisation</h3>
                    <div className="space-y-3">
                        {eventChartData.filter(e => e.capacity).map((ev, i) => (
                            <div key={ev.fullName} className="flex items-center gap-4">
                                <div className="w-36 text-sm text-white truncate">{ev.fullName}</div>
                                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${ev.fillPct ?? 0}%`,
                                            background: CHART_COLORS[i % CHART_COLORS.length],
                                            opacity: 0.8,
                                        }}
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground w-20 text-right">
                                    {ev.participants} / {ev.capacity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom row: Category + Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" /> Category Distribution
                    </h3>
                    {categoryData.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No events yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {categoryData.map((cat, i) => (
                                <div key={cat.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                        <span className="text-muted-foreground">{cat.name}</span>
                                    </div>
                                    <span className="text-white font-medium">{cat.count} event{cat.count !== 1 ? 's' : ''}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg. Events / Participant</span>
                            <span className="text-white font-medium">{statsSummary.avgEventsPerParticipant}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Prizes (est.)</span>
                            <span className="text-yellow-400 font-medium">
                                {events.reduce((sum, e) => {
                                    const firstPrize = Array.isArray(e.prizes) ? e.prizes[0] : '';
                                    const amount = parseInt((firstPrize || '').replace(/[^0-9]/g, '')) || 0;
                                    return sum + amount;
                                }, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Seat Capacity</span>
                            <span className="text-white font-medium">
                                {events.reduce((sum, e) => sum + (e.maxParticipants || e.capacity || 0), 0)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Winner Rate</span>
                            <span className="text-white font-medium">
                                {statsSummary.totalParticipants > 0
                                    ? `${((statsSummary.totalWinners / statsSummary.totalParticipants) * 100).toFixed(1)}%`
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
