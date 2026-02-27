import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            const loggedInUser = await login(form.email, form.password);

            if (loggedInUser.role === 'restaurant') {
                navigate('/restaurant/dashboard');
            } else {
                navigate('/consumer/dashboard');
            }

        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#064E3B] mb-2">Welcome Back!</h2>
                <p className="text-[#065F46]">Sign in to continue saving food and making impact.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-start gap-2">
                    <FiAlertCircle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="flex items-center justify-center gap-2 bg-white border-2 border-[#D1FAE5] rounded-xl py-2.5 text-sm font-medium text-[#064E3B] hover:border-[#059669] hover:bg-[#F0FDF4] transition-all cursor-pointer">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                </button>
                <button className="flex items-center justify-center gap-2 bg-[#1877F2] border-2 border-[#1877F2] rounded-xl py-2.5 text-sm font-medium text-white hover:bg-[#166FE5] transition-all cursor-pointer">
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#D1FAE5]" /></div>
                <div className="relative flex justify-center"><span className="px-4 bg-[#ECFDF5] text-xs text-[#065F46]">or continue with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-[#064E3B] mb-2">Email Address</label>
                    <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#059669] w-5 h-5" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="you@email.com"
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-[#064E3B]">Password</label>
                        <Link to="/forgot-password" className="text-sm text-[#059669] hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#059669] w-5 h-5" />
                        <input
                            type={showPass ? 'text' : 'password'}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="input-field pl-10 pr-10"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#065F46] cursor-pointer">
                            {showPass ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={form.remember}
                        onChange={e => setForm({ ...form, remember: e.target.checked })}
                        className="custom-checkbox w-4 h-4 rounded"
                    />
                    <label htmlFor="remember" className="text-sm text-[#065F46] cursor-pointer">Remember me for 30 days</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center text-base py-3"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-sm text-[#065F46] mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#059669] font-semibold hover:underline">Create one free</Link>
            </p>
        </div>
    );
}
