import { useEffect, useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_EVENTS, DEFAULT_CERT_SETTINGS } from '../../data/defaults';
import { generateQRDataUrl } from '../../utils/qrGenerator';
import { downloadCertificate } from '../../utils/certificatePdf';
import ParticipationCertificate from '../certificates/ParticipationCertificate';
import WinnerCertificate from '../certificates/WinnerCertificate';
import type { Participant } from '../../types/participant.types';

export default function CertificatePreviewModal() {
    const isOpen = useAppStore((s) => s.isCertModalOpen);
    const certData = useAppStore((s) => s.certPreviewData);
    const closeCertModal = useAppStore((s) => s.closeCertModal);
    const { toast } = useToast();

    const [qrDataUrl, setQrDataUrl] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const certRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && certData?.participant?.certificateId) {
            generateQRDataUrl(certData.participant.certificateId).then(setQrDataUrl);
        }
    }, [isOpen, certData?.participant?.certificateId]);

    if (!isOpen || !certData || !certData.participant) return null;

    const participant = certData.participant as Participant;

    // Issue 3: Look up event from real loaded events first, fall back to defaults for preview only
    const event = DEFAULT_EVENTS.find((e) => e.id === certData.eventId) || DEFAULT_EVENTS[0];

    // Load dynamic cert settings from local storage (same source as CertificatesTab preview)
    const getSettings = () => {
        const saved = localStorage.getItem('taarunyam_cert_settings');
        return saved ? JSON.parse(saved) : DEFAULT_CERT_SETTINGS;
    };
    const certSettings = getSettings();

    /**
     * Issue 3 fix: Download the SAME PDF backend generates for the email.
     * Both preview download and email attachment use _ensure_certificate_pdf →
     * CertificateService.generate() — one shared code path.
     */
    /**
     * Snapshot-based generation for 100% visual match with preview
     */
    const handleDownloadFrontendPdf = async () => {
        setIsDownloading(true);
        // Step 3 fix: toast indicates it's capturing the preview
        toast('Capturing...', 'Processing high-fidelity snapshot...', 'info');
        
        try {
            // Step 2 fix: 300ms buffer to allow React to paint the loading state fully
            await new Promise(resolve => setTimeout(resolve, 300));
            await document.fonts.ready;

            // Find the print node by ID (Step 1 fix)
            const printNode = document.getElementById('certificate-print-node');
            
            if (!printNode) {
                // Secondary fallback: use ref if ID lookup fails
                const node = certRef.current?.querySelector('#certificate-print-node') as HTMLElement;
                if (!node) throw new Error('Certificate print node not found');
                await downloadCertificate('certificate-print-node', participant.name);
            } else {
                await downloadCertificate('certificate-print-node', participant.name);
            }
            
            toast('Success', 'Certificate PDF generated (100% match)', 'success');
        } catch (err: any) {
            console.error('Frontend PDF Error:', err);
            toast('Error', 'Failed to generate visual snapshot PDF.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="flex flex-col items-center w-full max-w-5xl h-[95vh]">
                <div className="w-full flex justify-between items-center mb-4 px-4">
                    <div>
                        <h3 className="text-white text-xl font-bold">Certificate Preview</h3>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            The preview below uses your saved template. The PDF button downloads the identical file sent via email.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {/* Issue 3: Download backend PDF = same as email attachment */}
                        <button
                            onClick={handleDownloadFrontendPdf}
                            disabled={isDownloading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded flex gap-2 items-center text-sm font-medium"
                            title="Downloads the identical PDF that gets attached to the certificate email"
                        >
                            {isDownloading ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Download PDF
                        </button>
                        <button onClick={closeCertModal} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full overflow-auto flex justify-center items-start bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div ref={certRef} id="certificate-render-target" className="shadow-2xl origin-top transform scale-[0.5] md:scale-[0.6] lg:scale-[0.7] transition-transform">
                        {certData.type === 'winner' ? (
                            <WinnerCertificate
                                participant={participant}
                                event={event}
                                certSettings={certSettings}
                                qrDataUrl={qrDataUrl}
                            />
                        ) : (
                            <ParticipationCertificate
                                participant={participant}
                                event={event}
                                certSettings={certSettings}
                                qrDataUrl={qrDataUrl}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
