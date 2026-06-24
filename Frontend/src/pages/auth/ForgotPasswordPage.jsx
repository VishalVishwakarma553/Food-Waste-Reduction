import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);

    const startTimer = () => {
        setTimer(60);
        const i = setInterval(() => {
            setTimer(t => { if (t <= 1) { clearInterval(i); return 0; } return t - 1; });
        }, 1000);
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            // ponytail: OTP in response for dev — remove once email service is wired
            toast.success(`OTP sent! (Dev: ${data.otp})`);
            setStep(2);
            startTimer();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp: otp.join('') });
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword: newPass });
            setStep(4);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Reset failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (val, idx) => {
        if (!/^\d?$/.test(val)) return;
        const arr = [...otp];
        arr[idx] = val;
        setOtp(arr);
        if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    };

    const strength = newPass.length >= 8 && /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) ? 'Strong' : newPass.length >= 6 ? 'Medium' : newPass.length > 0 ? 'Weak' : '';
    const strengthColor = strength === 'Strong' ? 'text-[#059669]' : strength === 'Medium' ? 'text-amber-600' : 'text-red-600';

    return (
        <div>
            {/* Step 1: Email */}
            {step === 1 && (
                <>
                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                            <FiMail className="text-white w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#064E3B] mb-2">Forgot Password?</h2>
                        <p className="text-[#065F46]">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
                    </div>
                    <form onSubmit={sendOtp} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="input-field"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <>Send OTP <FiArrowRight className="w-4 h-4" /></>
                            }
                        </button>
                    </form>
                    <p className="text-center text-sm text-[#065F46] mt-6">
                        <Link to="/login" className="text-[#059669] font-semibold hover:underline">← Back to Login</Link>
                    </p>
                </>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
                <>
                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] flex items-center justify-center mb-4 text-2xl">📱</div>
                        <h2 className="text-3xl font-bold text-[#064E3B] mb-2">Enter OTP</h2>
                        <p className="text-[#065F46]">We sent a 6-digit code to <span className="font-semibold text-[#064E3B]">{email}</span></p>
                    </div>
                    <form onSubmit={verifyOtp} className="space-y-6">
                        <div className="flex gap-3 justify-center">
                            {otp.map((val, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={val}
                                    onChange={e => handleOtpChange(e.target.value, i)}
                                    className="w-12 h-14 text-center text-xl font-bold border-2 border-[#D1FAE5] rounded-xl outline-none focus:border-[#059669] text-[#064E3B] transition-colors"
                                />
                            ))}
                        </div>
                        <p className="text-center text-sm text-[#065F46]">
                            {timer > 0
                                ? <>Resend in <span className="font-semibold text-[#064E3B]">{timer}s</span></>
                                : <button type="button" onClick={sendOtp} className="text-[#059669] font-semibold hover:underline cursor-pointer">Resend OTP</button>
                            }
                        </p>
                        <button type="submit" disabled={loading || otp.join('').length < 6} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify OTP'}
                        </button>
                    </form>
                </>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
                <>
                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] flex items-center justify-center mb-4 text-2xl">🔐</div>
                        <h2 className="text-3xl font-bold text-[#064E3B] mb-2">Create New Password</h2>
                        <p className="text-[#065F46]">Your new password must be at least 8 characters long.</p>
                    </div>
                    <form onSubmit={resetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-2">New Password</label>
                            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="input-field" placeholder="••••••••" required />
                            {strength && (
                                <p className={`text-xs mt-1.5 font-semibold ${strengthColor}`}>
                                    Password strength: {strength}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-2">Confirm Password</label>
                            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="input-field" placeholder="••••••••" required />
                            {confirmPass && newPass !== confirmPass && (
                                <p className="text-xs mt-1.5 text-red-600">Passwords do not match</p>
                            )}
                        </div>
                        <button type="submit" disabled={loading || newPass !== confirmPass} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
                        </button>
                    </form>
                </>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-6 text-4xl animate-count-up">
                        ✅
                    </div>
                    <h2 className="text-3xl font-bold text-[#064E3B] mb-3">Password Reset!</h2>
                    <p className="text-[#065F46] mb-8">Your password has been updated successfully. You can now login with your new password.</p>
                    <Link to="/login" className="btn-primary text-base py-3 px-8">
                        Go to Login <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
