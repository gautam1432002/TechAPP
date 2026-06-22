import type { Participant } from '../../types/participant.types';
import type { TEvent } from '../../types/event.types';
import type { CertSettings } from '../../types/certificate.types';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
    participant: Participant;
    event: TEvent;
    certSettings: CertSettings;
    qrDataUrl: string;
    isEditable?: boolean;
    onFieldUpdate?: (category: string, field: string, value: string) => void;
}

export default function ParticipationCertificate({
    participant: p,
    event: ev,
    certSettings: s,
    qrDataUrl,
    isEditable,
    onFieldUpdate
}: Props) {
    const cert = s.participation;
    const auth = s.authorities;

    const renderedMainText = cert.mainText
        .replace('{name}', (p.name || '').toUpperCase())
        .replace('{event}', ev.title)
        .replace('{eventName}', s.eventName);

    const edit = (category: string, field: string, value: string) => {
        if (isEditable && onFieldUpdate) onFieldUpdate(category, field, value);
    };

    const E = ({ value, onSave, className, tag: Tag = 'p' }: any) => {
        if (!isEditable) return <Tag className={className}>{value}</Tag>;
        return (
            <Tag
                contentEditable
                suppressContentEditableWarning
                onBlur={(e: any) => onSave(e.currentTarget.textContent || '')}
                className={`${className} outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-slate-50 rounded cursor-text`}
                style={{ overflowWrap: 'break-word', maxWidth: '100%' }}
            >
                {value}
            </Tag>
        );
    };

    return (
        <div id="certificate-print-node" className="w-[1123px] h-[794px] bg-white relative overflow-hidden flex flex-col" style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}>

            {/* ── Decorative Layer ── */}
            <div className="absolute inset-4 border-2 border-[#1e3a8a]/80 pointer-events-none z-0 rounded" />
            <div className="absolute inset-6 border border-[#3b82f6]/40 pointer-events-none z-0 rounded" />

            <svg className="absolute top-0 left-0 w-[400px] h-[300px] opacity-[0.04] pointer-events-none z-0" viewBox="0 0 400 300">
                <ellipse cx="0" cy="0" rx="350" ry="250" fill="#1e3a8a" />
                <ellipse cx="40" cy="20" rx="250" ry="180" fill="#3b82f6" />
            </svg>
            <svg className="absolute bottom-0 right-0 w-[400px] h-[300px] opacity-[0.04] pointer-events-none z-0" viewBox="0 0 400 300">
                <ellipse cx="400" cy="300" rx="350" ry="250" fill="#1e3a8a" />
                <ellipse cx="360" cy="280" rx="250" ry="180" fill="#3b82f6" />
            </svg>

            {/* ── Refined Left Vertical Ribbon ── */}
            <div className="absolute top-0 left-16 w-14 h-48 bg-gradient-to-b from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] shadow-[2px_10px_20px_rgba(0,0,0,0.2)] z-10 flex flex-col items-center pt-8">
                {/* Ribbon folding effect at top */}
                <div className="absolute top-0 -left-2 w-2 h-4 bg-[#0f172a] clip-triangle-left" />
                <div className="absolute top-0 -right-2 w-2 h-4 bg-[#0f172a] clip-triangle-right" />

                {/* Decorative Star inside ribbon */}
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center mt-auto mb-4 bg-white/10 backdrop-blur-sm shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow-md">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                    </svg>
                </div>
                {/* Forked bottom */}
                <svg className="absolute -bottom-6 left-0 w-14 h-8 text-[#3b82f6] drop-shadow-xl" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="0,0 100,0 100,100 50,40 0,100" fill="currentColor" />
                </svg>
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-10 flex flex-col items-center text-center flex-1 px-20 pt-10 pb-12 ml-4">

                {/* Logo */}
                <div className="flex-shrink-0 mb-2 h-20 flex items-center justify-center">
                    {s.organizerLogo ? (
                        <img src={s.organizerLogo} alt="Logo" className="max-h-20 object-contain drop-shadow-sm" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-50 border-2 border-dashed border-[#1e3a8a]/30 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase leading-tight text-center">LOGO</div>
                    )}
                </div>

                {/* Institute Name */}
                <div className="flex-shrink-0 mb-1">
                    <E value={s.organizerName} onSave={(v: string) => edit('general', 'organizerName', v)}
                        className="text-xl font-bold tracking-[0.3em] text-[#1e3a8a] uppercase" />
                </div>

                {/* Event Name */}
                <div className="flex-shrink-0 mb-3 w-full max-w-4xl relative flex items-center justify-center">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[28%] h-[1px] bg-gradient-to-r from-transparent to-[#3b82f6]/40" />
                    <E value={s.eventName} onSave={(v: string) => edit('general', 'eventName', v)}
                        className="text-3xl font-black text-slate-700 tracking-[0.2em] uppercase leading-none px-6 text-center" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[28%] h-[1px] bg-gradient-to-l from-transparent to-[#3b82f6]/40" />
                </div>

                {/* Certificate Title */}
                <div className="flex-shrink-0 mb-3 relative flex items-center justify-center">
                    <div className="absolute -inset-y-1 -inset-x-8 bg-[#3b82f6]/8 blur-xl rounded-full mix-blend-multiply" />
                    <E value={cert.title} onSave={(v: string) => edit('participation', 'title', v)}
                        className="relative z-10 text-6xl font-extrabold text-[#1e3a8a] uppercase tracking-tight drop-shadow-sm leading-none pt-2 text-center" />
                </div>

                {/* Participant Name */}
                <div className="flex-shrink-0 mb-4 mt-1 flex flex-col items-center">
                    <div className="inline-block border-b-[3px] border-[#3b82f6]/30 px-16 pb-2">
                        <h3 className="text-5xl font-black text-[#2563eb] uppercase leading-none text-center">
                            {(p.name || 'PARTICIPANT NAME').toUpperCase()}
                        </h3>
                    </div>
                </div>

                {/* Main Text */}
                <div className="flex-shrink-0 max-w-4xl mb-3" style={{ overflowWrap: 'break-word' }}>
                    <E value={isEditable ? cert.mainText : renderedMainText}
                        onSave={(v: string) => edit('participation', 'mainText', v)}
                        className="text-xl text-slate-600 leading-relaxed font-medium" />
                </div>

                {/* College */}
                <p className="flex-shrink-0 text-base text-slate-400 italic mb-3">
                    Representing <span className="text-slate-700 font-bold not-italic">{(p.college || 'INSTITUTION').toUpperCase()}</span>
                </p>

                {/* QR Code + Certificate ID — CENTERED */}
                <div className="flex-shrink-0 flex items-center justify-center gap-4 mb-0">
                    {qrDataUrl && (
                        <div className="bg-white p-1 border-2 border-[#1e3a8a]/40 shadow-sm rounded-md w-16 h-16 flex items-center justify-center">
                            <QRCodeSVG value={qrDataUrl} size={56} level="H" fgColor="#1e3a5f" />
                        </div>
                    )}
                    <div className="text-left font-mono leading-tight">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">ID: {p.id}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">CERT: {p.certificateId?.substring(0, 16).toUpperCase()}</p>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 min-h-6" />

                {/* Signatures — TABLE LAYOUT for 100% Perfect PDF Export (No overlapping) */}
                <div className="w-full px-10">
                    <table className="w-full table-fixed mx-auto border-separate" style={{ borderSpacing: '10px 0' }}>
                        <tbody>
                            <tr>
                                {/* Coordinator */}
                                <td className="w-1/3 align-bottom text-center px-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-14 flex items-end justify-center mb-1">
                                            {auth.coordinator.signature ? (
                                                <img src={auth.coordinator.signature} alt="Sign" className="max-h-14 object-contain" />
                                            ) : (
                                                <div className="w-32 border-b-2 border-dashed border-slate-300" />
                                            )}
                                        </div>
                                        <div className="w-full border-t-[2px] border-[#3b82f6]/50 pt-2 text-center">
                                            <E value={auth.coordinator.name} onSave={(v: string) => edit('coordinator', 'name', v)}
                                                className="text-sm font-bold text-slate-800 uppercase tracking-wide block" />
                                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block">{auth.coordinator.title}</span>
                                        </div>
                                    </div>
                                </td>
                                {/* HOD */}
                                <td className="w-1/3 align-bottom text-center px-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-14 flex items-end justify-center mb-1">
                                            {auth.hod.signature ? (
                                                <img src={auth.hod.signature} alt="Sign" className="max-h-14 object-contain" />
                                            ) : (
                                                <div className="w-32 border-b-2 border-dashed border-slate-300" />
                                            )}
                                        </div>
                                        <div className="w-full border-t-[2px] border-[#3b82f6]/50 pt-2 text-center">
                                            <E value={auth.hod.name} onSave={(v: string) => edit('hod', 'name', v)}
                                                className="text-sm font-bold text-slate-800 uppercase tracking-wide block" />
                                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block">{auth.hod.title}</span>
                                        </div>
                                    </div>
                                </td>
                                {/* Principal */}
                                <td className="w-1/3 align-bottom text-center px-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-14 flex items-end justify-center mb-1">
                                            {auth.principal.signature ? (
                                                <img src={auth.principal.signature} alt="Sign" className="max-h-14 object-contain" />
                                            ) : (
                                                <div className="w-32 border-b-2 border-dashed border-slate-300" />
                                            )}
                                        </div>
                                        <div className="w-full border-t-[2px] border-[#3b82f6]/50 pt-2 text-center">
                                            <E value={auth.principal.name} onSave={(v: string) => edit('principal', 'name', v)}
                                                className="text-sm font-bold text-slate-800 uppercase tracking-wide block" />
                                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block">{auth.principal.title}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
