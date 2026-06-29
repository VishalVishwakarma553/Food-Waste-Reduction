import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiGrid, FiShoppingBag, FiCalendar, FiBarChart2, FiUsers, FiSettings,
    FiBell, FiLogOut, FiFeather
} from 'react-icons/fi';

const navItems = [
    { to: '/ngo/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/ngo/donations', icon: FiShoppingBag, label: 'Available Donations' },
    { to: '/ngo/pickups', icon: FiCalendar, label: 'Pickup Schedule' },
    { to: '/ngo/impact', icon: FiBarChart2, label: 'Impact & Analytics' },
    { to: '/ngo/beneficiaries', icon: FiUsers, label: 'Beneficiary Management' },
    { to: '/ngo/notifications', icon: FiBell, label: 'Notifications', badge: true },
    { to: '/ngo/profile', icon: FiSettings, label: 'Profile & Documents' },
];

export default function NgoSidebar() {
    const { user, logout } = useAuth();
    const displayName = user?.name || 'NGO Partner';
    const subTitle = user?.businessName || 'Charity Organization';

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-[#D1FAE5] flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-[#D1FAE5]">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#064E3B] flex items-center justify-center">
                        <FiFeather className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg text-[#064E3B]" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                        Food<span className="text-[#059669]">Save</span>
                    </span>
                    <span className="text-xs font-semibold bg-[#D1FAE5] text-[#064E3B] px-2 py-0.5 rounded-full ml-1">
                        NGO
                    </span>
                </Link>
            </div>

            {/* Profile Mini */}
            <div className="p-4 border-b border-[#D1FAE5]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white font-bold text-lg ring-2 ring-[#D1FAE5] select-none">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#064E3B] truncate">{displayName}</p>
                        <p className="text-xs text-[#065F46] truncate">{subTitle}</p>
                    </div>
                </div>
                <div className="mt-3 bg-[#F0FDF4] rounded-xl p-2.5 flex justify-between text-xs">
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">Verified</p>
                        <p className="text-[#065F46]">Status</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">12</p>
                        <p className="text-[#065F46]">Pickups</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">450kg</p>
                        <p className="text-[#065F46]">Saved</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="flex-1 text-sm">{label}</span>
                        {badge && (
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#D1FAE5] space-y-2">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <FiLogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </aside>
    );
}
