import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_CERT_SETTINGS, MOCK_PARTICIPANTS, DEFAULT_EVENTS } from '../../data/defaults';
import type { CertSettings } from '../../types/certificate.types';
import ParticipationCertificate from '../certificates/ParticipationCertificate';
import WinnerCertificate from '../certificates/WinnerCertificate';

export default function CertificatesTab() {
    const [settings, setSettings] = useState<CertSettings>(() => {
        const saved = localStorage.getItem('taarunyam_cert_settings');
        return saved ? JSON.parse(saved) : DEFAULT_CERT_SETTINGS;
    });
    const [activeTab, setActiveTab] = useState<'participation' | 'winner'>('participation');
    const { toast } = useToast();

    useEffect(() => {
        localStorage.setItem('taarunyam_cert_settings', JSON.stringify(settings));
    }, [settings]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, authority?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            if (authority) {
                setSettings(prev => ({
                    ...prev,
                    authorities: { ...prev.authorities, [authority]: { ...(prev.authorities as any)[authority], signature: base64 } }
                }));
            } else {
                setSettings(prev => ({ ...prev, [field]: base64 }));
            }
            toast('Success', 'Image uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    };

    const updateField = (category: string, field: string, value: string) => {
        setSettings(prev => {
            if (category === 'general') return { ...prev, [field]: value };
            if (category === 'participation' || category === 'winner') {
                return { ...prev, [category]: { ...(prev as any)[category], [field]: value } };
            }
            if (['coordinator', 'hod', 'principal'].includes(category)) {
                return { ...prev, authorities: { ...prev.authorities, [category]: { ...(prev.authorities as any)[category], [field]: value } } };
            }
            return prev;
        });
    };

    const handleInputChange = (category: string, field: string, value: string) => {
        updateField(category, field, value);
    };

    const mockParticipant = MOCK_PARTICIPANTS[0];
    const mockEvent = DEFAULT_EVENTS[0];

    const isParticipation = activeTab === 'participation';
    const currentCert = isParticipation ? settings.participation : settings.winner;

    // ── Responsive preview scaling ──
    const CERT_W = 1123;
    const CERT_H = 794;
    const previewRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(0.45);

    const recalcScale = useCallback(() => {
        if (previewRef.current) {
            const containerW = previewRef.current.clientWidth - 32; // 16px padding each side
            const s = Math.min(containerW / CERT_W, 0.65); // cap at 0.65
            setPreviewScale(Math.max(s, 0.3)); // floor at 0.3
        }
    }, []);

    useEffect(() => {
        recalcScale();
        const ro = new ResizeObserver(recalcScale);
        if (previewRef.current) ro.observe(previewRef.current);
        return () => ro.disconnect();
    }, [recalcScale]);

    const scaledW = CERT_W * previewScale;
    const scaledH = CERT_H * previewScale;

    return (
        <div className="flex flex-col gap-6">
            {/* Tab Selector */}
            <div className="glass-card p-3 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('participation')}
                        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${isParticipation ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        📜 Participation Certificate
                    </button>
                    <button
                        onClick={() => setActiveTab('winner')}
                        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${!isParticipation ? 'bg-[#c19b2e] text-[#0a1d37] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        🏆 Achievements – Winner
                    </button>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Auto-Saving</span>
                </div>
            </div>

            {/* Two-Column Layout: Form Editor + Visual Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">

                {/* LEFT: Form-Based Editor */}
                <div className="glass-card p-5 rounded-xl space-y-4 overflow-y-auto max-h-[700px]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
                        {isParticipation ? '📜 Participation Settings' : '🏆 Achievement Settings'}
                    </h3>

                    {/* Global Settings */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Global Settings</p>

                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Institute Logo (PNG)</label>
                            <input type="file" accept="image/png" onChange={(e) => handleImageUpload(e, 'organizerLogo')}
                                className="w-full mt-1 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Institute Name</label>
                            <input value={settings.organizerName}
                                onChange={(e) => handleInputChange('general', 'organizerName', e.target.value)}
                                className="w-full glass-input mt-1 text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Event Name</label>
                            <input value={settings.eventName}
                                onChange={(e) => handleInputChange('general', 'eventName', e.target.value)}
                                className="w-full glass-input mt-1 text-sm" />
                        </div>
                    </div>

                    {/* Certificate-Specific Settings */}
                    <div className="space-y-3 border-t border-white/10 pt-3">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Certificate Content</p>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Title</label>
                            <input value={currentCert.title}
                                onChange={(e) => handleInputChange(activeTab, 'title', e.target.value)}
                                className="w-full glass-input mt-1 text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                Main Text <span className="text-amber-400/60 normal-case">({'{name}'}, {'{event}'}, {'{position}'})</span>
                            </label>
                            <textarea value={currentCert.mainText}
                                onChange={(e) => handleInputChange(activeTab, 'mainText', e.target.value)}
                                rows={3} className="w-full glass-input mt-1 text-sm" />
                        </div>
                    </div>

                    {/* Authority Signatures */}
                    <div className="space-y-3 border-t border-white/10 pt-3">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Authorities & Signatures</p>

                        {(['coordinator', 'hod', 'principal'] as const).map((key) => (
                            <div key={key} className="bg-white/5 p-3 rounded-lg space-y-2">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                    {key === 'coordinator' ? 'Coordinator' : key === 'hod' ? 'Head of Department' : 'Principal'}
                                </p>
                                <input value={settings.authorities[key].name}
                                    onChange={(e) => handleInputChange(key, 'name', e.target.value)}
                                    placeholder="Name" className="w-full glass-input text-sm" />
                                <input value={settings.authorities[key].title}
                                    onChange={(e) => handleInputChange(key, 'title', e.target.value)}
                                    placeholder="Title" className="w-full glass-input text-sm" />
                                <div>
                                    <label className="text-[9px] text-muted-foreground uppercase font-bold">Signature PNG</label>
                                    <input type="file" accept="image/png" onChange={(e) => handleImageUpload(e, '', key)}
                                        className="w-full mt-0.5 text-xs text-slate-400 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Visual Preview */}
                <div ref={previewRef} className="glass-card p-4 rounded-2xl overflow-auto flex flex-col items-center justify-start bg-slate-950/20 min-h-[500px]">
                    <div className="mb-3 text-center">
                        <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">Live Preview</h2>
                        <p className="text-[9px] text-blue-400/50 font-medium">Click any text on the certificate to edit directly</p>
                    </div>

                    {/* Wrapper reserves exact scaled pixel space */}
                    <div className="mx-auto relative" style={{ width: `${scaledW}px`, height: `${scaledH}px` }}>
                        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${previewScale})` }}>
                            <div className="shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-white/5">
                                {isParticipation ? (
                                    <ParticipationCertificate
                                        participant={mockParticipant}
                                        event={mockEvent}
                                        certSettings={settings}
                                        qrDataUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PREVIEW"
                                        isEditable={true}
                                        onFieldUpdate={updateField}
                                    />
                                ) : (
                                    <WinnerCertificate
                                        participant={mockParticipant}
                                        event={mockEvent}
                                        certSettings={settings}
                                        qrDataUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PREVIEW"
                                        isEditable={true}
                                        onFieldUpdate={updateField}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Helper Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-3 rounded-xl border-l-4 border-blue-500">
                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-0.5">Editing</p>
                    <p className="text-[11px] text-white/80 leading-relaxed">Use the form panel <b>or</b> click text on the preview to edit. Both sync in real time.</p>
                </div>
                <div className="glass-card p-3 rounded-xl border-l-4 border-amber-500">
                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-0.5">Placeholders</p>
                    <p className="text-[11px] text-white/80 leading-relaxed"><span className="text-amber-400">{"{name}"}</span>, <span className="text-amber-400">{"{event}"}</span>, <span className="text-amber-400">{"{position}"}</span> are replaced with real data during generation.</p>
                </div>
                <div className="glass-card p-3 rounded-xl border-l-4 border-white/20">
                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-0.5">Images</p>
                    <p className="text-[11px] text-white/80 leading-relaxed">Upload transparent <b>PNG</b> files for logos and signatures.</p>
                </div>
            </div>
        </div>
    );
}
