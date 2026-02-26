import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
    FiGrid, FiList, FiShoppingCart, FiBarChart2, FiHeart,
    FiBell, FiUser, FiLogOut, FiStar, FiFeather
} from 'react-icons/fi';


const navItems = [
    { to: '/consumer/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/consumer/listings', icon: FiList, label: 'Browse Food' },
    { to: '/consumer/orders', icon: FiStar, label: 'My Orders' },
    { to: '/consumer/impact', icon: FiBarChart2, label: 'My Impact' },
    { to: '/consumer/favorites', icon: FiHeart, label: 'Favorites' },
    { to: '/consumer/notifications', icon: FiBell, label: 'Notifications', badge: true },
    { to: '/consumer/profile', icon: FiUser, label: 'Profile' },
];

export default function ConsumerSidebar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();

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
                </Link>
            </div>

            {/* User Profile Mini */}
            <div className="p-4 border-b border-[#D1FAE5]">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D1FAE5]"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#064E3B] truncate">{user?.name}</p>
                        <p className="text-xs text-[#065F46] truncate">{user?.email}</p>
                    </div>
                </div>
                <div className="mt-3 bg-[#F0FDF4] rounded-xl p-2.5 flex justify-between text-xs">
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">{user?.impact?.totalOrders || 0}</p>
                        <p className="text-[#065F46]">Orders</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">{user?.impact?.foodSaved || 0}kg</p>
                        <p className="text-[#065F46]">Saved</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#059669]">₹{user?.impact?.moneySaved || 0}</p>
                        <p className="text-[#065F46]">Saved</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
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

                {/* Cart with count */}
                <NavLink
                    to="/consumer/cart"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <FiShoppingCart className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-sm">Cart</span>
                    {cartCount > 0 && (
                        <span className="bg-[#059669] text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-5 text-center">
                            {cartCount}
                        </span>
                    )}
                </NavLink>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#D1FAE5] space-y-2">
                <Link
                    to="/browse"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#059669] to-[#10B981] hover:opacity-90 transition-opacity cursor-pointer"
                >
                    <FiList className="w-4 h-4" /> Browse Public Listings
                </Link>
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


