import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const tabs = ['Consumers', 'Restaurants', 'NGOs'];

const steps = {
    Consumers: [
        { icon: '📱', title: 'Create Your Account', desc: 'Sign up in 2 minutes. Just your name, email, and location.' },
        { icon: '🔍', title: 'Browse Nearby Food', desc: 'Discover quality surplus food from restaurants near you at up to 70% off.' },
        { icon: '🛒', title: 'Place Your Order', desc: 'Select items, pick a convenient pickup slot, and pay securely online.' },
        { icon: '🌟', title: 'Pick Up & Impact', desc: 'Collect your food, track your personal impact, earn badges and rewards.' },
    ],
    Restaurants: [
        { icon: '📋', title: 'Register Your Business', desc: 'Sign up with your FSSAI license. Verification takes 24-48 hours.' },
        { icon: '📸', title: 'List Surplus Food', desc: 'Photograph and describe your unsold items. Set prices and pickup windows.' },
        { icon: '🔔', title: 'Receive Orders', desc: 'Get notified instantly when consumers claim your listings.' },
        { icon: '📊', title: 'Track & Earn', desc: 'See your waste reduction stats, earnings, and sustainability score.' },
    ],
    NGOs: [
        { icon: '🏛️', title: 'Register Your NGO', desc: 'Submit registration certificate and 12A/80G documents for verification.' },
        { icon: '🍱', title: 'Browse Donations', desc: 'Access free or heavily subsidized food listed by partner restaurants.' },
        { icon: '🚐', title: 'Coordinate Pickup', desc: 'Schedule bulk pickups according to your capacity.' },
        { icon: '📈', title: 'Track Beneficiaries', desc: 'Generate reports on meals served and food received for donors.' },
    ],
};

const benefits = {
    Consumers: [
        'Save 50–70% on restaurant-quality food',
        'Reduce personal food waste and carbon footprint',
        'Discover new restaurants in your area',
        'Earn impact badges and rewards',
        'Support local businesses and communities',
    ],
    Restaurants: [
        'Recover revenue from food that would be discarded',
        'Reduce waste disposal costs',
        'Build a sustainability brand and green reputation',
        'Tax benefits for food donations to NGOs',
        'Access to 50,000+ eco-conscious consumers',
    ],
    NGOs: [
        'Access surplus food at zero or minimal cost',
        'Transparent supply chain with verified restaurants',
        'Automated reporting for donors and authorities',
        'Connect with corporate CSR food drives',
        'Scale your feeding programs without extra fundraising',
    ],
};

const faqs = [
    { q: 'Is the food safe to eat?', a: 'Yes. All our partner restaurants are FSSAI licensed. Food is listed with accurate expiry times and pickup timelines.' },
    { q: 'How is the price decided?', a: 'Restaurants set their own prices. Food is typically priced at 40–70% of original value, with a small platform fee for operations.' },
    { q: 'What if I can\'t make the pickup?', a: "You can cancel orders free of charge up to 1 hour before pickup. After that, a small cancellation fee may apply based on the restaurant's policy." },
    { q: 'How do NGOs qualify for free food?', a: 'Verified NGOs with valid registration get access to a separate donation feed where they can claim food at zero cost, depending on restaurant availability.' },
    { q: 'Can I donate to NGOs directly?', a: 'Yes! As a consumer, you can choose to "donate" any listing you claim to a partner NGO at checkout. The NGO collects it on your behalf.' },
];

export default function HowItWorksPage() {
    const [activeTab, setActiveTab] = useState('Consumers');
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="gradient-hero py-20 text-center relative overflow-hidden">
                <div className="hero-blob w-72 h-72 bg-[#10B981] -top-20 right-10" />
                <div className="relative z-10 max-w-3xl mx-auto px-4">
                    <span className="badge bg-white/20 text-white mb-4">Simple Process</span>
                    <h1 className="text-5xl font-bold text-white mb-4">How FoodSave Works</h1>
                    <p className="text-xl text-white/80">From finding food to making impact — everything explained step by step.</p>
                </div>
            </section>

            {/* Tabs */}
            <section className="py-20 bg-[#ECFDF5]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex justify-center gap-3 mb-14">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Steps */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                        {steps[activeTab].map(({ icon, title, desc }, i) => (
                            <div key={title} className="card p-6 text-center animate-fade-in">
                                <div className="w-16 h-16 rounded-2xl bg-[#D1FAE5] flex items-center justify-center text-3xl mx-auto mb-4">{icon}</div>
                                <div className="w-6 h-6 rounded-full bg-[#059669] text-white text-xs font-bold mx-auto mb-3 flex items-center justify-center">{i + 1}</div>
                                <h3 className="font-bold text-[#064E3B] mb-2">{title}</h3>
                                <p className="text-sm text-[#065F46] leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Benefits */}
                    <div className="card p-8">
                        <h3 className="text-xl font-bold text-[#064E3B] mb-5">Benefits for {activeTab}</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {benefits[activeTab].map(benefit => (
                                <div key={benefit} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-[#059669]" />
                                    </div>
                                    <span className="text-sm text-[#064E3B]">{benefit}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <Link
                                to="/register"
                                className="btn-primary text-sm"
                            >
                                Join as {activeTab.slice(0, -1)} <FiArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="badge badge-green mb-3">FAQs</span>
                        <h2 className="text-4xl font-bold text-[#064E3B]">Common Questions</h2>
                        <div className="section-divider" />
                    </div>
                    <div className="space-y-3">
                        {faqs.map(({ q, a }, i) => (
                            <div key={i} className="card-flat overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[#F0FDF4] transition-colors"
                                >
                                    <span className="font-semibold text-[#064E3B] pr-4">{q}</span>
                                    {openFaq === i
                                        ? <FiChevronUp className="w-5 h-5 text-[#059669] shrink-0" />
                                        : <FiChevronDown className="w-5 h-5 text-[#065F46] shrink-0" />
                                    }
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-5 text-sm text-[#065F46] leading-relaxed border-t border-[#D1FAE5] pt-4 animate-fade-in">
                                        {a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
