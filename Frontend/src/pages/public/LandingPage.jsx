import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiCheckCircle, FiMapPin, FiFeather } from 'react-icons/fi';
import { Leaf, Utensils, Store, Users, ShoppingBag, Globe, HandHeart } from 'lucide-react';

import FoodCard from '../../components/shared/FoodCard';
import { mockFoodItems, mockTestimonials } from '../../data/mockData';

// Animated counter
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = Date.now();
                const step = () => {
                    const elapsed = Date.now() - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 4);
                    setCount(Math.round(target * eased));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [target, duration]);

    return <span ref={ref} className="impact-counter">{count.toLocaleString()}{suffix}</span>;
}

const impactStats = [
    { label: 'Tonnes of Food Rescued', target: 2430, suffix: 'T', icon: Leaf },
    { label: 'Free Meals Shared', target: 1200000, suffix: '+', icon: Utensils },
    { label: 'Donor Restaurants', target: 4200, suffix: '+', icon: Store },
    { label: 'Community Members', target: 52000, suffix: '+', icon: Users },
];

const howItWorks = [
    {
        step: '01',
        title: 'Restaurants List Surplus',
        desc: 'Restaurants, stores, or home donors post their end-of-day leftover food — completely free for the community to claim.',
        icon: Store,
    },
    {
        step: '02',
        title: 'Reserve Your Food',
        desc: 'Browse nearby listings, choose what you need, and reserve it in seconds. No payment needed — it is always free.',
        icon: ShoppingBag,
    },
    {
        step: '03',
        title: 'Pick Up from the Donor',
        desc: 'Go to the restaurant or donor address at the pickup time to collect your food. Zero waste, zero cost — real community impact.',
        icon: Globe,
    },
];

