import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const teamMembers = [
    { name: 'Priya Raghavan', role: 'CEO & Co-Founder', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', bio: 'Ex-McKinsey. Passionate about sustainable food systems.' },
    { name: 'Aryan Sharma', role: 'CTO & Co-Founder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', bio: 'IIT Bombay. Built tech for 3 successful startups.' },
    { name: 'Divya Menon', role: 'Head of NGO Partnerships', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', bio: 'Former Akshaya Patra. Connecting communities.' },
    { name: 'Vikram Nair', role: 'Head of Restaurant Network', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', bio: 'Hospitality industry veteran with 15 years experience.' },
];

const timeline = [
    { year: '2021', event: 'FoodSave founded in Bengaluru with 5 partner restaurants.' },
    { year: '2022', event: 'Expanded to 3 cities. Reached 1,000 consumers. ₹1Cr saved.' },
    { year: '2023', event: 'Series A funding. NGO partnerships launched. 50,000+ users.' },
    { year: '2024', event: '4,200+ restaurant partners. 12 cities. 2.4MT food saved.' },
];

const stats = [
    { value: '2.4MT', label: 'Food Saved' },
    { value: '12L+', label: 'Meals Provided' },
    { value: '4,200+', label: 'Partner Restaurants' },
    { value: '12', label: 'Cities Covered' },
];

export default function AboutPage() {
    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="gradient-hero py-24 relative overflow-hidden">
                <div className="hero-blob w-80 h-80 bg-[#10B981] -top-20 right-10" />
                <div className="hero-blob w-60 h-60 bg-[#0891B2] bottom-0 left-20" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <span className="badge bg-white/20 text-white mb-4">Our Story</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Turning Surplus Into<br /><span className="text-[#10B981]">Sustenance</span></h1>
                    <p className="text-xl text-white/80 leading-relaxed">
                        We started with a simple question: why does 40% of India's food go to waste while millions go hungry?
                        FoodSave is our answer — a platform connecting surplus food to people who need it.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-[#ECFDF5]">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-4xl font-bold text-[#059669]" style={{ fontFamily: "'Playfair Display SC', serif" }}>{value}</p>
                            <p className="text-[#065F46] mt-2 text-sm">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
                    <div className="card p-10">
                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5 text-2xl">🎯</div>
                        <h2 className="text-2xl font-bold text-[#064E3B] mb-4">Our Mission</h2>
                        <p className="text-[#065F46] leading-relaxed">
                            To eliminate avoidable food waste in India by building the most trusted and efficient marketplace
                            connecting surplus food with people who value it — whether that's a consumer looking for a deal,
                            a community kitchen, or an NGO feeding hundreds.
                        </p>
                    </div>
                    <div className="card p-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0891B2] to-[#06b6d4] flex items-center justify-center mb-5 text-2xl">👁️</div>
                        <h2 className="text-2xl font-bold text-[#064E3B] mb-4">Our Vision</h2>
                        <p className="text-[#065F46] leading-relaxed">
                            A world where no good food is wasted. We envision FoodSave becoming the infrastructure layer for
                            India's food economy — where every restaurant, every household, and every institution can participate
                            in building a zero-waste food future.
                        </p>
                    </div>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="py-20 bg-[#ECFDF5]">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="badge badge-red mb-4">The Problem</span>
                        <h2 className="text-4xl font-bold text-[#064E3B] mb-6">India's Food Waste Crisis</h2>
                        <div className="space-y-4">
                            {[
                                { stat: '~68 MT', label: 'Food wasted in India every year (FAO 2023)' },
                                { stat: '40%', label: 'Of all food produced in India is wasted' },
                                { stat: '₹92,000Cr', label: 'Economic value of wasted food annually' },
                                { stat: '19.4%', label: 'Of Indians remain food insecure' },
                            ].map(({ stat, label }) => (
                                <div key={stat} className="flex items-center gap-4 card-flat p-4">
                                    <span className="text-2xl font-bold text-red-500" style={{ fontFamily: "'Playfair Display SC', serif" }}>{stat}</span>
                                    <span className="text-[#065F46] text-sm">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80"
                            alt="Fresh market food"
                            className="rounded-3xl shadow-2xl w-full h-80 object-cover"
                        />
                        <div className="absolute -bottom-6 -right-6 glass rounded-2xl p-5 shadow-xl">
                            <p className="text-lg font-bold text-[#059669]">Our Solution 💚</p>
                            <p className="text-xs text-[#065F46]">Connect. Rescue. Impact.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="badge badge-green mb-3">Our Journey</span>
                        <h2 className="text-4xl font-bold text-[#064E3B]">How We Got Here</h2>
                        <div className="section-divider" />
                    </div>
                    <div className="space-y-8">
                        {timeline.map(({ year, event }, i) => (
                            <div key={year} className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {year}
                                    </div>
                                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-[#D1FAE5] mt-2" />}
                                </div>
                                <div className="card-flat p-5 flex-1 mb-8">
                                    <p className="text-[#064E3B] leading-relaxed">{event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-[#ECFDF5]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="badge badge-green mb-3">The Team</span>
                        <h2 className="text-4xl font-bold text-[#064E3B]">People Behind FoodSave</h2>
                        <div className="section-divider" />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map(({ name, role, avatar, bio }) => (
                            <div key={name} className="card p-6 text-center">
                                <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-[#D1FAE5]" />
                                <h3 className="font-bold text-[#064E3B] mb-1">{name}</h3>
                                <p className="text-xs text-[#059669] font-semibold mb-3">{role}</p>
                                <p className="text-xs text-[#065F46] leading-relaxed">{bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-[#064E3B] mb-4">Be Part of the Change</h2>
                    <p className="text-[#065F46] mb-8">Every order you place rescues food, supports local businesses, and feeds communities.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="btn-primary">Join FoodSave</Link>
                        <Link to="/how-it-works" className="btn-secondary">How It Works <FiArrowRight className="w-4 h-4" /></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
