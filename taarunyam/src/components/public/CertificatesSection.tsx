import { useState } from 'react';
import { Shield, Award, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { verifyCertificate } from '../../api/certificates.api';
import type { CertificateVerifyResponse } from '../../types/certificate.types';

export default function CertificatesSection() {
    const navigate = useNavigate();
    const openRegModal = useAppStore((s) => s.openRegModal);
    const [certId, setCertId] = useState('');
    const [verifyResult, setVerifyResult] = useState<CertificateVerifyResponse | null>(null);
    const [verifyError, setVerifyError] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async () => {
        if (!certId.trim()) return;
        setVerifying(true);
        setVerifyResult(null);
        setVerifyError(false);
        try {
            const result = await verifyCertificate(certId.trim());
            setVerifyResult(result);
        } catch {
            setVerifyError(true);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <section id="certificates" className="py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text text-white">Certificates &amp; Recognition</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                    Every participant receives a digital certificate. Winners get special recognition.
                </p>

                <div className="glass-card p-12 rounded-2xl max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📜</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Participation Certificate</h3>
                            <p className="text-muted-foreground">Modern design with geometric elements</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-winner rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏆</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Winner Certificate</h3>
                            <p className="text-muted-foreground">Premium gold-themed elegant design</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <button onClick={() => navigate('/admin')} className="bg-glass border border-glass-border text-foreground hover:bg-glass-hover transition-all px-6 py-3 rounded-lg flex items-center justify-center gap-2">
                            <Shield className="w-5 h-5" /> Admin Panel
                        </button>
                        <button onClick={() => openRegModal()} className="bg-gradient-primary text-white hover:shadow-glow-accent transition-all px-6 py-3 rounded-lg flex items-center justify-center gap-2">
                            <Award className="w-5 h-5" /> Get Your Certificate
                        </button>
                    </div>

                    {/* Verify Certificate Section */}
                    <div className="mt-8 pt-6 border-t border-glass-border">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-white">Verify a Certificate</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Enter your Certificate ID below to check its authenticity.</p>

                        <div className="flex gap-3 max-w-lg mx-auto">
                            <input
                                className="glass-input flex-1"
                                placeholder="Enter Certificate ID..."
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            />
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-glow transition-all"
                            >
                                {verifying ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>

                        {verifyResult && verifyResult.isValid && (
                            <div className="glass-card border border-green-500/40 p-4 rounded-lg mt-4 max-w-lg mx-auto text-left">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-400">
                                            {verifyResult.type === 'entry-pass' ? 'Valid Registration Pass ✓' : 'Certificate Verified ✓'}
                                        </p>
                                        <p className="text-sm text-white">Participant: {verifyResult.participant.name}</p>
                                        <p className="text-sm text-muted-foreground">College: {verifyResult.participant.college}</p>
                                        <p className="text-sm text-muted-foreground">Event: {verifyResult.event.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Type: {verifyResult.type === 'winner' ? 'Winner' : verifyResult.type === 'entry-pass' ? 'Event Pass' : 'Participation'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">Issued: {new Date(verifyResult.issuedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {verifyError && (
                            <div className="glass-card border border-red-500/40 p-4 rounded-lg mt-4 max-w-lg mx-auto text-left">
                                <div className="flex items-start gap-3">
                                    <XCircle className="text-red-400 w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-red-400">Certificate Not Found or Revoked</p>
                                        <p className="text-sm text-muted-foreground">The certificate ID you entered could not be verified.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
