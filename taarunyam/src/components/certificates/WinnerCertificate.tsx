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

export default function WinnerCertificate({
    participant: p,
    event: ev,
    certSettings: s,
    qrDataUrl,
    isEditable,
    onFieldUpdate
}: Props) {
    const cert = s.winner;
    const auth = s.authorities;

    const renderedMainText = cert.mainText
        .replace('{name}', (p.name || '').toUpperCase())
        .replace('{event}', ev.title)
        .replace('{eventName}', s.eventName)
        .replace('{position}', p.isWinner ? '1st' : '___');

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
                className={`${className} outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-slate-50 rounded cursor-text`}
                style={{ overflowWrap: 'break-word', maxWidth: '100%' }}
            >
                {value}
            </Tag>
        );
    };

    return (
        <div id="certificate-print-node" className="w-[1123px] h-[794px] bg-white relative overflow-hidden flex flex-col" style={{ fontFamily: "'Playfair Display', 'Cinzel', serif" }}>

            {/* ── Background Patterns ── */}
            <div className="absolute inset-4 border-[4px] border-[#c19b2e]/80 pointer-events-none z-0 rounded" />
            <div className="absolute inset-[22px] border-[1px] border-[#1e3a8a]/40 pointer-events-none z-0 rounded" />

            <svg className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none z-0 opacity-10" viewBox="0 0 400 400">
                <circle cx="400" cy="0" r="350" fill="url(#gradBlue)" />
                <circle cx="400" cy="0" r="250" fill="url(#gradGold)" />
                <circle cx="400" cy="0" r="150" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="10 10" />
                <defs>
                    <radialGradient id="gradBlue" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#1e3a8a" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="gradGold" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#c19b2e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>

            <svg className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none z-0 opacity-10" viewBox="0 0 400 400">
                <circle cx="0" cy="400" r="300" fill="url(#gradGold2)" />
                <circle cx="0" cy="400" r="200" fill="url(#gradBlue2)" />
                <defs>
                    <radialGradient id="gradGold2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="1" />
                        <stop offset="100%" stopColor="#c19b2e" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="gradBlue2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                    </radialGradient>
                </defs>
            </svg>

            {/* Subtle center mandala watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
                <svg viewBox="0 0 400 400" className="w-[500px] h-[500px] text-[#0b1a30]">
                    <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    {[0, 30, 60, 90, 120, 150].map(a => <line key={a} x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="0.3" transform={`rotate(${a} 200 200)`} />)}
                </svg>
            </div>

            {/* ── Refined Left Vertical Gold/Blue Ribbon ── */}
            <div className="absolute top-0 left-16 w-14 h-48 bg-gradient-to-b from-[#c19b2e] via-[#d4af37] to-[#856a1b] shadow-[2px_10px_20px_rgba(0,0,0,0.3)] z-10 flex flex-col items-center pt-8 border-r border-[#fef08a]/30">
                {/* Ribbon folding effect at top */}
                <div className="absolute top-0 -left-2 w-2 h-4 bg-[#665012] clip-triangle-left" />
                <div className="absolute top-0 -right-2 w-2 h-4 bg-[#665012] clip-triangle-right" />

                {/* Decorative Star inside ribbon (matching participation style) */}
                <div className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center mt-auto mb-4 bg-white/20 backdrop-blur-sm shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow-md">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                    </svg>
                </div>
                {/* Forked bottom */}
                <svg className="absolute -bottom-6 left-0 w-14 h-8 text-[#856a1b] drop-shadow-xl" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="0,0 100,0 100,100 50,40 0,100" fill="currentColor" />
                </svg>
            </div>

            {/* Golden corner accents */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-[#c19b2e] z-10 pointer-events-none" />
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-[#c19b2e] z-10 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-[#c19b2e] z-10 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-[#c19b2e] z-10 pointer-events-none" />

            {/* ── Main Content (Matches Participation Structure Exactly) ── */}
            <div className="relative z-10 flex flex-col items-center text-center flex-1 px-16 pt-8 pb-10 ml-4">

                {/* Logo */}
                <div className="flex-shrink-0 mb-2 h-20 flex items-center justify-center">
                    {s.organizerLogo ? (
                        <img src={s.organizerLogo} alt="Logo" className="max-h-20 object-contain drop-shadow-md" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-50 border-2 border-dashed border-[#c19b2e]/50 rounded-lg flex items-center justify-center text-[10px] text-[#c19b2e] font-bold uppercase leading-tight text-center">LOGO</div>
                    )}
                </div>

                {/* Institute Name */}
                <div className="flex-shrink-0 mb-1">
                    <E value={s.organizerName} onSave={(v: string) => edit('general', 'organizerName', v)}
                        className="text-xl font-bold tracking-[0.3em] text-[#1e3a8a] uppercase" />
                </div>

                {/* Event Name */}
                <div className="flex-shrink-0 mb-2 w-full max-w-4xl relative flex items-center justify-center">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[28%] h-[1px] bg-gradient-to-r from-transparent to-[#c19b2e]" />
                    <E value={s.eventName} onSave={(v: string) => edit('general', 'eventName', v)}
                        className="text-3xl font-black text-slate-800 tracking-[0.2em] uppercase drop-shadow-sm leading-none px-6 text-center" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[28%] h-[1px] bg-gradient-to-l from-transparent to-[#c19b2e]" />
                </div>

                {/* Certificate Title */}
                <div className="flex-shrink-0 mb-2 relative flex items-center justify-center">
                    <E value={cert.title} onSave={(v: string) => edit('winner', 'title', v)}
                        className="relative z-10 text-6xl font-black text-[#c19b2e] uppercase tracking-wider drop-shadow-sm leading-none pt-2 text-center" />
                </div>

                {/* Winner Name */}
                <div className="flex-shrink-0 mb-2 mt-1 flex flex-col items-center">
                    <div className="inline-block border-b-[3px] border-[#c19b2e]/60 px-16 pb-2">
                        <h3 className="text-5xl font-black italic text-slate-800 uppercase leading-none text-center pr-2">
                            {(p.name || 'WINNER NAME').toUpperCase()}
                        </h3>
                    </div>
                </div>

                {/* Trophy & Position (Integrated cleanly above Main Text) */}
                <div className="flex-shrink-0 mb-1 flex items-center justify-center gap-4">
                    <svg viewBox="0 0 64 64" className="w-10 h-10 text-[#c19b2e] drop-shadow filter">
                        <path d="M16 8h32v4c0 10-6 18-12 22h-8C22 30 16 22 16 12V8z" fill="currentColor" />
                        <rect x="26" y="34" width="12" height="8" rx="1" fill="#a17b20" />
                        <rect x="22" y="42" width="20" height="4" rx="2" fill="currentColor" />
                        <path d="M12 10c-4 0-6 4-4 10s6 8 8 8v-4c-2 0-4-2-5-6s0-6 1-6V10z" fill="#a17b20" />
                        <path d="M52 10c4 0 6 4 4 10s-6 8-8 8v-4c2 0 4-2 5-6s0-6-1-6V10z" fill="#a17b20" />
                    </svg>
                    <E value={cert.achievementText}
                        onSave={(v: string) => edit('winner', 'achievementText', v)}
                        className="text-lg font-bold tracking-[0.3em] text-[#1e3a8a] uppercase" />
                </div>

                {/* Main Text */}
                <div className="flex-shrink-0 max-w-4xl mb-2" style={{ overflowWrap: 'break-word', fontFamily: "'Montserrat', sans-serif" }}>
                    <E value={isEditable ? cert.mainText : renderedMainText}
                        onSave={(v: string) => edit('winner', 'mainText', v)}
                        className="text-xl text-slate-700 leading-relaxed font-medium" />
                </div>

                {/* College */}
                <p className="flex-shrink-0 text-base text-slate-500 italic mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Representing <span className="text-slate-800 font-bold not-italic">{(p.college || 'INSTITUTION').toUpperCase()}</span>
                </p>

                {/* QR Code + Certificate ID — CENTERED */}
                <div className="flex-shrink-0 flex items-center justify-center gap-4 mb-0">
                    {qrDataUrl && (
                        <div className="bg-white p-1 border-2 border-[#c19b2e]/40 shadow-sm rounded-md w-16 h-16 flex items-center justify-center">
                            <QRCodeSVG value={qrDataUrl} size={56} level="H" fgColor="#1e3a5f" />
                        </div>
                    )}
                    <div className="text-left font-mono leading-tight">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">ID: {p.id}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">CERT: {p.certificateId?.substring(0, 16).toUpperCase()}</p>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 min-h-2" />

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
                                                <div className="w-32 border-b-2 border-dashed border-[#c19b2e]/60" />
                                            )}
                                        </div>
                                        <div className="w-full border-t-[2px] border-[#1e3a8a]/40 pt-2 text-center">
                                            <E value={auth.coordinator.name} onSave={(v: string) => edit('coordinator', 'name', v)}
                                                className="text-sm font-bold text-slate-800 uppercase tracking-wide block" />
                                            <span className="text-[10px] text-[#c19b2e] font-bold uppercase tracking-widest block">{auth.coordinator.title}</span>
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
                                                <div className="w-32 border-b-2 border-dashed border-[#c19b2e]/60" />
                                            )}
                                        </div>
                                        <div className="w-full border-t-[2px] border-[#1e3a8a]/40 pt-2 text-center">
                                            <E value={auth.hod.name} onSave={(v: string) => edit('hod', 'name', v)}
                                                className="text-sm font-bold text-slate-800 uppercase tracking-wide block" />
                                            <span className="text-[10px] text-[#c19b2e] font-bold uppercase tracking-widest block">{auth.hod.title}</span>
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
                                                <div className="w-32 border-b-2 border-dashed border-[#c19b2e]/60" />
                                            )}
                                        </div>
                                        <div className="w-full border-t-[2px] border-[#1e3a8a]/40 pt-2 text-center">
                                            <E value={auth.principal.name} onSave={(v: string) => edit('principal', 'name', v)}
                                                className="text-sm font-bold text-slate-800 uppercase tracking-wide block" />
                                            <span className="text-[10px] text-[#c19b2e] font-bold uppercase tracking-widest block">{auth.principal.title}</span>
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
