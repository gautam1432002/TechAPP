import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, FileDown, Loader2, Edit2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_EVENTS } from '../../data/defaults';
import { exportParticipantsPDF } from '../../utils/participantReportPdf';
import type { Participant } from '../../types/participant.types';
import { getParticipants, deleteParticipant, toggleWinner } from '../../api/participants.api';

export default function ParticipantsTab() {
    const [search, setSearch] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const openCertModal = useAppStore((s) => s.openCertModal);
    const openEditModal = useAppStore((s) => s.openEditParticipantModal);
    const { toast } = useToast();
    const events = DEFAULT_EVENTS;

    const loadParticipants = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getParticipants({ pageSize: 1000 }); // Load realistically all for simple view
            setParticipants(res.results);
        } catch {
            toast('Error', 'Failed to load participants', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadParticipants();

        window.addEventListener('participantsUpdated', loadParticipants);
        return () => window.removeEventListener('participantsUpdated', loadParticipants);
    }, [loadParticipants]);

    const filtered = participants.filter(
        (p) =>
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.id || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleExportPdf = () => {
        if (participants.length === 0) {
            toast('Info', 'No participants to export', 'warning');
            return;
        }
        try {
            exportParticipantsPDF(participants, events);
            toast('Success', 'Professional PDF report generated', 'success');
        } catch {
            toast('Error', 'Failed to generate PDF', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this participant?')) {
            try {
                await deleteParticipant(id);
                setParticipants((prev) => prev.filter((p) => p.id !== id));
                toast('Success', 'Participant deleted', 'success');
            } catch {
                toast('Error', 'Failed to delete participant', 'error');
            }
        }
    };

    const handleToggleWinner = async (p: Participant) => {
        if (!p.events || p.events.length === 0) {
            toast('Warning', 'Participant is not registered for any events', 'warning');
            return;
        }
        try {
            const updated = await toggleWinner(p.id);
            setParticipants((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
            toast('Success', `Participant ${updated.isWinner ? 'marked as winner' : 'win revoked'}`, 'success');
        } catch {
            toast('Error', 'Failed to update winner status', 'error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 glass-card w-full h-10 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                </div>
                <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm">
                    <FileDown className="w-4 h-4" /> Export PDF
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center border border-white/5 shadow-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                    <p className="text-muted-foreground max-w-sm">
                        {participants.length === 0
                            ? "There are currently no participants registered in the system. Once users complete the registration, their data will appear here."
                            : "No participants match your current search criteria. Please try adjusting your filters or clearing the search."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((p) => (
                        <div key={p.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full border border-white/5 hover:border-white/10 transition-colors shadow-xl relative overflow-hidden group">
                            {/* Decorative background glow */}
                            <div className="absolute -inset-24 bg-gradient-primary opacity-0 group-hover:opacity-5 blur-2xl transition-opacity pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-4">
                                    <h4 className="font-bold text-white text-xl leading-tight truncate pr-2">{p.name || 'Unknown Participant'}</h4>
                                    {p.isWinner && (
                                        <span className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 text-[10px] px-2.5 py-1 rounded-full border border-yellow-500/30 whitespace-nowrap shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                            👑 WINNER
                                        </span>
                                    )}
                                </div>

                                {/* Detail lines */}
                                <div className="space-y-2 mb-5">
                                    <p className="text-sm text-muted-foreground flex items-center gap-3">
                                        <span className="w-12 text-xs font-semibold uppercase tracking-wider text-white/30">ID</span>
                                        <span className="font-mono text-white/80">{p.id}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-start gap-3">
                                        <span className="w-12 text-xs font-semibold uppercase tracking-wider text-white/30 pt-0.5">Email</span>
                                        <span className="break-all">{p.email || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-start gap-3">
                                        <span className="w-12 text-xs font-semibold uppercase tracking-wider text-white/30">Phone</span>
                                        <span>{p.mobile || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-3">
                                        <span className="w-12 text-xs font-semibold uppercase tracking-wider text-white/30">Inst</span>
                                        <span className="truncate text-white/80 font-medium">{p.college || 'N/A'}</span>
                                    </p>
                                    {(p.course || p.year) && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-3">
                                            <span className="w-12 text-xs font-semibold uppercase tracking-wider text-white/30">Study</span>
                                            <span>{p.course || ''} {p.year ? `• ${p.year}` : ''}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Events */}
                                <div className="mb-6">
                                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-widest font-bold">Registered Events</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {(p.events || []).map((eid) => (
                                            <span key={eid} className="text-[11px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-gray-200">
                                                {events.find((e) => e.id === eid)?.title || eid}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-white/5 flex flex-col gap-3 relative z-10">
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Admin Actions</p>

                                {/* Certificate Previews */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(p.events || []).map((eid) => {
                                        const isWin = p.isWinner && p.winnerEvent === eid;
                                        return (
                                            <button
                                                key={eid}
                                                onClick={() =>
                                                    openCertModal({
                                                        participant: p,
                                                        eventId: eid,
                                                        type: isWin ? 'winner' : 'participation',
                                                    })
                                                }
                                                className="py-2 px-2 text-[10px] uppercase tracking-wider font-bold rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors shadow-sm"
                                            >
                                                {isWin ? '🏆 Win Cert' : '📄 Base Cert'}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Admin Tools */}
                                <div className="flex gap-2 mt-1">
                                    <button
                                        onClick={() => handleToggleWinner(p)}
                                        className={`flex-1 py-2 px-3 text-[11px] uppercase tracking-wider font-bold rounded-lg border transition-all shadow-sm ${p.isWinner
                                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {p.isWinner ? 'Revoke Win' : 'Mark Winner'}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(p.id)}
                                        className="py-2 px-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors shadow-sm"
                                        title="Edit Details"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="py-2 px-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors shadow-sm"
                                        title="Delete Participant"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
