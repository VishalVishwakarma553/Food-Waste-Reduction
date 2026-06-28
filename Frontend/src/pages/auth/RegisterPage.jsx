import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const roles = [
    { id: 'consumer', label: 'Consumer', icon: '🛒', desc: 'Browse and claim surplus food at discounted prices' },
    { id: 'restaurant', label: 'Restaurant / Store', icon: '🏪', desc: 'List your surplus food and earn while reducing waste' },
    { id: 'ngo', label: 'NGO', icon: '🤝', desc: 'Access free food donations for your beneficiaries' },
];

const cuisineOptions = [
    'North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian',
    'Mexican', 'Fast Food', 'Bakery & Cafe', 'Street Food', 'Multi-Cuisine', 'Other',
];

const indiaStates = [
    'Andhra Pradesh', 'Delhi', 'Goa', 'Gujarat', 'Karnataka',
    'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'West Bengal',
];

// Step labels per role
const STEPS = {
    consumer:   ['Choose Role', 'Your Info',      'Location', 'Review'],
    restaurant: ['Choose Role', 'Business Info',  'Location', 'Review'],
    ngo:        ['Choose Role', 'Organisation',   'Location', 'Review'],
};

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [data, setData] = useState({
        role: '',
        // Consumer / common
        name: '', email: '', phone: '', password: '', confirm: '',
        // Restaurant-specific
        businessName: '', cuisineType: '',
        // NGO-specific
        ngoRegNumber: '', contactPerson: '',
        // Location
        address: '', city: '', state: '', pincode: '',
        // T&C
        accepted: false,
    });

    const update = (field, val) => setData(d => ({ ...d, [field]: val }));
    const stepLabels = STEPS[data.role] || STEPS.consumer;
    const totalSteps = stepLabels.length;

    const validate = () => {
        const e = {};
        if (step === 0 && !data.role) e.role = 'Please select a role.';

        if (step === 1) {
            if (data.role === 'restaurant') {
                if (!data.businessName.trim()) e.businessName = 'Business name is required.';
                if (!data.cuisineType) e.cuisineType = 'Please select a cuisine type.';
                if (!data.name.trim()) e.name = "Owner's name is required.";
            } else if (data.role === 'ngo') {
                if (!data.businessName.trim()) e.businessName = 'Organisation name is required.';
                if (!data.ngoRegNumber.trim()) e.ngoRegNumber = 'Registration number is required.';
                if (!data.contactPerson.trim()) e.contactPerson = 'Contact person name is required.';
            } else {
                if (!data.name.trim()) e.name = 'Full name is required.';
            }
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

        if (step === totalSteps - 1 && !data.accepted) e.accepted = 'You must accept the terms to proceed.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validate()) setStep(s => Math.min(s + 1, totalSteps - 1)); };
    const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)); };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        setApiError('');

        const isRestaurant = data.role === 'restaurant';
        const isNgo        = data.role === 'ngo';

        const payload = {
            role:          data.role,
            email:         data.email,
            phone:         data.phone,
            password:      data.password,
            address:       data.address,
            city:          data.city,
            state:         data.state,
            pincode:       data.pincode,
            // Human contact name stored in `name` column
            name:          isRestaurant ? data.name          // owner name
                         : isNgo        ? data.contactPerson // contact person
                         : data.name,                        // consumer name
            // Business / org trade name (null for consumers)
            businessName:  isRestaurant ? data.businessName
                         : isNgo        ? data.businessName
                         : null,
            // Restaurant-only columns
            cuisineType:   isRestaurant ? data.cuisineType   : null,
            // NGO-only columns
            ngoRegNumber:  isNgo        ? data.ngoRegNumber  : null,
            contactPerson: isNgo        ? data.contactPerson : null,
        };
        try {
            await register(payload);
            if (data.role === 'restaurant') {
                navigate('/restaurant/dashboard');
            } else if (data.role === 'ngo') {
                navigate('/ngo/dashboard');
            } else {
                navigate('/consumer/dashboard');
            }
        } catch (err) {
            setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passLen = data.password.length;
    const strength = passLen >= 8 && /[A-Z]/.test(data.password) && /\d/.test(data.password) ? 'Strong'
        : passLen >= 6 ? 'Medium' : passLen > 0 ? 'Weak' : '';
    const strengthPct = { Strong: '100%', Medium: '60%', Weak: '30%', '': '0%' }[strength];
    const strengthColor = { Strong: '#059669', Medium: '#F59E0B', Weak: '#EF4444' }[strength];

    // Review rows depend on role
    const reviewRows = [
        data.role === 'restaurant' && { label: 'Business', value: data.businessName },
        data.role === 'restaurant' && { label: 'Cuisine', value: data.cuisineType },
        data.role === 'ngo' && { label: 'Organisation', value: data.businessName },
        data.role === 'ngo' && { label: 'Reg. No.', value: data.ngoRegNumber },
        data.role === 'ngo' && { label: 'Contact', value: data.contactPerson },
        { label: 'Role', value: roles.find(r => r.id === data.role)?.label },
        { label: data.role === 'restaurant' ? 'Owner' : 'Name', value: data.name },
        { label: 'Email', value: data.email },
        { label: 'Phone', value: data.phone },
        { label: 'Location', value: `${data.address}, ${data.city}, ${data.state} – ${data.pincode}` },
    ].filter(Boolean);

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-3xl font-bold text-[#064E3B] mb-1">Create Account</h2>
                <p className="text-[#065F46] text-sm">
                    {data.role === 'restaurant' ? 'List your surplus food and reduce waste.' :
                     data.role === 'ngo' ? 'Access food donations for your community.' :
                     'Join FoodSave. Free forever for consumers.'}
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-start mb-8 gap-0">
                {stepLabels.map((s, i) => (
                    <div key={s} className="flex items-start flex-1 last:flex-none">
                        <div className="flex flex-col items-center w-8">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                                i < step ? 'bg-[#059669] text-white' :
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
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                                data.role === r.id
                                    ? 'border-[#059669] bg-[#F0FDF4] shadow-md'
                                    : 'border-[#D1FAE5] bg-white hover:border-[#10B981]'
                            }`}
                        >
                            <span className="text-3xl">{r.icon}</span>
                            <div>
                                <p className="font-bold text-[#064E3B] text-sm">{r.label}</p>
                                <p className="text-xs text-[#065F46] mt-0.5">{r.desc}</p>
                            </div>
                            {data.role === r.id && <FiCheckCircle className="ml-auto text-[#059669] w-5 h-5 shrink-0" />}
                        </button>
                    ))}
                    {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                </div>
            )}

            {/* ── Step 1: Role-aware Info ── */}
            {step === 1 && (
                <div className="space-y-4 animate-fade-in">

                    {/* ── RESTAURANT fields ── */}
                    {data.role === 'restaurant' && (<>
                        <div className="flex items-center gap-2 p-3 bg-[#F0FDF4] border border-[#D1FAE5] rounded-xl mb-1">
                            <span className="text-xl">🏪</span>
                            <p className="text-sm font-semibold text-[#064E3B]">Restaurant / Store Details</p>
                        </div>
                        <Field label="Business / Restaurant Name" error={errors.businessName}>
                            <input value={data.businessName} onChange={e => update('businessName', e.target.value)}
                                className={`input-field ${errors.businessName ? 'error' : ''}`} placeholder="Spice Garden Restaurant" />
                        </Field>
                        <Field label="Owner / Manager Name" error={errors.name}>
                            <input value={data.name} onChange={e => update('name', e.target.value)}
                                className={`input-field ${errors.name ? 'error' : ''}`} placeholder="Rajesh Kumar" />
                        </Field>
                    </>)}

                    {/* ── NGO fields ── */}
                    {data.role === 'ngo' && (<>
                        <div className="flex items-center gap-2 p-3 bg-[#F0FDF4] border border-[#D1FAE5] rounded-xl mb-1">
                            <span className="text-xl">🤝</span>
                            <p className="text-sm font-semibold text-[#064E3B]">Organisation Details</p>
                        </div>
                        <Field label="Organisation Name" error={errors.businessName}>
                            <input value={data.businessName} onChange={e => update('businessName', e.target.value)}
                                className={`input-field ${errors.businessName ? 'error' : ''}`} placeholder="Seva Foundation" />
                        </Field>
                        <Field label="Registration Number" error={errors.ngoRegNumber}>
                            <input value={data.ngoRegNumber} onChange={e => update('ngoRegNumber', e.target.value)}
                                className={`input-field ${errors.ngoRegNumber ? 'error' : ''}`} placeholder="MH/2015/0012345" />
                        </Field>
                        <Field label="Contact Person Name" error={errors.contactPerson}>
                            <input value={data.contactPerson} onChange={e => update('contactPerson', e.target.value)}
                                className={`input-field ${errors.contactPerson ? 'error' : ''}`} placeholder="Anita Sharma" />
                        </Field>
                    </>)}

                    {/* ── CONSUMER fields ── */}
                    {data.role === 'consumer' && (
                        <Field label="Full Name" error={errors.name}>
                            <input value={data.name} onChange={e => update('name', e.target.value)}
                                className={`input-field ${errors.name ? 'error' : ''}`} placeholder="Arjun Krishnan" />
                        </Field>
                    )}

                    {/* ── Common fields (all roles) ── */}
                    <Field label="Email Address" error={errors.email}>
                        <input type="email" value={data.email} onChange={e => update('email', e.target.value)}
                            className={`input-field ${errors.email ? 'error' : ''}`} placeholder="you@email.com" />
                    </Field>
                    <Field label="Phone Number" error={errors.phone}>
                        <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value)}
                            className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="9876543210" maxLength={10} />
                    </Field>
                    <Field label="Password" error={errors.password}>
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
                    </Field>
                    <Field label="Confirm Password" error={errors.confirm}>
                        <input type="password" value={data.confirm} onChange={e => update('confirm', e.target.value)}
                            className={`input-field ${errors.confirm ? 'error' : ''}`} placeholder="Repeat password" />
                    </Field>

                    {/* Cuisine type — restaurant only, shown last */}
                    {data.role === 'restaurant' && (
                        <Field label="Cuisine Type" error={errors.cuisineType}>
                            <select value={data.cuisineType} onChange={e => update('cuisineType', e.target.value)}
                                className={`input-field cursor-pointer ${errors.cuisineType ? 'error' : ''}`}>
                                <option value="">Select cuisine type</option>
                                {cuisineOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                    )}
                </div>
            )}

            {/* ── Step 2: Location ── */}
            {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 p-3 bg-[#F0FDF4] border border-[#D1FAE5] rounded-xl">
                        <span className="text-xl">📍</span>
                        <p className="text-sm font-semibold text-[#064E3B]">
                            {data.role === 'restaurant' ? 'Restaurant Location' :
                             data.role === 'ngo' ? 'Organisation Location' : 'Your Location'}
                        </p>
                    </div>
                    <Field label="Street Address" error={errors.address}>
                        <textarea value={data.address} onChange={e => update('address', e.target.value)}
                            className={`input-field resize-none h-20 ${errors.address ? 'error' : ''}`}
                            placeholder="14, 2nd Cross, Indiranagar..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="City" error={errors.city}>
                            <input value={data.city} onChange={e => update('city', e.target.value)}
                                className={`input-field ${errors.city ? 'error' : ''}`} placeholder="Bengaluru" />
                        </Field>
                        <Field label="Pincode" error={errors.pincode}>
                            <input value={data.pincode} onChange={e => update('pincode', e.target.value)}
                                className={`input-field ${errors.pincode ? 'error' : ''}`} placeholder="560038" maxLength={6} />
                        </Field>
                    </div>
                    <Field label="State" error={errors.state}>
                        <select value={data.state} onChange={e => update('state', e.target.value)}
                            className={`input-field cursor-pointer ${errors.state ? 'error' : ''}`}>
                            <option value="">Select state</option>
                            {indiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>
                </div>
            )}

            {/* ── Step 3: Review ── */}
            {step === totalSteps - 1 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="card-flat p-5 space-y-3">
                        <h3 className="font-bold text-[#064E3B] mb-3">Review Your Details</h3>
                        {reviewRows.map(({ label, value }) => (
                            <div key={label} className="flex gap-3 text-sm">
                                <span className="text-[#065F46] w-24 shrink-0">{label}:</span>
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

                    <div className={`rounded-2xl p-4 text-white text-center ${
                        data.role === 'restaurant' ? 'bg-gradient-to-r from-[#059669] to-[#0891B2]' :
                        data.role === 'ngo' ? 'bg-gradient-to-r from-[#7C3AED] to-[#059669]' :
                        'bg-gradient-to-r from-[#059669] to-[#0891B2]'
                    }`}>
                        <p className="font-bold text-lg">
                            {data.role === 'restaurant' ? "🏪 Ready to list your surplus food?" :
                             data.role === 'ngo' ? "🤝 Ready to feed your community?" :
                             "You're about to join 52,000+ Food Savers!"}
                        </p>
                        <p className="text-white/80 text-sm mt-1">Together we've saved 2.4 tonnes of food. Ready to add to that?</p>
                    </div>
                </div>
            )}

            {/* API error */}
            {apiError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-4 text-red-600 text-sm">
                    <FiAlertCircle className="shrink-0 w-4 h-4" />
                    {apiError}
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-4">
                {step > 0 && (
                    <button onClick={back} className="btn-secondary flex-1 justify-center py-3 text-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back
                    </button>
                )}
                {step < totalSteps - 1 ? (
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
