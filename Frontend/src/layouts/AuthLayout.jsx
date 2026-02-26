import { Outlet, Link } from 'react-router-dom';
import { FiFeather } from 'react-icons/fi';


export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-[#ECFDF5] flex">
            {/* Left Panel – Branding */}
            <div className="hidden lg:flex lg:w-5/12 gradient-hero flex-col justify-between p-12 relative overflow-hidden">
                {/* Blob decorations */}
                <div className="absolute top-20 right-10 w-60 h-60 bg-[#10B981]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#0891B2]/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <FiFeather className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-2xl text-white" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                            FoodSave
                        </span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                        Rescue Food.<br />Feed People.<br />Heal the Planet.
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-10">
                        Join 52,000+ Indians rescuing surplus food from restaurants — completely <strong className="text-white">free of charge</strong>. Reserve online, pick up in person.
                    </p>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { value: '2.4 MT', label: 'Food Rescued' },
                            { value: '12L+', label: 'Free Meals Shared' },
                            { value: '4,200+', label: 'Donor Partners' },
                        ].map(({ value, label }) => (
                            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-white/70 text-xs mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    {['FSSAI Certified', 'SSL Secured', 'RBI Compliant'].map((cert) => (
                        <div key={cert} className="bg-white/10 rounded-full px-3 py-1.5 text-white/80 text-xs font-medium flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" /> {cert}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel – Form */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Logo */}
                <div className="lg:hidden p-6 border-b border-[#D1FAE5]">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <FiFeather className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-xl text-[#064E3B]" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                            Food<span className="text-[#059669]">Save</span>
                        </span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}


