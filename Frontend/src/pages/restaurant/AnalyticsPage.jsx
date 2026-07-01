import { FiTrendingUp, FiDownload, FiDollarSign, FiShoppingBag, FiStar } from 'react-icons/fi';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        metrics: {
            totalMealsProvided: 0,
            mealsTrend: 'Stable',
            totalPickups: 0,
            pickupsTrend: 'Stable',
            totalFoodSavedKg: 0,
            kgTrend: 'Stable',
            avgRating: '4.8',
            ratingTrend: 'Stable'
        },
        weeklyImpact: [],
        foodSavedData: [],
        categoryData: []
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/restaurant/analytics');
                setAnalytics(data);
            } catch (err) {
                toast.error('Failed to load performance analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.get('/restaurant/listings/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'restaurant_performance_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report exported successfully');
        } catch (err) {
            toast.error('Failed to export report');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        );
    }

    const { metrics, weeklyImpact, foodSavedData, categoryData } = analytics;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#064E3B]">Performance Analytics</h1>
                    <p className="text-[#065F46] mt-1 text-sm">Detailed insights into your sales and environmental impact.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                    <FiDownload className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard icon={FiTrendingUp} label="Total Meals Provided" value={metrics.totalMealsProvided} trend={metrics.mealsTrend} />
                <MetricCard icon={FiShoppingBag} label="Total Pickups" value={metrics.totalPickups} trend={metrics.pickupsTrend} />
                <MetricCard icon={FiTrendingUp} label="Food Saved" value={`${metrics.totalFoodSavedKg} kg`} trend={metrics.kgTrend} />
                <MetricCard icon={FiStar} label="Avg Rating" value={`${metrics.avgRating}/5`} trend={metrics.ratingTrend} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Impact Overview */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 sm:p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-bold text-[#111827]">Meals Provided & Pickups (This Week)</h2>
                    </div>
                    <div className="h-56 sm:h-80">
                        {weeklyImpact.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyImpact} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No activity recorded for this week yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Impact Tracking */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#111827]">Food Saved (Monthly)</h2>
                    </div>
                    <div className="h-80">
                        {foodSavedData.length > 0 ? (
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No food saved data recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#111827]">Rescued Food by Category</h2>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        {categoryData.length > 0 && categoryData.some(c => c.value > 0) ? (
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
                                        formatter={(value) => [`${value}`, 'Rescued Qty']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', pt: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-500">
                                No categories to display yet.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, trend }) {
    const isPositive = trend.includes('+');
    const isNegative = trend.includes('-');
    const trendColor = isPositive 
        ? 'bg-green-50 text-green-700' 
        : isNegative 
        ? 'bg-red-50 text-red-700' 
        : 'bg-gray-100 text-gray-600';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${trendColor}`}>
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
