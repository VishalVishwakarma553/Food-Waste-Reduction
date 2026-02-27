import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiGrid, FiList, FiPlusCircle, FiBarChart2, FiSettings,
    FiBell, FiLogOut, FiFeather, FiLayers
} from 'react-icons/fi';

const navItems = [
    { to: '/restaurant/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/restaurant/add-listing', icon: FiPlusCircle, label: 'Add Listing' },
    { to: '/restaurant/listings', icon: FiList, label: 'My Listings' },
    // Placeholder for future pages
    { to: '/restaurant/orders', icon: FiLayers, label: 'Orders' },
    { to: '/restaurant/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/restaurant/notifications', icon: FiBell, label: 'Notifications', badge: true },
    { to: '/restaurant/settings', icon: FiSettings, label: 'Settings' },
];

export default function RestaurantSidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-[#D1FAE5] flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-[#D1FAE5]">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <FiFeather className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg text-[#064E3B]" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                        Food<span className="text-[#059669]">Save</span>
                    </span>
                    <span className="text-xs font-semibold bg-[#D1FAE5] text-[#064E3B] px-2 py-0.5 rounded-full ml-1">
                        Partner
                    </span>
                </Link>
            </div>

            {/* Restaurant Profile Mini */}
            <div className="p-4 border-b border-[#D1FAE5]">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.avatar || "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt={user?.name || "Restaurant"}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#D1FAE5]"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#064E3B] truncate">{user?.name || "Bakehouse Green"}</p>
                        <p className="text-xs text-[#065F46] truncate">Verified Partner ✓</p>
                    </div>
                </div>
                <div className="mt-3 bg-[#F0FDF4] rounded-xl p-2.5 flex justify-between text-xs">
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">A+</p>
                        <p className="text-[#065F46]">Score</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">142</p>
                        <p className="text-[#065F46]">Orders</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">45kg</p>
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
