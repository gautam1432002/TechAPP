import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Mail, KeyRound, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';
import { loginAdmin, requestOtp, verifyOtp, resetPassword as apiResetPassword } from '../../api/auth.api';

type LoginState = 'login' | 'forgotPassword' | 'otpReset';

export default function AdminLoginView() {
    const [viewState, setViewState] = useState<LoginState>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Login state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot Password state
    const [recoveryEmail, setRecoveryEmail] = useState('');

    // OTP Reset state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const adminLogin = useAppStore((s) => s.adminLogin);
    const isAuth = useAppStore((s) => s.isAdminAuthenticated);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuth) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuth, navigate]);

    useEffect(() => {
        // Clear errors when changing views
        setErrorMsg('');
        setShake(false);
    }, [viewState]);

    const triggerError = (msg: string) => {
        setErrorMsg(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            triggerError('Please enter both username and password');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await loginAdmin({ username, password });
            adminLogin(res.token, res.user);
            toast('Admin Access', 'Welcome to Admin Dashboard', 'success');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid admin credentials';
            triggerError(msg);
            toast('Access Denied', msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async () => {
        const normalizedEmail = recoveryEmail.toLowerCase().trim();

        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            triggerError('Please enter a valid admin email address');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            await requestOtp(normalizedEmail);
            toast('En Route!', 'A secure OTP is being delivered to your inbox.', 'success');
            // Transition to OTP input view
            setViewState('otpReset');
            setOtp(['', '', '', '', '', '']); // Reset OTP fields if resending
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to request OTP. Please try again.';
            if (err.response?.status === 403) {
                // Special handling for unauthorized email as per "cross check" requirement
                triggerError('SECURITY ALERT: This email is not in our authorized admin list.');
                toast('Access Denied', 'Unauthorized email detected.', 'error');
            } else {
                triggerError(msg);
                toast('Network Error', 'Check your connection or backend status.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value !== '' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = async () => {
        const otpValue = otp.join('');
        if (otpValue.length < 6) {
            triggerError('Please enter the complete 6-digit OTP');
            return;
        }
        if (!newUsername.trim()) {
            triggerError('Please enter a new username');
            return;
        }
        if (newPassword.length < 8) {
            triggerError('Password must be at least 8 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            triggerError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            // 1. Verify OTP to get reset token
            const { resetToken: token } = await verifyOtp(recoveryEmail, otpValue);

            // 2. Perform reset
            await apiResetPassword({
                reset_token: token,
                new_username: newUsername,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            toast('Password Reset', 'Your credentials have been successfully updated', 'success');
            setViewState('login');
            setPassword('');
            setUsername('');
            setOtp(['', '', '', '', '', '']);
            setNewUsername('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Verification or reset failed';
            triggerError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Transition animation wrapper class
    const viewAnimation = "transition-all duration-300 animate-in fade-in slide-in-from-bottom-4";

    return (
        <div className="p-8 max-w-md mx-auto w-full admin-theme">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-medium z-10"
                type="button"
            >
                <ChevronLeft className="w-4 h-4" /> Home
            </button>

            {/* Login View */}
            {viewState === 'login' && (
                <div className={`text-center ${viewAnimation}`}>
                    <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-glow">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold glow-text text-white">Admin Access</h2>
                    <p className="text-muted-foreground mb-6 mt-2">Enter your admin credentials</p>

                    <div className="space-y-4 text-left">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className={`w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all ${shake && !username ? 'border-red-500/50' : ''}`}
                            disabled={isLoading}
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className={`w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all pr-12 ${shake && !password ? 'border-red-500/50' : ''}`}
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                type="button"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {errorMsg && <p className="text-red-400 text-sm text-center animate-in fade-in">{errorMsg}</p>}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setViewState('forgotPassword')}
                                className="text-sm text-primary hover:text-primary-glow transition-colors font-medium hover:underline"
                                type="button"
                                disabled={isLoading}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className={`w-full bg-gradient-primary text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-lg shadow-glow hover:shadow-glow-accent transition-all ${shake ? 'animate-shake' : ''} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Accessing Dashboard...
                                </>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Forgot Password View */}
            {viewState === 'forgotPassword' && (
                <div className={`text-center ${viewAnimation}`}>
                    <div className="bg-glass-hover border border-glass-border w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-muted-foreground mb-6 text-sm">Enter your registered admin email address to receive an OTP.</p>

                    <div className="space-y-6 text-left">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Admin Email</label>
                            <input
                                type="email"
                                placeholder="hello@taarunyam.com"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                                className={`w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all ${shake ? 'border-red-500/50' : ''}`}
                                disabled={isLoading}
                            />
                        </div>

                        {errorMsg && <p className="text-red-400 text-sm text-center animate-in fade-in">{errorMsg}</p>}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSendOTP}
                                disabled={isLoading}
                                className={`w-full bg-gradient-primary text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-lg shadow-glow hover:shadow-glow-accent transition-all ${shake ? 'animate-shake' : ''} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                            <button
                                onClick={() => setViewState('login')}
                                disabled={isLoading}
                                className="w-full py-3 text-muted-foreground hover:text-white transition-colors text-sm font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Reset View */}
            {viewState === 'otpReset' && (
                <div className={`text-center ${viewAnimation}`}>
                    <div className="bg-gradient-secondary border border-glass-border w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-glow">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
                    <p className="text-muted-foreground mb-6 text-sm">We've sent a 6-digit code to <span className="text-white font-medium">{recoveryEmail}</span></p>

                    <div className="space-y-6 text-left">
                        {/* OTP Boxes */}
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el: HTMLInputElement | null) => {
                                        otpRefs.current[index] = el;
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    disabled={isLoading}
                                    className="w-12 h-14 text-center text-xl font-bold glass-card rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all mx-auto"
                                />
                            ))}
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="New Username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                disabled={isLoading}
                            />
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all pr-12"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                    type="button"
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                                className="w-full glass-card p-3 rounded-lg bg-glass border border-glass-border text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                disabled={isLoading}
                            />
                        </div>

                        {errorMsg && <p className="text-red-400 text-sm text-center animate-in fade-in">{errorMsg}</p>}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleResetPassword}
                                disabled={isLoading}
                                className={`w-full bg-gradient-primary text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-lg shadow-glow hover:shadow-glow-accent transition-all ${shake ? 'animate-shake' : ''} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button
                                onClick={() => setViewState('login')}
                                disabled={isLoading}
                                className="w-full py-2 text-muted-foreground hover:text-white transition-colors text-sm font-medium"
                            >
                                Return to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
