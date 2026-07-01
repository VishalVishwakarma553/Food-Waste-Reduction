import {
    FiPackage, FiShoppingBag, FiStar,
    FiTrendingUp, FiClock, FiCheckCircle, FiChevronRight, FiBell
} from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8080';

export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.businessName || user?.name || 'Your Business';
    const logoUrl = user?.businessImage
        ? `${API_BASE}${user.businessImage}`
        : null;

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: { total: 0, active: 0, draft: 0, expired: 0 },
        recentOrders: [],
        chartData: { thisWeek: [], lastWeek: [], thisMonth: [] },
        alerts: []
    });
    const [listings, setListings] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('This Week');
    const [updating, setUpdating] = useState(null);

    const fetchDashboard = async () => {
        try {
            const [dashRes, listRes] = await Promise.all([
                api.get('/restaurant/dashboard'),
                api.get('/restaurant/listings')
            ]);
            setDashboardData(dashRes.data);
            setListings(listRes.data.listings || []);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await api.patch(`/restaurant/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update order status');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        );
    }

    const stats = dashboardData.stats;
    const recentOrders = dashboardData.recentOrders;
    const alerts = dashboardData.alerts;

    const currentChartData = selectedPeriod === 'This Week'
        ? dashboardData.chartData?.thisWeek
        : selectedPeriod === 'Last Week'
            ? dashboardData.chartData?.lastWeek
            : dashboardData.chartData?.thisMonth || [];

    // Group inventory listings by category
    const categoriesSnapshot = Object.entries(
        listings.reduce((acc, l) => {
            const cat = l.category || 'Other';
            if (!acc[cat]) acc[cat] = { active: 0, total: 0 };
            acc[cat].total++;
            if (l.status === 'active') acc[cat].active++;
            return acc;
        }, {})
    ).slice(0, 3);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#064E3B] to-[#059669] rounded-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3 sm:gap-5">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={`${displayName} Logo`}
                                className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl object-cover border-4 border-white/20 shadow-lg shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl border-4 border-white/20 shadow-lg bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                                    Welcome back, {displayName}
                                </h1>
                                <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                                    <FiCheckCircle className="w-3 h-3" /> Verified
                                </span>
                            </div>
                            <p className="text-[#D1FAE5] mt-1 text-sm">Here's what's happening with your store today.</p>
                        </div>
                    </div>
                    <div className="flex">
                        <Link to="/restaurant/add-listing" className="btn-primary bg-white text-[#064E3B] hover:bg-[#F0FDF4] border-none text-sm py-2 px-4">
                            Add New Listing
                        </Link>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-5%] w-[40%] h-[150%] bg-white/5 rotate-12 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard icon={FiPackage} label="Active Listings" value={stats.active} trend={`${stats.total} total`} color="blue" />
                <MetricCard icon={FiShoppingBag} label="Draft Listings" value={stats.draft} trend="Unpublished" color="green" />
                <MetricCard icon={FiTrendingUp} label="Expired Listings" value={stats.expired} trend="Need attention" color="teal" />
                <MetricCard icon={FiStar} label="Total Listings" value={stats.total} trend="All time" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Charts Area (Spans 2 columns) */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Impact Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-base sm:text-lg font-bold text-[#111827]">Impact Overview ({selectedPeriod})</h2>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-xs sm:text-sm rounded-lg px-2 py-1.5 sm:px-3 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            >
                                <option value="This Week">This Week</option>
                                <option value="Last Week">Last Week</option>
                                <option value="This Month">This Month</option>
                            </select>
                        </div>
                        <div className="h-52 sm:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                                        formatter={(value) => [`${value} Meals`, 'Provided']}
                                    />
                                    <Area type="monotone" dataKey="mealsProvided" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                            <h2 className="text-base sm:text-lg font-bold text-[#111827]">Recent Orders</h2>
                            <Link to="/restaurant/orders" className="text-xs sm:text-sm text-[#059669] font-medium hover:underline flex items-center gap-1">
                                View All <FiChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[560px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-3 font-semibold">Order ID</th>
                                        <th className="px-4 py-3 font-semibold">Customer</th>
                                        <th className="px-4 py-3 font-semibold">Time / Pickup</th>
                                        <th className="px-4 py-3 font-semibold">Weight</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-xs">{order.id}</td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-xs">{order.customer}</p>
                                                        <p className="text-xs text-gray-500">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-1 text-xs"><FiClock className="w-3 h-3" /> {order.time}</span>
                                                        <span className="flex items-center gap-1 text-xs font-medium text-[#059669]">Pickup: {order.pickup}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{order.weight}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        order.status === 'Ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {order.status === 'Pending' && (
                                                        <button
                                                            disabled={updating === order.dbId}
                                                            onClick={() => updateStatus(order.dbId, 'ready')}
                                                            className="text-xs font-medium text-white bg-[#059669] px-2.5 py-1.5 rounded-lg hover:bg-[#047857] transition-colors disabled:opacity-50"
                                                        >
                                                            {updating === order.dbId ? '...' : 'Mark Ready'}
                                                        </button>
                                                    )}
                                                    {order.status === 'Ready' && (
                                                        <button
                                                            disabled={updating === order.dbId}
                                                            onClick={() => updateStatus(order.dbId, 'completed')}
                                                            className="text-xs font-medium text-white bg-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {updating === order.dbId ? '...' : 'Complete'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-10 text-center text-gray-500 text-sm">
                                                No recent orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-6">
                    {/* Alerts/Notifications */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-[#111827]">Alerts & Updates</h2>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <FiBell className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {alerts.length > 0 ? (
                                alerts.map(alert => (
                                    <Link to={alert.link} key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.type === 'warning' ? 'bg-amber-500' :
                                            alert.type === 'info' ? 'bg-blue-500' :
                                                'bg-green-500'
                                            }`} />
                                        <p className="text-sm text-gray-700">{alert.text}</p>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 py-2">No active alerts.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <h2 className="text-lg font-bold text-[#111827] mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionButton icon={FiPackage} label="Manage Stock" to="/restaurant/listings" color="blue" />
                            <QuickActionButton icon={FiShoppingBag} label="View Orders" to="/restaurant/orders" color="green" />
                            <QuickActionButton icon={FiTrendingUp} label="Analytics" to="/restaurant/analytics" color="purple" />
                            <QuickActionButton icon={FiStar} label="Reviews" to="/restaurant/settings" color="amber" />
                        </div>
                    </div>

                    {/* Active Listings Overview (mini) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-[#111827]">Inventory Snapshot</h2>
                            <Link to="/restaurant/listings" className="text-sm text-[#059669] hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {categoriesSnapshot.length > 0 ? (
                                categoriesSnapshot.map(([catName, snap], idx) => {
                                    const percent = snap.total > 0 ? Math.round((snap.active / snap.total) * 100) : 0;
                                    const progressBarColor = percent < 50 ? 'bg-amber-500' : 'bg-[#059669]';
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">{catName}</span>
                                                <span className="font-medium text-gray-900">{snap.active}/{snap.total} active</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className={`${progressBarColor} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500 py-2">No items in inventory. Add listings to see snapshot.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents
function MetricCard({ icon: Icon, label, value, subValue, trend, color }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        green: 'text-[#059669] bg-[#ECFDF5] border-[#D1FAE5]',
        teal: 'text-teal-600 bg-teal-50 border-teal-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-5 flex flex-col">
            <div className="flex flex-col items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md self-end mt-2">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {subValue && <span className="text-sm font-semibold text-gray-500">/ {subValue}</span>}
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({ icon: Icon, label, to, color }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
        green: 'text-[#059669] bg-[#ECFDF5] group-hover:bg-[#D1FAE5]',
        teal: 'text-teal-600 bg-teal-50 group-hover:bg-teal-100',
        amber: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100',
        purple: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
    };

    return (
        <Link to={to} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-all group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-2">{label}</span>
        </Link>
    );
}
