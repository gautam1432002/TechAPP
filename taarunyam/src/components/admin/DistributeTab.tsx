import { useState, useEffect } from 'react';
import {
    Send, RefreshCw, AlertCircle, Loader2, CheckCircle2, Mail,
    FileText, CheckSquare, Square, XCircle, Clock
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { getParticipants } from '../../api/participants.api';
import type { Participant } from '../../types/participant.types';
import { uploadAndSendEmail } from '../../api/email.api';
import { generateCertificateBlob } from '../../utils/certificatePdf';
import { generateQRDataUrl } from '../../utils/qrGenerator';
import { DEFAULT_EVENTS, DEFAULT_CERT_SETTINGS } from '../../data/defaults';
import ParticipationCertificate from '../certificates/ParticipationCertificate';
import WinnerCertificate from '../certificates/WinnerCertificate';

type DeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed';

export default function DistributeTab() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Email Template State
    const [emailSubject, setEmailSubject] = useState('Your TAARUNYAM 2026 Certificate');
    const [emailGreeting, setEmailGreeting] = useState('Dear Participant,');
    const [emailBody, setEmailBody] = useState('Thank you for participating in TAARUNYAM 2026. Please find your official certificate of achievement attached.');
    const [emailClosing, setEmailClosing] = useState('Best Regards,');
    const [emailSignature, setEmailSignature] = useState('The TAARUNYAM Organizing Team');

    // Selection & Delivery State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deliveryStatus, setDeliveryStatus] = useState<Record<string, DeliveryStatus>>({});
    const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

    const [isDispatching, setIsDispatching] = useState(false);
    
    // Hidden render state for Blob generation
    const [dispatchParticipant, setDispatchParticipant] = useState<Participant | null>(null);
    const [dispatchQR, setDispatchQR] = useState('');
    const [dispatchProgress, setDispatchProgress] = useState({ current: 0, total: 0 });

    const { toast } = useToast();

    const fetchParticipants = async (showRefreshSpinner = false) => {
        if (showRefreshSpinner) setIsRefreshing(true);
        try {
            const res = await getParticipants({ pageSize: 1000 });
            setParticipants(res.results);
            // Initialize status from DB truth (certificateIssued field)
            setDeliveryStatus(prev => {
                const next: Record<string, DeliveryStatus> = {};
                res.results.forEach(p => {
                    // If we already have a terminal state (sent/failed) keep it, otherwise inherit DB
                    if (prev[p.id] === 'sent' || prev[p.id] === 'failed') {
                        next[p.id] = prev[p.id];
                    } else {
                        next[p.id] = p.certificateIssued ? 'sent' : 'pending';
                    }
                });
                return next;
            });
        } catch {
            toast('Network Error', 'Failed to synchronize participant list', 'error');
        } finally {
            setIsLoading(false);
            if (showRefreshSpinner) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleAll = () => {
        const pendingOnly = participants
            .filter(p => deliveryStatus[p.id] !== 'sent' && deliveryStatus[p.id] !== 'sending')
            .map(p => p.id);
        if (selectedIds.length === pendingOnly.length && pendingOnly.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingOnly);
        }
    };

    const toggleParticipant = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleDispatch = async (targetIds: string[] = selectedIds) => {
        if (targetIds.length === 0) return;
        if (!emailSubject || !emailBody) {
            toast('Validation Error', 'Email Subject and Body cannot be empty.', 'error');
            return;
        }

        setIsDispatching(true);
        setDispatchProgress({ current: 0, total: targetIds.length });

        const newStatus = { ...deliveryStatus };
        const newErrors = { ...errorMessages };
        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < targetIds.length; i++) {
            const currentId = targetIds[i];
            const p = participants.find((x) => x.id === currentId);
            if (!p) continue;

            setDispatchProgress({ current: i + 1, total: targetIds.length });
            setDeliveryStatus(prev => ({ ...prev, [currentId]: 'sending' }));

            try {
                // 1. Prepare QR Code
                const qr = await generateQRDataUrl(p.certificateId || p.id);
                setDispatchQR(qr);
                
                // 2. Mount participant in hidden DOM
                setDispatchParticipant(p);
                
                // 3. Wait for React to flush and fonts to render
                await new Promise(resolve => setTimeout(resolve, 1000)); // FORCE FULL DOM PAINT

                // 4. Generate Blob via HTML2Canvas
                const pdfBlob = await generateCertificateBlob('certificate-print-node');

                // 5. Append to FormData
                const formData = new FormData();
                formData.append('participant_id', p.id);
                formData.append('participant_name', p.name);
                formData.append('participant_email', p.email);
                formData.append('subject', emailSubject);
                formData.append('greeting', emailGreeting);
                formData.append('body', emailBody);
                formData.append('closing', emailClosing);
                formData.append('signature', emailSignature);
                formData.append('is_winner', p.isWinner ? 'true' : 'false');
                formData.append('certificate_pdf', pdfBlob, 'certificate.pdf');

                // 6. Post to Backend
                await uploadAndSendEmail(formData);

                newStatus[currentId] = 'sent';
                sentCount++;
            } catch (err: any) {
                newStatus[currentId] = 'failed';
                newErrors[currentId] = err?.response?.data?.message || err.message || 'Blob generation or upload error';
                failedCount++;
            }
            
            setDeliveryStatus(prev => ({ ...prev, [currentId]: newStatus[currentId] }));
            setErrorMessages(prev => ({ ...prev, [currentId]: newErrors[currentId] }));
        }
        
        setDispatchParticipant(null);
        setIsDispatching(false);
        setSelectedIds([]);

        if (failedCount === 0) {
            toast('Dispatch Complete', `All ${sentCount} certificates sent successfully.`, 'success');
        } else if (sentCount === 0) {
            toast('Dispatch Failed', `All ${failedCount} deliveries failed. Check error details.`, 'error');
        } else {
            toast('Partial Success', `${sentCount} sent, ${failedCount} failed.`, 'warning');
        }
    };

    const total = participants.length;
    const sent = Object.values(deliveryStatus).filter(s => s === 'sent').length;
    const pending = total - sent;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-primary">{total}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Participants</div>
                </div>
                <div className="glass-card p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-400">{sent}</div>
                    <div className="text-sm text-muted-foreground mt-1">Certificates Sent</div>
                </div>
                <div className="glass-card p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-yellow-400">{pending}</div>
                    <div className="text-sm text-muted-foreground mt-1">Pending Delivery</div>
                </div>
            </div>

            {/* Email Template Designer */}
            <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-glass-border pb-4">
                    <Mail className="w-6 h-6 text-primary" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Email Template Designer</h3>
                        <p className="text-sm text-muted-foreground">Configure the automated email text that will accompany the PDF attachment.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Email Subject</label>
                        <input
                            type="text"
                            value={emailSubject}
                            onChange={e => setEmailSubject(e.target.value)}
                            className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Greeting Message</label>
                            <input
                                type="text"
                                value={emailGreeting}
                                onChange={e => setEmailGreeting(e.target.value)}
                                className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Closing Text</label>
                            <input
                                type="text"
                                value={emailClosing}
                                onChange={e => setEmailClosing(e.target.value)}
                                className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Main Body Text</label>
                        <textarea
                            value={emailBody}
                            onChange={e => setEmailBody(e.target.value)}
                            rows={3}
                            className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Signature</label>
                        <input
                            type="text"
                            value={emailSignature}
                            onChange={e => setEmailSignature(e.target.value)}
                            className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <p className="text-primary/90">
                            <strong>Auto-PDF:</strong> The server automatically generates the certificate PDF if it doesn't exist, then attaches it to the email.
                        </p>
                    </div>
                </div>
            </div>

            {/* Distribution Center Table */}
            <div className="glass-card rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-glass-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
                    <div>
                        <h3 className="text-lg font-bold text-white">Distribution Center</h3>
                        <p className="text-sm text-muted-foreground">Select participants to dispatch their certificates.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchParticipants(true)}
                            disabled={isRefreshing || isDispatching}
                            className="flex items-center gap-2 px-4 py-2 bg-glass border border-glass-border hover:bg-glass-hover text-white rounded-lg font-medium disabled:opacity-50 transition-colors text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => handleDispatch()}
                                disabled={isDispatching}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-primary hover:shadow-glow text-white rounded-lg font-bold disabled:opacity-50 transition-all text-sm"
                            >
                                {isDispatching ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending {dispatchProgress.current} of {dispatchProgress.total}...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send to {selectedIds.length} Selected
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {participants.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12 px-4">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No participants found in the database.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-sm font-medium text-muted-foreground bg-white/5">
                                    <th className="p-4 w-12 text-center">
                                        <button onClick={toggleAll} className="text-muted-foreground hover:text-white transition-colors p-1">
                                            {selectedIds.length > 0 && selectedIds.length === participants.filter(p => deliveryStatus[p.id] !== 'sent').length ? (
                                                <CheckSquare className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-4 font-semibold">Participant Info</th>
                                    <th className="p-4 font-semibold">Event</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {participants.map((p) => {
                                    const isSelected = selectedIds.includes(p.id);
                                    const status = deliveryStatus[p.id] || 'pending';
                                    const errorMsg = errorMessages[p.id];

                                    return (
                                        <tr
                                            key={p.id}
                                            className={`transition-colors hover:bg-white/5 ${isSelected ? 'bg-primary/5' : ''}`}
                                        >
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => toggleParticipant(p.id)}
                                                    className="text-muted-foreground hover:text-white transition-colors p-1 disabled:opacity-30"
                                                    disabled={status === 'sending' || status === 'sent'}
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-primary" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-white max-w-[300px] whitespace-normal break-words">
                                                    {p.name || 'Unknown Name'}
                                                    {p.isWinner && <span className="ml-2 text-xs text-yellow-400">👑</span>}
                                                </div>
                                                <div className="text-sm text-muted-foreground max-w-[300px] whitespace-normal break-all mt-1">
                                                    {p.email}
                                                </div>
                                                {errorMsg && (
                                                    <div className="text-xs text-red-400 mt-1 max-w-[300px] break-words">
                                                        ⚠ {errorMsg}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-white truncate max-w-[150px]">
                                                    {p.events?.[0] || 'No event'}
                                                </div>
                                                {p.isWinner ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 mt-1">
                                                        Winner
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-1">
                                                        Participant
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center items-center">
                                                    {status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-glass border border-glass-border text-muted-foreground">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                    {status === 'sending' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending
                                                        </span>
                                                    )}
                                                    {status === 'sent' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Sent ✓
                                                        </span>
                                                    )}
                                                    {status === 'failed' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                                            <XCircle className="w-3.5 h-3.5" /> Failed
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {status === 'pending' && (
                                                    <button
                                                        onClick={() => handleDispatch([p.id])}
                                                        disabled={isDispatching}
                                                        className="text-xs font-medium px-3 py-1.5 bg-glass border border-glass-border hover:bg-glass-hover text-white rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        Send
                                                    </button>
                                                )}
                                                {status === 'sent' && (
                                                    <button
                                                        onClick={() => handleDispatch([p.id])}
                                                        disabled={isDispatching}
                                                        className="text-xs font-medium px-3 py-1.5 text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
                                                    >
                                                        Resend
                                                    </button>
                                                )}
                                                {status === 'failed' && (
                                                    <button
                                                        onClick={() => handleDispatch([p.id])}
                                                        disabled={isDispatching}
                                                        className="text-xs font-bold px-3 py-1.5 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        Retry
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* Hidden render box for capturing PDFs */}
            {dispatchParticipant && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1123px', height: '794px', backgroundColor: '#ffffff', overflow: 'hidden', zIndex: -9999 }}>
                    <div id="certificate-print-node">
                        {dispatchParticipant.isWinner ? (
                            <WinnerCertificate
                                participant={dispatchParticipant}
                                event={DEFAULT_EVENTS.find(e => e.id === dispatchParticipant?.events?.[0]) || DEFAULT_EVENTS[0]}
                                certSettings={DEFAULT_CERT_SETTINGS}
                                qrDataUrl={dispatchQR}
                            />
                        ) : (
                            <ParticipationCertificate
                                participant={dispatchParticipant}
                                event={DEFAULT_EVENTS.find(e => e.id === dispatchParticipant?.events?.[0]) || DEFAULT_EVENTS[0]}
                                certSettings={DEFAULT_CERT_SETTINGS}
                                qrDataUrl={dispatchQR}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
