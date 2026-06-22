import { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldCheck, Camera, X, CheckCircle, XCircle, Keyboard } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import apiClient from '../../api/client';
import { lookupParticipant } from '../../api/participants.api';
import jsQR from 'jsqr';

type VerifyResult = 'valid' | 'invalid' | null;

interface VerifiedInfo {
    name: string;
    registrationId?: string;
    eventTitle?: string;
    certType?: string;
}

export default function VerifyTab() {
    const [manualId, setManualId] = useState('');
    const [scanning, setScanning] = useState(false);
    const [verifyResult, setVerifyResult] = useState<VerifyResult>(null);
    const [verifiedInfo, setVerifiedInfo] = useState<VerifiedInfo | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const isScanningRef = useRef<boolean>(false);     // Guard: prevents double-animation

    const { toast } = useToast();

    /**
     * Route-aware verification:
     * - UUID-like strings → hit /api/verify/<qr_token>/ (certificate QR verification)
     * - Registration IDs / email → hit /api/participants/lookup/ (manual ID search)
     */
    const verifyCode = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;

        setManualId(trimmed);
        setVerifyResult(null);
        setVerifiedInfo(null);

        // Detect if it looks like a UUID (certificate QR token)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

        // Also handle full URLs from QR codes: http://localhost:8000/api/verify/<uuid>/
        let qrToken: string | null = null;
        const urlMatch = trimmed.match(/\/api\/verify\/([0-9a-f-]{36})\/?/i);
        if (urlMatch) {
            qrToken = urlMatch[1];
        } else if (isUuid) {
            qrToken = trimmed;
        }

        try {
            if (qrToken) {
                // Certificate QR verification — most authoritative check
                const { data } = await apiClient.get(`/api/verify/${qrToken}/`);
                const payload = data?.data ?? data;
                if (payload?.is_valid || payload?.participant) {
                    const p = payload.participant || payload;
                    setVerifyResult('valid');
                    setVerifiedInfo({
                        name: p.full_name || p.name || 'Participant',
                        registrationId: p.registration_id || '',
                        eventTitle: p.event_title || p.event || '',
                        certType: payload.cert_type || payload.type || 'participation',
                    });
                    toast('Verified ✓', `Authentic certificate for ${p.full_name || p.name}`, 'success');
                } else {
                    setVerifyResult('invalid');
                    toast('Not Found', 'Certificate could not be verified — may be revoked or invalid.', 'error');
                }
            } else {
                // Manual ID / email lookup
                const res = await lookupParticipant(trimmed);
                if (res.found && res.participant) {
                    setVerifyResult('valid');
                    setVerifiedInfo({ name: res.participant.name });
                    toast('Verified ✓', `Registration found for ${res.participant.name}`, 'success');
                } else {
                    setVerifyResult('invalid');
                    toast('Not Found', 'No matching participant or certificate found.', 'error');
                }
            }
        } catch {
            setVerifyResult('invalid');
            toast('Error', 'Verification request failed.', 'error');
        }
    }, [toast]);

    const handleManualVerify = () => verifyCode(manualId);

    // ── QR Scan Loop ──────────────────────────────────────────────────────────
    const tick = useCallback(() => {
        if (!isScanningRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });
                if (code && code.data.trim()) {
                    stopScanning();
                    verifyCode(code.data.trim());
                    return;
                }
            }
        }

        animFrameRef.current = requestAnimationFrame(tick);
    }, [verifyCode]);

    const startScanning = async () => {
        setVerifyResult(null);
        setVerifiedInfo(null);
        setManualId('');

        if (!navigator.mediaDevices?.getUserMedia) {
            toast('HTTPS Required', 'Camera access requires HTTPS or localhost. Please use a secure connection.', 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            const video = videoRef.current;
            if (!video) return;

            video.srcObject = stream;
            video.setAttribute('playsinline', 'true');

            // Wait for video metadata to load before starting the scan loop
            // This prevents the race condition where tick() fires before video is ready
            await new Promise<void>((resolve) => {
                video.onloadedmetadata = () => resolve();
            });

            await video.play();

            isScanningRef.current = true;
            setScanning(true);
            animFrameRef.current = requestAnimationFrame(tick);

            toast('Camera Active', 'Point at a certificate QR code to scan', 'info');
        } catch (err: any) {
            const isPermission = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
            toast(
                'Camera Error',
                isPermission
                    ? 'Camera permission denied. Please allow camera access in your browser settings.'
                    : 'Could not access camera. Ensure HTTPS or localhost is used.',
                'error'
            );
        }
    };

    const stopScanning = () => {
        isScanningRef.current = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const video = videoRef.current;
        if (video?.srcObject) {
            (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            video.srcObject = null;
        }
        setScanning(false);
    };

    useEffect(() => {
        return () => { stopScanning(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            {/* Manual Verify */}
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-primary" /> Manual Verification
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Enter a Certificate UUID (from QR code), Registration ID (e.g. TR-2026-001), or participant email.
                </p>
                <div className="flex gap-3">
                    <input
                        className="glass-input flex-1"
                        placeholder="UUID, Registration ID, or Email..."
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                    />
                    <button
                        onClick={handleManualVerify}
                        className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium whitespace-nowrap"
                    >
                        Verify
                    </button>
                </div>

                {verifyResult === 'valid' && verifiedInfo && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-green-400">Certificate Verified ✓</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Authentic certificate awarded to <strong className="text-green-300">{verifiedInfo.name}</strong>.
                                </p>
                                {verifiedInfo.eventTitle && (
                                    <p className="text-sm text-muted-foreground">
                                        Event: <span className="text-white">{verifiedInfo.eventTitle}</span>
                                        {verifiedInfo.certType && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                                {verifiedInfo.certType}
                                            </span>
                                        )}
                                    </p>
                                )}
                                {verifiedInfo.registrationId && (
                                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                                        Registration: {verifiedInfo.registrationId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {verifyResult === 'invalid' && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-400">Certificate Not Found</p>
                            <p className="text-sm text-muted-foreground">The ID could not be verified. It may be invalid or revoked.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* QR Scanner */}
            <div className="glass-card p-6 rounded-xl relative">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" /> QR Code Scanner
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                    Scan a certificate QR code to instantly verify authenticity.
                    <span className="block mt-1 text-xs text-yellow-400/80">
                        ⚠ Camera access requires HTTPS or localhost. Mobile scanning must use a secure connection.
                    </span>
                </p>

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                {!scanning ? (
                    <div className="text-center py-8">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <p className="text-muted-foreground mb-6">Use your device camera to scan a certificate QR code</p>
                        <button
                            onClick={startScanning}
                            className="px-8 py-3 bg-gradient-primary text-white rounded-lg font-medium shadow-glow hover:shadow-glow-accent transition-all"
                        >
                            Start QR Scanner
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="relative inline-block rounded-xl overflow-hidden max-w-sm mx-auto border-2 border-primary/50 shadow-glow">
                            <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline muted />
                            {/* Scan frame overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="relative w-48 h-48">
                                    {/* Corner markers */}
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
                                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />
                                    {/* Scan line animation */}
                                    <div
                                        className="absolute left-1 right-1 h-0.5 bg-primary/70"
                                        style={{
                                            animation: 'scanLine 2s ease-in-out infinite',
                                            top: '50%',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 animate-pulse">Scanning for QR code...</p>
                        <button
                            onClick={stopScanning}
                            className="mt-4 px-6 py-2 bg-destructive/20 border border-destructive/30 text-red-400 rounded-lg flex items-center gap-2 mx-auto hover:bg-destructive/30 transition-colors"
                        >
                            <X className="w-4 h-4" /> Stop Scanner
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Verify hint */}
            <div className="glass-card p-4 rounded-xl flex items-start gap-3 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                    <strong className="text-white">Verification flow:</strong> QR codes on certificates contain a UUID token.
                    Scanning routes through the backend verification endpoint which checks the certificate's validity and revocation status.
                    Manual IDs check the registration database directly.
                </div>
            </div>

            {/* Scan line CSS */}
            <style>{`
                @keyframes scanLine {
                    0%, 100% { transform: translateY(-48px); }
                    50% { transform: translateY(48px); }
                }
            `}</style>
        </div>
    );
}
