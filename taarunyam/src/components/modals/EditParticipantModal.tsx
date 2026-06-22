import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User, Mail, Phone, School, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';
import { getParticipants, updateParticipant } from '../../api/participants.api';


const editSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
    email: z.string().email('Invalid email').max(255, 'Email too long'),
    mobile: z.string().regex(/^[0-9]{10}$/, '10-digit number required'),
    college: z.string().min(2, 'College is required').max(255, 'College name too long'),
    course: z.string().min(1, 'Select a course').max(255, 'Course name too long'),
    year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year'], {
        errorMap: () => ({ message: 'Select a valid year' })
    }),
});

type EditFormData = z.infer<typeof editSchema>;

export default function EditParticipantModal() {
    const isOpen = useAppStore((s) => s.isEditParticipantModalOpen);
    const editId = useAppStore((s) => s.editParticipantId);
    const closeEditModal = useAppStore((s) => s.closeEditParticipantModal);
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
    });

    useEffect(() => {
        if (isOpen && editId) {
            setIsLoading(true);
            getParticipants({ search: editId })
                .then((res) => {
                    const found = res.results.find((p) => p.id === editId);
                    if (found) {
                        reset({
                            name: found.name || '',
                            email: found.email || '',
                            mobile: found.mobile || '',
                            college: found.college || '',
                            course: found.course || '',
                            year: found.year as any,
                        });
                    } else {
                        toast('Error', 'Participant not found', 'error');
                        closeEditModal();
                    }
                })
                .catch(() => toast('Error', 'Failed to load participant data', 'error'))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, editId, reset, closeEditModal, toast]);

    const onSubmit = async (data: EditFormData) => {
        if (!editId) return;
        setIsSaving(true);
        try {
            await updateParticipant(editId, data);
            toast('Success', 'Participant details updated successfully', 'success');
            // Trigger a refresh of the participants list
            window.dispatchEvent(new CustomEvent('participantsUpdated'));
            closeEditModal();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to update participant';
            toast('Update Failed', msg, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">Edit Participant</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{editId}</p>
                        </div>
                    </div>
                    <button onClick={closeEditModal} className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p>Loading details...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {/* Personal Info Group */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Personal Information</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            {...register('name')}
                                            disabled={isSaving}
                                            placeholder="Full Name"
                                            className="w-full glass-input pl-10 h-10 disabled:opacity-50"
                                        />
                                        {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            {...register('email')}
                                            disabled={isSaving}
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full glass-input pl-10 h-10 disabled:opacity-50"
                                        />
                                        {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            {...register('mobile')}
                                            disabled={isSaving}
                                            placeholder="Mobile Number"
                                            className="w-full glass-input pl-10 h-10 disabled:opacity-50"
                                        />
                                        {errors.mobile && <p className="text-red-400 text-[10px] mt-1">{errors.mobile.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info Group */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Academic Information</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="relative">
                                        <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            {...register('college')}
                                            disabled={isSaving}
                                            placeholder="College/Institution"
                                            className="w-full glass-input pl-10 h-10 disabled:opacity-50"
                                        />
                                        {errors.college && <p className="text-red-400 text-[10px] mt-1">{errors.college.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                            <input
                                                {...register('course')}
                                                disabled={isSaving}
                                                placeholder="Course"
                                                className="w-full glass-input pl-10 h-10 disabled:opacity-50"
                                            />
                                            {errors.course && <p className="text-red-400 text-[10px] mt-1">{errors.course.message}</p>}
                                        </div>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                            <select
                                                {...register('year')}
                                                disabled={isSaving}
                                                className="w-full glass-input pl-10 h-10 appearance-none disabled:opacity-50"
                                            >
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </select>
                                            {errors.year && <p className="text-red-400 text-[10px] mt-1">{errors.year.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={closeEditModal}
                                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-2 py-2 px-8 rounded-lg bg-gradient-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