const partnerLogos = [
    { name: 'Zomato', url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg' },
    { name: 'Swiggy', url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.svg' },
    { name: 'UN WFP', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/World_Food_Programme_Logo.svg' },
    { name: 'BigBasket', url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/BigBasket_Logo.svg' },
    { name: 'Zepto', url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Zepto_Logo.svg' },
    { name: 'FSSAI', url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Fssai_logo.svg' },
];

export default function LandingPage() {
    return (
        <div className="overflow-x-hidden">
            {/* ========== HERO ========== */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 gradient-hero" />
                <div className="hero-blob w-96 h-96 bg-[#10B981] top-10 right-20" />
                <div className="hero-blob w-72 h-72 bg-[#0891B2] bottom-20 left-10" />
                <div className="hero-blob w-52 h-52 bg-[#F59E0B] top-1/2 right-1/3" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
                            <FiFeather className="text-[#10B981] w-4 h-4" />
                            <span className="text-white/90 text-sm font-medium">India's Free Food Rescue Platform</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
                            Rescue Food.<br />
                            <span className="text-[#10B981]">Feed People.</span><br />
                            <span style={{ background: 'linear-gradient(90deg,#FCD34D,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Heal the Planet.</span>
                        </h1>

                        <p className="text-xl text-white/80 leading-relaxed mb-8 animate-fade-in-up delay-200">
                            Restaurants list their end-of-day surplus food here. You browse, reserve, and <strong className="text-white">pick it up for free</strong>.
                            No payment. No waste. Just community.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 flex gap-2 mb-8 shadow-2xl animate-fade-in-up delay-300">
                            <div className="flex items-center gap-2 flex-1 px-3">
                                <FiMapPin className="text-[#059669] w-5 h-5 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Enter your area (e.g., Koramangala, Bengaluru)"
                                    className="flex-1 outline-none text-sm text-[#064E3B] placeholder-[#065F46]/50 bg-transparent py-2"
                                />
                            </div>
                            <Link
                                to="/browse"
                                className="btn-primary text-sm px-6 shrink-0"
                            >
                                Find Free Food <FiArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-4 animate-fade-in-up delay-400">
                            {[
                                { icon: FiCheckCircle, text: 'Always 100% Free' },
                                { icon: FiCheckCircle, text: 'FSSAI Certified Partners' },
                                { icon: FiCheckCircle, text: 'Real-time Listings' },
                            ].map(
                                ({ icon: Icon, text }) => (
                                    // eslint-disable-next-line no-unused-vars
                                    <div key={text} className="flex items-center gap-2 text-white/80 text-sm">
                                        <Icon className="w-4 h-4 text-[#10B981]" />
                                        {text}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Right – Floating Cards */}
                    <div className="hidden lg:block relative h-[540px]">
                        {/* Main community image */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl ">
                            <img
                                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&q=80"
                                alt="Community food rescue volunteers"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/60 to-transparent" />
                        </div>

                        {/* Floating stat cards */}
                        {/* <div className="absolute -left-8 top-12 glass rounded-2xl p-4 shadow-xl animate-slide-left delay-500">
                            <p className="text-2xl font-bold text-[#059669]">Always FREE</p>
                            <p className="text-xs text-[#065F46]">No payment ever required</p>
                        </div> */}

                        {/* <div className="absolute -right-8 top-1/3 glass rounded-2xl p-4 shadow-xl animate-slide-right delay-600">
                            <div className="flex items-center gap-2 mb-1">
                                <FiStar className="text-amber-500 w-4 h-4 fill-amber-500" />
                                <span className="font-bold text-[#064E3B]">4.8/5</span>
                            </div>
                            <p className="text-xs text-[#065F46]">From 52,000+ community members</p>
                        </div> */}

                        <div className="absolute -left-4 bottom-16 glass rounded-2xl p-4 shadow-xl animate-slide-left delay-700">
                            {/* <p className="text-lg font-bold text-[#059669]">🌍 12 Lakh Meals</p>
                            <p className="text-xs text-[#065F46]">Rescued from waste</p> */}
                            <div className="flex items-center gap-2 mb-1">
                                <FiStar className="text-amber-500 w-4 h-4 fill-amber-500" />
                                <span className="font-bold text-[#064E3B]">4.8/5</span>
                            </div>
                            <p className="text-xs text-[#065F46]">From 52,000+ community members</p>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60L1440 60L1440 0C1200 50 960 60 720 40C480 20 240 0 0 30L0 60Z" fill="#ECFDF5" />
                    </svg>
                </div>
            </section>

            {/* ========== IMPACT STATS ========== */}
            <section className="py-20 bg-[#ECFDF5]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="badge badge-green mb-3">Our Impact</span>
                        <h2 className="text-4xl font-bold text-[#064E3B] mb-3">Changing India, One Meal at a Time</h2>
                        <div className="section-divider" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {impactStats.map(({ label, target, suffix, icon: Icon }) => (
                            <div key={label} className="card p-6 text-center group">
                                <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className="w-8 h-8 text-[#059669]" />
                                </div>
                                <AnimatedCounter target={target} suffix={suffix} />
                                <p className="text-sm text-[#065F46] mt-2">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="badge badge-green mb-3">Simple & Free</span>
                        <h2 className="text-4xl font-bold text-[#064E3B] mb-3">How FoodSave Works</h2>
                        <div className="section-divider" />
                        <p className="mt-6 text-[#065F46] max-w-xl mx-auto">
                            Restaurants donate their surplus food. You reserve it, go to their address, and pick it up — completely free of charge.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#059669] to-[#0891B2]" />

                        {howItWorks.map(
                            // eslint-disable-next-line no-unused-vars
                            ({ step, title, desc, icon: Icon }, i) => (
                                <div key={step} className={`card p-8 text-center animate-fade-in-up delay-${(i + 1) * 200}`}>
                                    <div className="relative inline-block mb-6">
                                        <div className="w-20 h-20 rounded-3xl bg-[#ECFDF5] flex items-center justify-center shadow-sm">
                                            <Icon className="w-10 h-10 text-[#059669]" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#064E3B] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#064E3B] mb-3">{title}</h3>
                                    <p className="text-[#065F46] leading-relaxed text-sm">{desc}</p>
                                </div>
                            ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/how-it-works" className="btn-secondary">
                            Learn More <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========== FEATURED LISTINGS ========== */}
            <section className="py-20 bg-[#ECFDF5]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                        <div>
                            <span className="badge badge-green mb-3">Available Now</span>
                            <h2 className="text-4xl font-bold text-[#064E3B]">Featured Food Listings</h2>
                            <div className="section-divider mt-3 ml-0" style={{ margin: '0.75rem 0 0' }} />
                        </div>
                        <Link to="/browse" className="btn-primary mt-6 md:mt-0 self-start md:self-auto">
                            View All Listings <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {mockFoodItems.filter(f => f.isFeatured).concat(mockFoodItems.filter(f => !f.isFeatured)).slice(0, 4).map(food => (
                            <FoodCard key={food.id} food={food} showLoginOverlay />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== TESTIMONIALS ========== */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="badge badge-green mb-3">Community Stories</span>
                        <h2 className="text-4xl font-bold text-[#064E3B] mb-3">What Our Community Says</h2>
                        <div className="section-divider" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {mockTestimonials.map(({ id, name, role, avatar, quote, rating, savings }, i) => (
                            <div key={id} className={`card p-8 animate-fade-in-up delay-${(i + 1) * 200}`}>
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: rating }).map((_, j) => (
                                        <FiStar key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-[#064E3B] leading-relaxed mb-6 italic">"{quote}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-[#D1FAE5]">
                                    <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[#064E3B] text-sm">{name}</p>
                                        <p className="text-xs text-[#065F46] truncate">{role}</p>
                                    </div>
                                    <span className="badge badge-green text-xs shrink-0">{savings}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== PARTNERS ========== */}
            <section className="py-16 bg-[#F0FDF4] border-y border-[#D1FAE5] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-[#065F46] font-semibold text-sm mb-8 uppercase tracking-widest">Trusted Partners</p>
                    {/* Marquee Container with fade edges */}
                    <div className="relative w-full overflow-hidden flex items-center before:content-[''] before:absolute before:left-0 before:top-0 before:w-20 before:h-full before:bg-gradient-to-r before:from-[#F0FDF4] before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:w-20 after:h-full after:bg-gradient-to-l after:from-[#F0FDF4] after:to-transparent after:z-10">
                        {/* Marquee Content */}
                        <div className="animate-marquee flex gap-12 md:gap-20 w-max pause-on-hover px-4">
                            {/* Duplicate array for seamless infinite scroll */}
                            {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                                <div key={idx} className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer h-12">
                                    <img src={partner.url} alt={partner.name} className="h-full max-w-[120px] md:max-w-[140px] object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== BENEFIT SPLIT ========== */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="badge badge-green mb-4">For Everyone</span>
                        <h2 className="text-4xl font-bold text-[#064E3B] mb-6">A Platform Built for Impact</h2>
                        <div className="space-y-6">
                            {[
                                {
                                    icon: ShoppingBag,
                                    title: 'For Consumers',
                                    desc: 'Browse surplus food from nearby restaurants, reserve what you need, and pick it up — always 100% free. No payment, ever.',
                                },
                                {
                                    icon: Store,
                                    title: 'For Restaurants & Stores',
                                    desc: 'List your end-of-day leftover food in minutes. Reduce waste, help your community, and earn a sustainability reputation.',
                                },
                                {
                                    icon: HandHeart,
                                    title: 'For NGOs & Communities',
                                    desc: 'Access free food donations at scale directly from restaurants. Feed more beneficiaries with zero cost.',
                                },
                            ].map(
                                // eslint-disable-next-line no-unused-vars
                                ({ icon: Icon, title, desc }, idx) => (
                                    <div key={title} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] flex items-center justify-center shrink-0">
                                            <Icon className="w-6 h-6 text-[#059669]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#064E3B] mb-1">{title}</h3>
                                            <p className="text-sm text-[#065F46] leading-relaxed">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <div className="flex gap-4 mt-8">
                            <Link to="/register" className="btn-primary">Join Free</Link>
                            <Link to="/about" className="btn-secondary">Our Story</Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="/community-sharing.png"
                                alt="Community sharing food"
                                className="w-full h-96 object-cover"
                            />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl">
                            <p className="text-2xl font-bold text-[#059669]">2.4MT</p>
                            <p className="text-sm text-[#065F46]">Food rescued this year 🌿</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== BOTTOM CTA ========== */}
            <section className="py-16 gradient-hero relative overflow-hidden">
                <div className="hero-blob w-80 h-80 bg-[#10B981] top-0 right-10" />
                <div className="hero-blob w-60 h-60 bg-[#0891B2] bottom-0 left-20" />
                <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
                    <FiFeather className="w-16 h-16 text-[#10B981] mx-auto mb-6 animate-float" />
                    <h2 className="text-4xl font-bold text-white mb-4">Good Food Shouldn't Go to Waste</h2>
                    <p className="text-lg text-white/80 mb-10">
                        Join 52,000+ community members and 4,200+ restaurants already rescuing food together — completely free, every single day.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-[#059669] font-semibold text-base px-8 py-2.5 rounded-full hover:bg-opacity-90 transition-all duration-200 shadow-lg cursor-pointer">
                            Join Free — Rescue Food Today
                        </Link>
                        <Link to="/browse" className="border-2 border-white text-white font-semibold text-base px-8 py-2.5 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer">
                            See Available Food
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}


