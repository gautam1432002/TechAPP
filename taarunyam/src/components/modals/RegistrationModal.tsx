import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import html2canvas from 'html2canvas';

import { useAppStore } from '../../store/appStore';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../../hooks/useToast';
import { COURSES } from '../../data/defaults';
import { registerParticipant } from '../../api/participants.api';
import { getPublicEvents } from '../../api/events.api';
import type { Participant } from '../../types/participant.types';
import type { TEvent } from '../../types/event.types';
import { generateQRDataUrl } from '../../utils/qrGenerator';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
    email: z.string().email('Invalid email').max(255, 'Email too long'),
    mobile: z.string().regex(/^[0-9]{10}$/, '10-digit number required'),
    college: z.string().min(2, 'College is required').max(255, 'College name too long'),
    course: z.string().min(1, 'Select a course').max(255, 'Course name too long'),
    year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year'], {
        errorMap: () => ({ message: 'Select a valid year' })
    }),
    event: z.string().min(1, 'Select an event'),
});

type RegFormData = z.infer<typeof schema>;

export default function RegistrationModal() {
    const isOpen = useAppStore((s) => s.isRegModalOpen);
    const preselectedEventId = useAppStore((s) => s.preselectedEventId);
    const closeRegModal = useAppStore((s) => s.closeRegModal);
    const { toast } = useToast();

    // Load real events from the database
    const [events, setEvents] = useState<TEvent[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState('');

    const cardRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<RegFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            mobile: '',
            college: '',
            course: '',
            year: undefined,
            event: preselectedEventId || '',
        },
    });

    // Load real events from DB whenever the modal opens
    useEffect(() => {
        if (!isOpen) return;
        setEventsLoading(true);
        getPublicEvents()
            .then((data) => {
                setEvents(data);
            })
            .catch(() => {
                // events list stays empty — user will see "No events available"
            })
            .finally(() => setEventsLoading(false));
    }, [isOpen]);

    useEffect(() => {
        if (preselectedEventId) {
            setValue('event', preselectedEventId);
        }
    }, [preselectedEventId, setValue]);

    useEffect(() => {
        if (success && registeredParticipant) {
            const qrValue = registeredParticipant.certificateId || registeredParticipant.id;
            generateQRDataUrl(qrValue).then(setQrDataUrl);
        }
    }, [success, registeredParticipant]);

    const handleDownloadQR = async () => {
        if (!cardRef.current || !qrDataUrl) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#1a1a2e',
                scale: 2,
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `Taarunyam_QR_${registeredParticipant?.id || 'Pass'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch {
            toast('Failed', 'Could not generate card image.', 'error');
        }
    };

    const onSubmit = async (data: RegFormData) => {
        setIsSubmitting(true);
        try {
            const res = await registerParticipant({
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                college: data.college,
                course: data.course,
                year: data.year as Participant['year'],
                events: [data.event],  // real UUID from DB
            });

            setRegisteredParticipant(res.participant);
            setSuccess(true);
            toast('Success! 🎉', 'Registration successful. Save your QR Pass!', 'success');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            toast('Error', msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setRegisteredParticipant(null);
        setQrDataUrl('');
        reset();
        closeRegModal();
    };

    // Find the preselected event in the loaded events list
    const preselectedEvent = events.find((e) => e.id === preselectedEventId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl p-6 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute right-4 top-4 text-muted-foreground hover:text-white">
                    <X />
                </button>

                {!success ? (
                    <>
                        <h2 className="text-2xl font-bold glow-text mb-2 text-white">Register</h2>
                        <p className="text-muted-foreground mb-6">Enter your details to generate your ID and QR Code.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Full Name <span className="text-red-500">*</span></label>
                                    <input {...register('name')} className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none" />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Mobile Number <span className="text-red-500">*</span></label>
                                    <input {...register('mobile')} placeholder="10-digit number" className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none" />
                                    {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Email <span className="text-red-500">*</span></label>
                                    <input {...register('email')} type="email" className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none" />
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">College / Institute <span className="text-red-500">*</span></label>
                                    <input {...register('college')} className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none" />
                                    {errors.college && <p className="text-red-400 text-xs mt-1">{errors.college.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Course / Branch <span className="text-red-500">*</span></label>
                                    <select {...register('course')} className="w-full glass-select">
                                        <option value="" disabled>Select your course</option>
                                        {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.course && <p className="text-red-400 text-xs mt-1">{errors.course.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">Year <span className="text-red-500">*</span></label>
                                    <select {...register('year')} className="w-full glass-select">
                                        <option value="" disabled>Select your year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                    {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year.message}</p>}
                                </div>
                            </div>

                            {/* Event selector — uses real DB events */}
                            {!preselectedEventId && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-white">
                                        Event <span className="text-red-500">*</span>
                                    </label>
                                    {eventsLoading ? (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-glass border border-glass-border text-muted-foreground text-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading events...
                                        </div>
                                    ) : events.length === 0 ? (
                                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                                            No active events available. Please check back later.
                                        </div>
                                    ) : (
                                        <select {...register('event')} className="w-full glass-select">
                                            <option value="" disabled>Select an event</option>
                                            {events.map((ev) => (
                                                <option key={ev.id} value={ev.id}>{ev.title}</option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.event && <p className="text-red-400 text-xs mt-1">{errors.event.message}</p>}
                                </div>
                            )}

                            {/* Show auto-selected event with real name from DB */}
                            {preselectedEventId && (
                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-primary font-medium mb-1">Selected Event</p>
                                        <p className="text-white font-bold">
                                            {eventsLoading
                                                ? <span className="text-muted-foreground text-sm">Loading...</span>
                                                : (preselectedEvent?.title || 'Event #' + preselectedEventId.substring(0, 8))}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">Auto-Selected</div>
                                </div>
                            )}

                            <button
                                disabled={isSubmitting || eventsLoading}
                                type="submit"
                                className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-lg shadow-glow hover:shadow-glow-accent transition-all mt-6 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                            <CheckCircle className="w-6 h-6" />
                            <h3 className="text-xl font-bold">Registration Successful!</h3>
                        </div>

                        <div ref={cardRef} className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm mx-auto shadow-2xl backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                            <h4 className="text-xl font-bold text-white mb-2 relative z-10">
                                {registeredParticipant?.events?.[0] || 'Tech Event'}
                            </h4>
                            <p className="text-lg text-primary-glow font-medium mb-6 relative z-10">{registeredParticipant?.name}</p>

                            {qrDataUrl ? (
                                <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-6 shadow-glow relative z-10">
                                    <QRCodeSVG value={qrDataUrl} size={160} level="H" fgColor="#000000" />
                                </div>
                            ) : (
                                <div className="w-[160px] h-[160px] mx-auto mb-6 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center text-muted-foreground animate-pulse relative z-10">
                                    Generating...
                                </div>
                            )}

                            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1 relative z-10">Participant ID</p>
                            <code className="text-white font-mono text-xl block bg-black/30 py-2 rounded-lg border border-white/10 relative z-10">
                                {registeredParticipant?.id}
                            </code>
                        </div>

                        <p className="text-sm text-muted-foreground mt-8 mb-6 relative z-10">
                            Please save this QR code or ID. You will need it to verify your participation and claim your certificate after the event.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center items-center">
                            <button onClick={handleDownloadQR} className="bg-white text-black font-bold py-3 px-6 rounded-lg shadow-glow hover:bg-gray-200 transition-all w-full sm:w-auto">
                                Download QR Code
                            </button>
                            <button onClick={handleClose} className="bg-gradient-primary text-white font-semibold py-3 px-6 rounded-lg shadow-glow hover:shadow-glow-accent transition-all w-full sm:w-auto">
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
