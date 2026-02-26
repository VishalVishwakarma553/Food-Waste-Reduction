import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const roles = [
    { id: 'consumer', label: 'Consumer', icon: '🛒', desc: 'Browse and claim surplus food at discounted prices' },
    { id: 'restaurant', label: 'Restaurant / Store', icon: '🏪', desc: 'List your surplus food and earn while reducing waste' },
    { id: 'ngo', label: 'NGO', icon: '🤝', desc: 'Access free food donations for your beneficiaries' },
];

const stepLabels = ['Choose Role', 'Basic Info', 'Location', 'Review'];
const indiaStates = ['Andhra Pradesh', 'Delhi', 'Goa', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [data, setData] = useState({
        role: '', name: '', email: '', phone: '', password: '', confirm: '',
        address: '', city: '', state: '', pincode: '', accepted: false,
    });

    const update = (field, val) => setData(d => ({ ...d, [field]: val }));

    const validate = () => {
        const e = {};
        if (step === 0 && !data.role) e.role = 'Please select a role.';
        if (step === 1) {
            if (!data.name.trim()) e.name = 'Name is required.';
            if (!data.email.includes('@')) e.email = 'Valid email is required.';
            if (!/^\d{10}$/.test(data.phone)) e.phone = '10-digit phone number required.';
            if (data.password.length < 8) e.password = 'Minimum 8 characters required.';
            if (data.password !== data.confirm) e.confirm = 'Passwords do not match.';
        }
        if (step === 2) {
            if (!data.address.trim()) e.address = 'Address is required.';
            if (!data.city.trim()) e.city = 'City is required.';
            if (!data.state) e.state = 'Please select a state.';
            if (!/^\d{6}$/.test(data.pincode)) e.pincode = '6-digit pincode required.';
        }
        if (step === 3 && !data.accepted) e.accepted = 'You must accept the terms to proceed.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validate()) setStep(s => Math.min(s + 1, stepLabels.length - 1)); };
    const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)); };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await register(data);
            navigate('/consumer/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const passLen = data.password.length;
    const strength = passLen >= 8 && /[A-Z]/.test(data.password) && /\d/.test(data.password) ? 'Strong'
        : passLen >= 6 ? 'Medium'
            : passLen > 0 ? 'Weak' : '';
    const strengthPct = { Strong: '100%', Medium: '60%', Weak: '30%', '': '0%' }[strength];
    const strengthColor = { Strong: '#059669', Medium: '#F59E0B', Weak: '#EF4444' }[strength];

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-3xl font-bold text-[#064E3B] mb-1">Create Account</h2>
                <p className="text-[#065F46] text-sm">Join FoodSave. Free forever for consumers.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-start mb-8 gap-0">
                {stepLabels.map((s, i) => (
                    <div key={s} className="flex items-start flex-1 last:flex-none">
                        <div className="flex flex-col items-center w-8">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${i < step ? 'bg-[#059669] text-white' :
                                i === step ? 'bg-[#059669] text-white ring-4 ring-[#D1FAE5]' :
                                    'bg-[#D1FAE5] text-[#065F46]'
                                }`}>
                                {i < step ? <FiCheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${i === step ? 'text-[#059669]' : 'text-[#065F46]'}`}>{s}</span>
                        </div>
                        {i < stepLabels.length - 1 && (
                            <div className={`h-0.5 flex-1 mt-4 mx-1 rounded-full ${i < step ? 'bg-[#059669]' : 'bg-[#D1FAE5]'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Step 0: Role ── */}
            {step === 0 && (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-sm font-semibold text-[#064E3B] mb-3">I want to join as:</p>
                    {roles.map(r => (
                        <button
                            key={r.id}
                            onClick={() => update('role', r.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${data.role === r.id
                                ? 'border-[#059669] bg-[#F0FDF4] shadow-md'
                                : 'border-[#D1FAE5] bg-white hover:border-[#10B981]'
                                }`}
                        >
                            <span className="text-3xl">{r.icon}</span>
                            <div>
                                <p className="font-bold text-[#064E3B] text-sm">{r.label}</p>
                                <p className="text-xs text-[#065F46] mt-0.5">{r.desc}</p>
                            </div>
                            {data.role === r.id && (
                                <FiCheckCircle className="ml-auto text-[#059669] w-5 h-5 shrink-0" />
                            )}
                        </button>
                    ))}
                    {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                </div>
            )}

            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Full Name</label>
                        <input value={data.name} onChange={e => update('name', e.target.value)}
                            className={`input-field ${errors.name ? 'error' : ''}`} placeholder="Arjun Krishnan" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Email Address</label>
                        <input type="email" value={data.email} onChange={e => update('email', e.target.value)}
                            className={`input-field ${errors.email ? 'error' : ''}`} placeholder="you@email.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Phone Number</label>
                        <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value)}
                            className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="9876543210" maxLength={10} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Password</label>
                        <div className="relative">
                            <input type={showPass ? 'text' : 'password'} value={data.password}
                                onChange={e => update('password', e.target.value)}
                                className={`input-field pr-10 ${errors.password ? 'error' : ''}`} placeholder="Minimum 8 characters" />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#065F46] cursor-pointer text-xs">
                                {showPass ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {strength && (
                            <div className="mt-2">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: strengthPct, background: strengthColor }} />
                                </div>
                                <p className="text-xs mt-1 font-semibold" style={{ color: strengthColor }}>Password: {strength}</p>
                            </div>
                        )}
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Confirm Password</label>
                        <input type="password" value={data.confirm} onChange={e => update('confirm', e.target.value)}
                            className={`input-field ${errors.confirm ? 'error' : ''}`} placeholder="Repeat password" />
                        {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                    </div>
                </div>
            )}

            {/* ── Step 2: Location ── */}
            {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Street Address</label>
                        <textarea value={data.address} onChange={e => update('address', e.target.value)}
                            className={`input-field resize-none h-20 ${errors.address ? 'error' : ''}`}
                            placeholder="14, 2nd Cross, Indiranagar..." />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">City</label>
                            <input value={data.city} onChange={e => update('city', e.target.value)}
                                className={`input-field ${errors.city ? 'error' : ''}`} placeholder="Bengaluru" />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Pincode</label>
                            <input value={data.pincode} onChange={e => update('pincode', e.target.value)}
                                className={`input-field ${errors.pincode ? 'error' : ''}`} placeholder="560038" maxLength={6} />
                            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">State</label>
                        <select value={data.state} onChange={e => update('state', e.target.value)}
                            className={`input-field cursor-pointer ${errors.state ? 'error' : ''}`}>
                            <option value="">Select state</option>
                            {indiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div className="bg-[#F0FDF4] border border-[#D1FAE5] rounded-xl p-4 text-sm text-[#065F46]">
                        📍 Your location helps us show nearby food listings across the FoodSave platform.
                    </div>
                </div>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="card-flat p-5 space-y-3">
                        <h3 className="font-bold text-[#064E3B] mb-3">Review Your Details</h3>
                        {[
                            { label: 'Role', value: roles.find(r => r.id === data.role)?.label },
                            { label: 'Name', value: data.name },
                            { label: 'Email', value: data.email },
                            { label: 'Phone', value: data.phone },
                            { label: 'Address', value: `${data.address}, ${data.city}, ${data.state} – ${data.pincode}` },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex gap-3 text-sm">
                                <span className="text-[#065F46] w-20 shrink-0">{label}:</span>
                                <span className="text-[#064E3B] font-medium">{value}</span>
                            </div>
                        ))}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={data.accepted} onChange={e => update('accepted', e.target.checked)}
                            className="custom-checkbox w-4 h-4 rounded mt-0.5 shrink-0" />
                        <span className="text-sm text-[#065F46]">
                            I agree to FoodSave's{' '}
                            <Link to="/terms" className="text-[#059669] hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-[#059669] hover:underline">Privacy Policy</Link>.
                            I consent to receiving order and impact notifications.
                        </span>
                    </label>
                    {errors.accepted && <p className="text-red-500 text-xs">{errors.accepted}</p>}

                    {/* Impact preview */}
                    <div className="bg-gradient-to-r from-[#059669] to-[#0891B2] rounded-2xl p-4 text-white text-center">
                        <p className="font-bold text-lg">You're about to join 52,000+ Food Savers!</p>
                        <p className="text-white/80 text-sm mt-1">Together we've saved 2.4 tonnes of food. Ready to add to that?</p>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
                {step > 0 && (
                    <button onClick={back} className="btn-secondary flex-1 justify-center py-3 text-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back
                    </button>
                )}
                {step < stepLabels.length - 1 ? (
                    <button onClick={next} className="btn-primary flex-1 justify-center py-3 text-sm">
                        Continue <FiArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={submit} disabled={loading} className="btn-primary flex-1 justify-center py-3 text-sm">
                        {loading
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <>Create Account <FiArrowRight className="w-4 h-4" /></>
                        }
                    </button>
                )}
            </div>

            <p className="text-center text-sm text-[#065F46] mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-[#059669] font-semibold hover:underline">Sign In</Link>
            </p>
        </div>
    );
}
