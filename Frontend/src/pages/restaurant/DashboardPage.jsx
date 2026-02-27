import {
    FiPackage, FiShoppingBag, FiDollarSign, FiStar,
    FiTrendingUp, FiClock, FiAlertCircle, FiCheckCircle, FiChevronRight, FiBell
} from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';

// Dummy Data
const impactData = [
    { name: 'Mon', mealsProvided: 40, orders: 24 },
    { name: 'Tue', mealsProvided: 30, orders: 18 },
    { name: 'Wed', mealsProvided: 50, orders: 32 },
    { name: 'Thu', mealsProvided: 45, orders: 28 },
    { name: 'Fri', mealsProvided: 60, orders: 45 },
    { name: 'Sat', mealsProvided: 80, orders: 60 },
    { name: 'Sun', mealsProvided: 75, orders: 55 },
];

const recentOrders = [
    { id: 'ORD-1042', customer: 'Rahul K.', items: 3, time: '10:45 AM', pickup: '11:30 AM', status: 'Pending', weight: '1.5 kg' },
    { id: 'ORD-1041', customer: 'Sneha P.', items: 1, time: '10:15 AM', pickup: '11:00 AM', status: 'Ready', weight: '0.4 kg' },
    { id: 'ORD-1040', customer: 'Amit T.', items: 5, time: '09:30 AM', pickup: '10:15 AM', status: 'Completed', weight: '2.5 kg' },
    { id: 'ORD-1039', customer: 'Priya R.', items: 2, time: '09:00 AM', pickup: '09:45 AM', status: 'Completed', weight: '1.0 kg' },
];

const alerts = [
    { id: 1, type: 'warning', text: '3 items expiring in less than 2 hours', link: '/restaurant/listings' },
    { id: 2, type: 'info', text: 'New review: 5 stars from Rahul K.', link: '#' },
    { id: 3, type: 'success', text: 'You hit a new milestone: 500 meals provided!', link: '#' },
];


export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#064E3B] to-[#059669] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between">
                <div className="relative z-10 flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
                    <img
                        src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=200&h=200"
                        alt="Restaurant Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                                Welcome back, Bakehouse Green
                            </h1>
                            <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <FiCheckCircle className="w-3 h-3" /> Verified
                            </span>
                        </div>
                        <p className="text-[#D1FAE5] mt-1">Here's what's happening with your store today.</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-3">
                    <Link to="/restaurant/add-listing" className="btn-primary bg-white text-[#064E3B] hover:bg-[#F0FDF4] border-none">
                        Add New Listing
                    </Link>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-5%] w-[40%] h-[150%] bg-white/5 rotate-12 blur-3xl rounded-full point-events-none" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={FiPackage} label="Active Listings" value="24" trend="+3 from yesterday" color="blue" />
                <MetricCard icon={FiShoppingBag} label="Orders Today" value="18" subValue="21.5 kg" trend="+12% from last week" color="green" />
                <MetricCard icon={FiTrendingUp} label="Meals Provided" value="380" trend="Lifetime impact" color="teal" />
                <MetricCard icon={FiStar} label="Sustainability Score" value="A+" subValue="98/100" trend="Top 5% in city" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Area (Spans 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Impact Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[#111827]">Impact Overview (This Week)</h2>
                            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#059669]">
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={impactData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${value}`} />
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
                        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#111827]">Recent Orders</h2>
                            <Link to="/restaurant/orders" className="text-sm text-[#059669] font-medium hover:underline flex items-center gap-1">
                                View All <FiChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-4 font-semibold">Order ID</th>
                                        <th className="px-6 py-4 font-semibold">Customer</th>
                                        <th className="px-6 py-4 font-semibold">Time / Pickup</th>
                                        <th className="px-6 py-4 font-semibold">Rescued Weight</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{order.customer}</p>
                                                    <p className="text-xs text-gray-500">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1 text-xs"><FiClock className="w-3 h-3" /> {order.time}</span>
                                                    <span className="flex items-center gap-1 text-xs font-medium text-[#059669]">Pickup: {order.pickup}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{order.weight}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    order.status === 'Ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {order.status === 'Pending' && (
                                                    <button className="text-xs font-medium text-white bg-[#059669] px-3 py-1.5 rounded-lg hover:bg-[#047857] transition-colors">
                                                        Mark Ready
                                                    </button>
                                                )}
                                                {order.status === 'Ready' && (
                                                    <button className="text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                                                        Complete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
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
                            {alerts.map(alert => (
                                <Link to={alert.link} key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.type === 'warning' ? 'bg-amber-500' :
                                        alert.type === 'info' ? 'bg-blue-500' :
                                            'bg-green-500'
                                        }`} />
                                    <p className="text-sm text-gray-700">{alert.text}</p>
                                </Link>
                            ))}
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
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Bakery Items</span>
                                    <span className="font-medium text-gray-900">12/15</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-[#059669] h-2 rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Prepared Meals</span>
                                    <span className="font-medium text-gray-900">3/10</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Produce</span>
                                    <span className="font-medium text-gray-900">9/10</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-[#059669] h-2 rounded-full" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// Subcomponents
// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
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
