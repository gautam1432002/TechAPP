import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, Loader2, ArrowLeft, Download } from 'lucide-react';
import { verifyCertificate } from '../api/certificates.api';
import { downloadCertificate } from '../utils/certificatePdf';
import { generateQRDataUrl } from '../utils/qrGenerator';
import type { CertificateVerifyResponse } from '../types/certificate.types';
import ParticipationCertificate from '../components/certificates/ParticipationCertificate';
import WinnerCertificate from '../components/certificates/WinnerCertificate';
import type { Participant } from '../types/participant.types';
import { DEFAULT_CERT_SETTINGS, DEFAULT_EVENTS } from '../data/defaults';

export default function VerifyCertificatePage() {
    const { qrToken } = useParams<{ qrToken: string }>();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<CertificateVerifyResponse | null>(null);
    const [error, setError] = useState(false);
    
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!qrToken) {
            setLoading(false);
            setError(true);
            return;
        }
        
        generateQRDataUrl(qrToken).then(setQrDataUrl);

        verifyCertificate(qrToken)
            .then((data: CertificateVerifyResponse) => { setResult(data); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
    }, [qrToken]);

    const handleDownloadFrontendPdf = async () => {
        if (!result) return;
        setIsDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            await document.fonts.ready;

            await downloadCertificate('certificate-print-node', mockParticipant?.name || 'Participant');
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const mockParticipant = (result ? {
        id: result.certificateId,
        certificateId: result.certificateId,
        name: result.participant.name,
        college: result.participant.college,
        email: '', phone: '', course: '', year: '1st', status: 'approved',
        createdAt: result.issuedAt, event: ''
    } : null) as unknown as Participant;

    const mockEvent = result ? {
        ...DEFAULT_EVENTS[0],
        title: result.event.title,
        eventDate: result.event.date,
    } : null;

    const certSettings = result?.certSettings || DEFAULT_CERT_SETTINGS;

    return (
        <div className="min-h-screen flex flex-col items-center py-10 px-4">
            <div className="glass-card max-w-4xl w-full p-8 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold text-white">Official Verification Portal</h1>
                </div>

                {loading && (
                    <div className="flex flex-col items-center gap-4 py-10">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-muted-foreground">Verifying certificate authenticity...</p>
                    </div>
                )}

                {!loading && result && result.isValid && result.type !== 'entry-pass' && (
                    <div className="space-y-8 flex flex-col items-center w-full">
                        <div className="flex items-center gap-3 bg-green-500/10 p-4 rounded-lg border border-green-500/30 w-full max-w-md mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <div className="text-left">
                                <p className="font-bold text-green-400 text-lg">Certificate Verified ✓</p>
                                <p className="text-sm text-green-200/70">Issued to {result.participant.name}</p>
                            </div>
                        </div>

                        <div className="w-full flex justify-center items-center bg-white/5 p-4 rounded-xl border border-white/10 overflow-hidden relative">
                            {mockParticipant && mockEvent && (
                                <div className="origin-top transform scale-[0.4] sm:scale-[0.5] md:scale-[0.8] mb-[-400px] sm:mb-[-300px] md:mb-[-150px]">
                                    {result.type === 'winner' ? (
                                        <WinnerCertificate
                                            participant={mockParticipant}
                                            event={mockEvent}
                                            certSettings={certSettings}
                                            qrDataUrl={qrDataUrl}
                                            isEditable={false}
                                        />
                                    ) : (
                                        <ParticipationCertificate
                                            participant={mockParticipant}
                                            event={mockEvent}
                                            certSettings={certSettings}
                                            qrDataUrl={qrDataUrl}
                                            isEditable={false}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleDownloadFrontendPdf}
                            disabled={isDownloading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed mx-auto"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            {isDownloading ? 'Capturing Snapshot...' : 'Download Official PDF'}
                        </button>
                    </div>
                )}
                
                {!loading && result && result.isValid && result.type === 'entry-pass' && (
                    <div className="space-y-4 text-left max-w-md mx-auto">
                         <div className="flex items-center gap-3 bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <div>
                                <p className="font-bold text-green-400 text-lg">Registration Pass Verified ✓</p>
                                <p className="text-sm text-muted-foreground">Valid entry pass</p>
                            </div>
                        </div>
                        <div className="space-y-3 glass-card p-4 rounded-lg">
                            <div><span className="text-muted-foreground text-sm">Participant</span><p className="text-white font-semibold">{result.participant.name}</p></div>
                            <div><span className="text-muted-foreground text-sm">College</span><p className="text-white">{result.participant.college}</p></div>
                            <div><span className="text-muted-foreground text-sm">Event</span><p className="text-white">{result.event.title}</p></div>
                            <div><span className="text-muted-foreground text-sm">Type</span><p className="text-white capitalize">Entry Pass</p></div>
                            <div><span className="text-muted-foreground text-sm">Registered</span><p className="text-white">{new Date(result.issuedAt).toLocaleDateString()}</p></div>
                        </div>
                    </div>
                )}

                {!loading && (error || (result && !result.isValid)) && (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <XCircle className="w-16 h-16 text-red-500" />
                        <p className="font-bold text-red-400 text-xl">Invalid Verification Link</p>
                        <p className="text-sm text-muted-foreground max-w-sm">This certificate could not be verified. It may be invalid, revoked, or the URL is incorrect.</p>
                    </div>
                )}

                <Link to="/" className="inline-flex items-center gap-2 mt-8 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Return to Home
                </Link>
            </div>
        </div>
    );
}
