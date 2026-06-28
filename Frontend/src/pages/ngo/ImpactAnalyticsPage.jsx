import { useState } from 'react';
import {
    FiBarChart2, FiAward, FiDownload, FiGlobe, FiGrid,
    FiPackage, FiActivity, FiArrowUpRight, FiHeart, FiStar
} from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockMonthlyData = [
    { month: 'Jan', kg: 450, meals: 1125 },
    { month: 'Feb', kg: 510, meals: 1275 },
    { month: 'Mar', kg: 600, meals: 1500 },
    { month: 'Apr', kg: 580, meals: 1450 },
    { month: 'May', kg: 720, meals: 1800 },
    { month: 'Jun', kg: 850, meals: 2125 },
];

const mockCategoryData = [
    { name: 'Prepared Meals', value: 45 },
    { name: 'Bakery', value: 30 },
    { name: 'Produce', value: 15 },
    { name: 'Dairy', value: 10 },
];

const mockTopPartners = [
    { name: 'Gourmet Kitchen', weight: 320, meals: 800, rating: 4.9 },
    { name: 'Star Buffet', weight: 280, meals: 700, rating: 4.8 },
    { name: 'Pizza Palace', weight: 190, meals: 475, rating: 4.7 },
    { name: 'Green Salads Co', weight: 120, meals: 300, rating: 4.9 },
];

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7'];

export default function ImpactAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('6M'); // 1M | 6M | 1Y
    const [chartMetric, setChartMetric] = useState('kg'); // kg | meals
    const [certificateGenerating, setCertificateGenerating] = useState(false);

    const handleDownloadReport = (type) => {
        toast.success(`Generating ${type} report PDF for download...`);
    };

    const handleGenerateCertificate = () => {
        setCertificateGenerating(true);
        setTimeout(() => {
            setCertificateGenerating(false);
            toast.success('Your digital NGO Impact Certificate has been downloaded! 🏆');
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Impact Reports & Analytics</h1>
                    <p className="text-[#065F46] mt-1">Detailed breakdown of food rescue volumes, partnerships, and carbon emission savings.</p>
                </div>
                <button 
                    onClick={() => handleDownloadReport('Annual')}
                    className="bg-white border text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm self-start"
                >
                    <FiDownload /> Export Annual Report
                </button>
            </div>

            {/* Hero stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={FiPackage} label="Lifetime Food Saved" value="3,450 kg" desc="8,625 meal equivalent" color="green" />
                <MetricCard icon={FiActivity} label="Beneficiaries Served" value="4,850" desc="Active community" color="blue" />
                <MetricCard icon={FiGlobe} label="CO2 Saved Equivalent" value="1,380 kg" desc="Carbon offset" color="teal" />
                <MetricCard icon={FiAward} label="Partner Establishments" value="18" desc="Active collaborations" color="amber" />
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Monthly trends chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Food Rescue & Distribution Trends</h2>
                            <p className="text-xs text-gray-500">Track distribution volume by Weight or Meals</p>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1 self-start">
                            <button 
                                onClick={() => setChartMetric('kg')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartMetric === 'kg' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500'}`}
                            >
                                Weight (kg)
                            </button>
                            <button 
                                onClick={() => setChartMetric('meals')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartMetric === 'meals' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500'}`}
                            >
                                Meals (Qty)
                            </button>
                        </div>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey={chartMetric} name={chartMetric === 'kg' ? 'Food Collected (kg)' : 'Meals Provided (qty)'} fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie chart category breakdown */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 mb-2">Category Distribution</h2>
                        <p className="text-xs text-gray-500 mb-6">Volume distribution across food groups</p>
                    </div>
                    <div className="h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mockCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Partners Table & Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top partner restaurants */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b pb-2">Top Partner Contributors</h2>
                    <div className="space-y-4">
                        {mockTopPartners.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-4 border rounded-xl hover:bg-white hover:border-gray-200 transition-all">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                                    <p className="text-xs text-gray-500">Volunteered {p.meals} Meals to date</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#059669] text-sm">{p.weight} kg donated</p>
                                    <div className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold justify-end">
                                        <FiStar className="fill-current" /> {p.rating}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Download certificates & summary widget */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 mb-2">Digital Impact Certificate</h2>
                        <p className="text-xs text-gray-500">Generate a platform-branded digital certificate highlighting your contribution to reducing food waste.</p>
                    </div>

                    <div className="border rounded-xl p-4 bg-emerald-50/20 text-center border-dashed border-[#059669]">
                        <FiAward className="w-10 h-10 text-[#059669] mx-auto mb-2" />
                        <h4 className="font-bold text-[#064E3B] text-xs uppercase mb-1">Impact Certificate</h4>
                        <p className="text-[10px] text-[#065F46]">Dynamic verification of food rescue compliance & environmental savings.</p>
                    </div>

                    <button 
                        disabled={certificateGenerating}
                        onClick={handleGenerateCertificate}
                        className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-55"
                    >
                        {certificateGenerating ? 'Generating Certificate...' : 'Generate & Download'}
                    </button>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, desc, color }) {
    const colorClasses = {
        green: 'text-[#059669] bg-[#ECFDF5] border-[#D1FAE5]',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        teal: 'text-teal-600 bg-teal-50 border-teal-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-5 flex items-center gap-4">
            <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
                <p className="text-[10px] text-gray-400 font-semibold">{desc}</p>
            </div>
        </div>
    );
}
