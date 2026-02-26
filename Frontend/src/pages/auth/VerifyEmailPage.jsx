import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function VerifyEmailPage() {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus(token ? 'success' : 'error');
        }, 2000);
        return () => clearTimeout(timer);
    }, [token]);

    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
        if (status === 'success' && countdown === 0) {
            window.location.href = '/login';
        }
    }, [status, countdown]);

    return (
        <div className="text-center">
            {status === 'loading' && (
                <>
                    <div className="w-20 h-20 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-6">
                        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#064E3B] mb-3">Verifying your email...</h2>
                    <p className="text-[#065F46]">Please wait while we confirm your account.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-20 h-20 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-6 text-4xl animate-count-up">
                        ✅
                    </div>
                    <h2 className="text-3xl font-bold text-[#064E3B] mb-3">Email Verified!</h2>
                    <p className="text-[#065F46] mb-2">Your account has been activated successfully.</p>
                    <p className="text-[#065F46] mb-8">Redirecting to login in <span className="font-bold text-[#059669]">{countdown}s</span>...</p>
                    <Link to="/login" className="btn-primary text-sm py-2.5 px-6">
                        Continue to Login <FiArrowRight className="w-4 h-4" />
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-4xl animate-count-up">
                        ❌
                    </div>
                    <h2 className="text-3xl font-bold text-[#064E3B] mb-3">Verification Failed</h2>
                    <p className="text-[#065F46] mb-8">
                        The verification link is invalid or has expired. Please request a new verification email.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button className="btn-primary text-sm py-2.5 justify-center">Resend Verification Email</button>
                        <Link to="/login" className="btn-secondary text-sm py-2.5 justify-center">Back to Login</Link>
                    </div>
                    <p className="text-xs text-[#065F46] mt-6">
                        Need help? <a href="mailto:support@foodsave.in" className="text-[#059669] hover:underline">Contact Support</a>
                    </p>
                </>
            )}
        </div>
    );
}
