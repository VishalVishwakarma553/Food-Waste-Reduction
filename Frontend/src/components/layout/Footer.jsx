import { Link } from 'react-router-dom';

import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiFeather } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="bg-[#064E3B] text-white mt-24">
            {/* Top CTA Banner */}
            <div className="gradient-primary py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                        Together We Can End Food Waste
                    </h2>
                    <p className="text-lg text-white/80 mb-6">Join 50,000+ people making India's food system more sustainable</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register" className="bg-white text-[#059669] font-bold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all duration-200 shadow-lg cursor-pointer">
                            Start Saving Food
                        </Link>
                        <Link to="/about" className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer">
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center">
                                <FiFeather className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                                Food<span className="text-[#10B981]">Save</span>
                            </span>
                        </Link>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                            Connecting surplus food from restaurants and stores to consumers and NGOs across India.
                            Reducing waste, fighting hunger, building community.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { Icon: FiFacebook, href: '#' },
                                { Icon: FiTwitter, href: '#' },
                                { Icon: FiInstagram, href: '#' },
                                { Icon: FiLinkedin, href: '#' },
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#10B981] flex items-center justify-center transition-all duration-200 cursor-pointer">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-base mb-5 text-[#10B981]" style={{ fontFamily: "'Playfair Display SC', serif" }}>Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/browse', label: 'Browse Food' },
                                { to: '/about', label: 'About Us' },
                                { to: '/how-it-works', label: 'How It Works' },
                                { to: '/register', label: 'Join as Consumer' },
                            ].map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="text-white/70 hover:text-[#10B981] text-sm transition-colors duration-150 cursor-pointer">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Partners */}
                    <div>
                        <h3 className="font-bold text-base mb-5 text-[#10B981]" style={{ fontFamily: "'Playfair Display SC', serif" }}>For Partners</h3>
                        <ul className="space-y-3">
                            {[
                                'Register Restaurant',
                                'NGO Partnerships',
                                'Corporate CSR',
                                'API for Developers',
                                'Partner Portal',
                            ].map((label) => (
                                <li key={label}>
                                    <span className="text-white/70 hover:text-[#10B981] text-sm transition-colors duration-150 cursor-pointer">{label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-base mb-5 text-[#10B981]" style={{ fontFamily: "'Playfair Display SC', serif" }}>Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm text-white/70">
                                <FiMapPin className="w-4 h-4 mt-1 text-[#10B981] shrink-0" />
                                <span>91 Springboard, Koramangala, Bengaluru, Karnataka – 560034</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                                <FiMail className="w-4 h-4 text-[#10B981] shrink-0" />
                                <a href="mailto:hello@foodsave.in" className="hover:text-[#10B981] transition-colors cursor-pointer">hello@foodsave.in</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/70">
                                <FiPhone className="w-4 h-4 text-[#10B981] shrink-0" />
                                <a href="tel:+918000000000" className="hover:text-[#10B981] transition-colors cursor-pointer">+91 80000 00000</a>
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="mt-6">
                            <p className="text-sm font-semibold mb-3 text-white/90">Get Impact Updates</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#10B981] transition-colors"
                                />
                                <button className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/50 text-sm">© 2024 FoodSave. All rights reserved. Made with ♥ for a sustainable India.</p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Sitemap'].map((item) => (
                            <span key={item} className="text-white/50 hover:text-[#10B981] text-sm cursor-pointer transition-colors">{item}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}


