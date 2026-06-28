import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShoppingBag, FiBarChart2, FiHeart, FiTrendingUp, FiFeather } from 'react-icons/fi';
import { Search, Package, Globe, Heart, Sprout, Star, Leaf, Sunrise, Trophy, Recycle, Utensils, Crown, Award } from 'lucide-react';

const BadgeIconMap = {
    '🌱': Sprout,
    '⭐': Star,
    '🌿': Leaf,
    '🌅': Sunrise,
    '🏆': Trophy,
    '♻️': Recycle,
    '🍽️': Utensils,
    '👑': Crown
};

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import FoodCard from '../../components/shared/FoodCard';

function StatCard({ label, value, sub, icon: Icon, color }) {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-[#064E3B]">{value ?? '—'}</p>
            <p className="text-sm font-semibold text-[#065F46] mt-0.5">{label}</p>
            {sub && <p className="text-xs text-[#065F46] mt-1 opacity-70">{sub}</p>}
        </div>
    );
}

const statusColors = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    ready: 'status-ready',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#D1FAE5] rounded-xl p-3 shadow-lg text-xs">
            <p className="font-bold text-[#064E3B] mb-1">{label}</p>
            <p className="text-[#059669]">Food Saved: {payload[0]?.value}kg</p>
            <p className="text-[#0891B2]">Money Saved: ₹{payload[1]?.value}</p>
        </div>
    );
};

export default function DashboardPage() {
    const { user } = useAuth();
    const { cartCount } = useCart();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get('/consumer/dashboard')
            .then(({ data }) => {
                if (!cancelled) setDashboard(data);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err.response?.data?.error || 'Failed to load dashboard');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const stats = dashboard?.stats || {};
    const recentOrders = dashboard?.recentOrders || [];
    const nearbyListings = dashboard?.nearbyListings || [];
    const badges = dashboard?.badges || [];
    const chartData = dashboard?.chartData || [];
    const earnedBadges = badges.filter(b => b.earned);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#065F46] text-sm">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="rounded-[1.5rem] border border-[#D1FAE5] p-6 bg-gradient-to-r from-[#059669] to-[#0891B2] text-white overflow-hidden relative shadow-lg">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -right-20 w-60 h-60 bg-white/5 rounded-full" />
                <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-white/80 text-sm">Good evening,</p>
                        <h1 className="text-2xl font-bold">{user?.name}! 👋</h1>
                        <p className="text-white/80 text-sm mt-1">You've saved <strong className="text-white">{stats.totalFoodSaved ?? 0}kg</strong> of food. Keep going!</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/consumer/listings" className="bg-white text-[#059669] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-opacity-90 transition-all cursor-pointer">
                            Browse Food
                        </Link>
                        {cartCount > 0 && (
                            <Link to="/consumer/cart" className="bg-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-white/30 transition-all cursor-pointer border border-white/30">
                                Cart ({cartCount})
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Orders" value={stats.totalOrders} sub="All time" icon={FiShoppingBag} color="bg-gradient-to-br from-[#059669] to-[#10B981]" />
                <StatCard label="Food Saved" value={`${stats.totalFoodSaved ?? 0}kg`} sub="Environmental impact" icon={FiFeather} color="bg-gradient-to-br from-[#0891B2] to-[#06b6d4]" />
                <StatCard label="Money Saved" value={`₹${(stats.totalMoneySaved || 0).toLocaleString('en-IN')}`} sub="vs. original prices" icon={FiTrendingUp} color="bg-gradient-to-br from-[#F59E0B] to-[#fbbf24]" />
                <StatCard label="Impact Score" value={(stats.impactScore || 0).toLocaleString('en-IN')} sub={`Community rank #${stats.leaderboardRank || '—'}`} icon={FiBarChart2} color="bg-gradient-to-br from-[#8B5CF6] to-[#a78bfa]" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Nearby Food */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[#064E3B]">Nearby Food</h2>
                        <Link to="/consumer/listings" className="text-sm text-[#059669] font-semibold hover:underline flex items-center gap-1">
                            View All <FiArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {nearbyListings.map(food => (
                            <FoodCard key={food.id} food={{
                                ...food,
                                images: food.images?.length ? food.images : (food.images ? [food.images] : ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80']),
                                restaurantId: food.restaurantName,
                                status: 'active',
                                pickupSlots: ['Available for pickup'],
                                pickup: true,
                                delivery: false,
                                dietary: { veg: true, vegan: false, glutenFree: true, dairyFree: false },
                            }} />
                        ))}
                    </div>
                </div>

                {/* Sidebar column */}
                <div className="space-y-6">
                    {/* Recent Orders */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#064E3B]">Recent Orders</h2>
                            <Link to="/consumer/orders" className="text-sm text-[#059669] font-semibold hover:underline flex items-center gap-1">
                                All <FiArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <Link key={order.id} to={`/consumer/orders`} className="card-flat p-4 flex items-center gap-3 hover:border-[#10B981] transition-colors cursor-pointer block">
                                    <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] flex items-center justify-center shrink-0 text-[#059669]">
                                        <FiShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#064E3B] truncate">Order #{order.id}</p>
                                        <p className="text-xs text-[#065F46]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <span className={`badge text-xs shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Badges */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#064E3B]">My Badges</h2>
                            <Link to="/consumer/impact" className="text-sm text-[#059669] font-semibold hover:underline flex items-center gap-1">
                                All <FiArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {earnedBadges.map(badge => {
                                const BadgeIcon = BadgeIconMap[badge.icon] || Award;
                                return (
                                    <div key={badge.id} className="card p-2 text-center group cursor-pointer relative hover:bg-[#D1FAE5] transition-colors">
                                        <div className="flex justify-center text-[#059669] my-1"><BadgeIcon className="w-6 h-6" strokeWidth={1.5} /></div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-28 bg-[#064E3B] text-white text-xs rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center pointer-events-none shadow-lg">
                                            {badge.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Chart */}
            <div className="card-flat p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#064E3B]">Impact Over Time</h2>
                    <Link to="/consumer/impact" className="text-sm text-[#059669] font-semibold hover:underline">Full Report</Link>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barSize={16} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#065F46' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#065F46' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="foodSaved" fill="#059669" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="moneySaved" fill="#0891B2" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-6 justify-center mt-2">
                    <div className="flex items-center gap-2 text-xs text-[#065F46]"><div className="w-3 h-3 rounded bg-[#059669]" /> Food Saved (kg)</div>
                    <div className="flex items-center gap-2 text-xs text-[#065F46]"><div className="w-3 h-3 rounded bg-[#0891B2]" /> Money Saved (₹)</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-[#064E3B] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { to: '/consumer/listings', icon: Search, label: 'Browse Food' },
                        { to: '/consumer/orders', icon: Package, label: 'My Orders' },
                        { to: '/consumer/impact', icon: Globe, label: 'My Impact' },
                        { to: '/consumer/favorites', icon: Heart, label: 'Favorites' },
                    ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} className="card p-5 flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-[#F0FDF4] group">
                            <span className="text-[#059669] group-hover:scale-110 transition-transform"><Icon className="w-8 h-8" strokeWidth={1.5} /></span>
                            <span className="text-sm font-semibold text-[#064E3B]">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div >
    );
}
