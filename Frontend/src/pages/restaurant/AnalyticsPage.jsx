import { FiTrendingUp, FiDownload, FiDollarSign, FiShoppingBag, FiStar } from 'react-icons/fi';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const impactData = [
    { name: 'Mon', mealsProvided: 40, orders: 24, kgSaved: 12 },
    { name: 'Tue', mealsProvided: 30, orders: 18, kgSaved: 9 },
    { name: 'Wed', mealsProvided: 50, orders: 32, kgSaved: 15 },
    { name: 'Thu', mealsProvided: 45, orders: 28, kgSaved: 13.5 },
    { name: 'Fri', mealsProvided: 60, orders: 45, kgSaved: 18 },
    { name: 'Sat', mealsProvided: 80, orders: 60, kgSaved: 24 },
    { name: 'Sun', mealsProvided: 75, orders: 55, kgSaved: 22.5 },
];

const foodSavedData = [
    { name: 'Week 1', kg: 120 },
    { name: 'Week 2', kg: 145 },
    { name: 'Week 3', kg: 110 },
    { name: 'Week 4', kg: 180 },
];

const categoryData = [
    { name: 'Bakery', value: 45 },
    { name: 'Prepared Meals', value: 30 },
    { name: 'Produce', value: 15 },
    { name: 'Dairy', value: 10 },
];

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7'];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Performance Analytics</h1>
                    <p className="text-[#065F46] mt-1">Detailed insights into your sales and environmental impact.</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <FiDownload className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={FiTrendingUp} label="Total Meals Provided" value="3,200" trend="+15%" />
                <MetricCard icon={FiShoppingBag} label="Total Pickups" value="262" trend="+8%" />
                <MetricCard icon={FiTrendingUp} label="Food Saved (Kg)" value="555 kg" trend="+22%" />
                <MetricCard icon={FiStar} label="Avg Rating" value="4.8/5" trend="Stable" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Impact Overview */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#111827]">Meals Provided & Pickups (This Week)</h2>
                    </div>
                    <div className="h-80">
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
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name) => [value, name === 'mealsProvided' ? 'Meals' : 'Pickups']}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="mealsProvided" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Impact Tracking */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#111827]">Food Saved (Monthly)</h2>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={foodSavedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value} kg`, 'Saved']}
                                />
                                <Bar dataKey="kg" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#111827]">Rescued Food by Category</h2>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Share']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', pt: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

// eslint-disable-next-line no-unused-vars
function MetricCard({ icon: Icon, label, value, trend }) {
    const isPositive = trend.includes('+');
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${isPositive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
}
