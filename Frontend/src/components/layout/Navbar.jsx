import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
    FiShoppingCart, FiMenu, FiX, FiBell, FiUser, FiLogOut,
    FiHome, FiList, FiHeart, FiBarChart2, FiFeather
} from 'react-icons/fi';


export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setProfileOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-emerald-900/10' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                            <FiFeather className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-[#064E3B]" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                            Food<span className="text-[#059669]">Save</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/" end className={({ isActive }) =>
                            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#064E3B] hover:bg-[#D1FAE5] hover:text-[#059669]'
                            }`
                        }>Home</NavLink>
                        <NavLink to="/browse" className={({ isActive }) =>
                            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#064E3B] hover:bg-[#D1FAE5] hover:text-[#059669]'
                            }`
                        }>Browse Food</NavLink>
                        <NavLink to="/how-it-works" className={({ isActive }) =>
                            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#064E3B] hover:bg-[#D1FAE5] hover:text-[#059669]'
                            }`
                        }>How It Works</NavLink>
                        <NavLink to="/about" className={({ isActive }) =>
                            `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#064E3B] hover:bg-[#D1FAE5] hover:text-[#059669]'
                            }`
                        }>About</NavLink>
                    </div>

                    {/* Desktop Right */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Cart */}
                                <Link to="/consumer/cart" className="relative p-2.5 rounded-full hover:bg-[#D1FAE5] transition-colors duration-200 cursor-pointer">
                                    <FiShoppingCart className="w-5 h-5 text-[#064E3B]" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#059669] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Notifications */}
                                <Link to="/consumer/notifications" className="relative p-2.5 rounded-full hover:bg-[#D1FAE5] transition-colors duration-200 cursor-pointer">
                                    <FiBell className="w-5 h-5 text-[#064E3B]" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 bg-[#D1FAE5] hover:bg-[#A7F3D0] rounded-full pl-1 pr-3 py-1 transition-colors duration-200 cursor-pointer"
                                    >
                                        <img
                                            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80'}
                                            alt={user?.name}
                                            className="w-7 h-7 rounded-full object-cover"
                                        />
                                        <span className="text-sm font-semibold text-[#064E3B]">{user?.name?.split(' ')[0]}</span>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-52 card-flat shadow-xl animate-fade-in py-2">
                                            <div className="px-4 py-2 border-b border-[#D1FAE5]">
                                                <p className="text-sm font-semibold text-[#064E3B]">{user?.name}</p>
                                                <p className="text-xs text-[#065F46]">{user?.email}</p>
                                            </div>
                                            {[
                                                { to: '/consumer/dashboard', icon: FiHome, label: 'Dashboard' },
                                                { to: '/consumer/orders', icon: FiList, label: 'My Orders' },
                                                { to: '/consumer/impact', icon: FiBarChart2, label: 'My Impact' },
                                                { to: '/consumer/favorites', icon: FiHeart, label: 'Favorites' },
                                                { to: '/consumer/profile', icon: FiUser, label: 'Profile' },
                                            ].map(({ to, icon: Icon, label }) => (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#064E3B] hover:bg-[#D1FAE5] transition-colors duration-150 cursor-pointer"
                                                >
                                                    <Icon className="w-4 h-4" /> {label}
                                                </Link>
                                            ))}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer border-t border-[#D1FAE5] mt-1"
                                            >
                                                <FiLogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary text-sm py-2 px-5">Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2.5 rounded-full hover:bg-[#D1FAE5] transition-colors duration-200 cursor-pointer"
                    >
                        {isOpen ? <FiX className="w-5 h-5 text-[#064E3B]" /> : <FiMenu className="w-5 h-5 text-[#064E3B]" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass border-t border-[#D1FAE5] animate-fade-in">
                    <div className="px-4 py-4 space-y-1">
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/browse', label: 'Browse Food' },
                            { to: '/how-it-works', label: 'How It Works' },
                            { to: '/about', label: 'About' },
                        ].map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#064E3B] hover:bg-[#D1FAE5]'
                                    }`
                                }
                            >{label}</NavLink>
                        ))}
                        {isAuthenticated ? (
                            <div className="pt-2 border-t border-[#D1FAE5] space-y-1">
                                <Link to="/consumer/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#064E3B] hover:bg-[#D1FAE5]">Dashboard</Link>
                                <Link to="/consumer/orders" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#064E3B] hover:bg-[#D1FAE5]">My Orders</Link>
                                <Link to="/consumer/cart" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#064E3B] hover:bg-[#D1FAE5]">Cart {cartCount > 0 && `(${cartCount})`}</Link>
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">Sign Out</button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-[#D1FAE5] flex gap-3">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center btn-secondary text-sm py-2 px-4">Sign In</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="flex-1 text-center btn-primary text-sm py-2 px-4">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}


