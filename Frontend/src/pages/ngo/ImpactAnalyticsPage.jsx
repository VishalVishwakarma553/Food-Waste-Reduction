import { useState, useEffect } from 'react';
import {
    FiBarChart2, FiAward, FiDownload, FiGlobe, FiGrid,
    FiPackage, FiActivity, FiArrowUpRight, FiHeart, FiStar
} from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7'];

export default function ImpactAnalyticsPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartMetric, setChartMetric] = useState('kg'); // kg | meals
    const [certificateGenerating, setCertificateGenerating] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/ngo/impact');
                setAnalytics(data);
                setError(null);
            } catch (err) {
                console.error("fetchAnalytics error:", err);
                setError(err.response?.data?.error || 'Failed to load impact analytics');
                toast.error('Could not load impact data');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleDownloadReport = (type) => {
        if (!analytics) return;
        try {
            const csvContent = "data:text/csv;charset=utf-8," 
                + "Month,Food Served (kg),Times Distributed\n"
                + analytics.monthlyData.map(d => `${d.month},${d.kg},${d.meals}`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${(user?.businessName || 'ngo').replace(/\s+/g, '_')}_monthly_impact_report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Exported ${type} report CSV successfully!`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to export report");
        }
    };

    const handleGenerateCertificate = () => {
        setCertificateGenerating(true);
        setTimeout(() => {
            setCertificateGenerating(false);
            
            const ngoName = user?.businessName || user?.name || "Our NGO Partner";
            const foodServed = analytics?.metrics?.totalFoodServed || 0;
            const beneficiaryReach = analytics?.metrics?.beneficiaryReach || 0;
            const partnerEstablishments = analytics?.metrics?.partnerEstablishments || 0;
            const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

            const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#f8fafc"/>
  <rect x="20" y="20" width="760" height="560" fill="white" stroke="#059669" stroke-width="8" rx="8"/>
  <rect x="30" y="30" width="740" height="540" fill="none" stroke="#10b981" stroke-width="2" rx="4"/>
  <path d="M 30 70 L 70 30" stroke="#059669" stroke-width="4"/>
  <path d="M 730 30 L 770 70" stroke="#059669" stroke-width="4"/>
  <path d="M 30 530 L 70 570" stroke="#059669" stroke-width="4"/>
  <path d="M 730 570 L 770 530" stroke="#059669" stroke-width="4"/>
  <text x="400" y="100" font-family="'Inter', sans-serif" font-size="14" font-weight="600" fill="#059669" letter-spacing="4" text-anchor="middle">CERTIFICATE OF ENVIRONMENTAL IMPACT</text>
  <text x="400" y="150" font-family="'Inter', sans-serif" font-size="32" font-weight="bold" fill="#064e3b" text-anchor="middle">Eco-Hero Recognition</text>
  <text x="400" y="200" font-family="'Inter', sans-serif" font-size="14" fill="#64748b" text-anchor="middle">This certificate is proudly presented to</text>
  <text x="400" y="250" font-family="'Inter', sans-serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">${ngoName}</text>
  <line x1="200" y1="265" x2="600" y2="265" stroke="#cbd5e1" stroke-width="1"/>
  <text x="400" y="300" font-family="'Inter', sans-serif" font-size="14" fill="#334155" text-anchor="middle">
    In recognition of their outstanding contribution to food rescue operations,
  </text>
  <text x="400" y="320" font-family="'Inter', sans-serif" font-size="14" fill="#334155" text-anchor="middle">
    preventing waste, and fostering sustainability in the community.
  </text>
  <g transform="translate(100, 360)">
    <rect x="0" y="0" width="180" height="90" fill="#ecfdf5" rx="8" stroke="#d1fae5" stroke-width="1"/>
    <text x="90" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#059669" text-anchor="middle">FOOD SERVED</text>
    <text x="90" y="65" font-family="'Inter', sans-serif" font-size="20" font-weight="bold" fill="#064e3b" text-anchor="middle">${foodServed} kg</text>
    <rect x="210" y="0" width="180" height="90" fill="#ecfdf5" rx="8" stroke="#d1fae5" stroke-width="1"/>
    <text x="300" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#059669" text-anchor="middle">BENEFICIARIES</text>
    <text x="300" y="65" font-family="'Inter', sans-serif" font-size="20" font-weight="bold" fill="#064e3b" text-anchor="middle">${beneficiaryReach} groups</text>
    <rect x="420" y="0" width="180" height="90" fill="#ecfdf5" rx="8" stroke="#d1fae5" stroke-width="1"/>
    <text x="510" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#059669" text-anchor="middle">ACTIVE PARTNERS</text>
    <text x="510" y="65" font-family="'Inter', sans-serif" font-size="20" font-weight="bold" fill="#064e3b" text-anchor="middle">${partnerEstablishments} partners</text>
  </g>
  <text x="150" y="520" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Date: ${dateStr}</text>
  <text x="650" y="500" font-family="'Inter', sans-serif" font-size="16" font-style="italic" fill="#059669" text-anchor="middle">FoodSave Platform</text>
  <line x1="550" y1="510" x2="750" y2="510" stroke="#94a3b8" stroke-width="1"/>
  <text x="650" y="525" font-family="'Inter', sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Official Environmental Stamp</text>
  <circle cx="400" cy="510" r="25" fill="#f59e0b" opacity="0.9"/>
  <polygon points="390,495 410,495 415,510 400,525 385,510" fill="#d97706"/>
  <text x="400" y="514" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">SEAL</text>
</svg>
            `;

            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${ngoName.replace(/\s+/g, '_')}_Impact_Certificate.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Your digital NGO Impact Certificate has been downloaded! 🏆');
        }, 1200);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#059669] border-t-transparent" />
                <p className="text-sm font-semibold text-gray-700">Loading impact analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto mt-20">
                <h3 className="font-bold text-lg">Failed to Load Analytics</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Impact Reports & Analytics</h1>
                    <p className="text-[#065F46] mt-1">Detailed breakdown of food distribution volumes and partnerships.</p>
                </div>
                <button 
                    onClick={() => handleDownloadReport('Annual')}
                    className="bg-white border text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm self-start"
                >
                    <FiDownload /> Export Annual Report
                </button>
            </div>

            {/* Empty State Banner (if no food served yet) */}
            {analytics?.metrics?.totalFoodServed === 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
                    <div className="space-y-1 text-center sm:text-left">
                        <h3 className="font-bold text-emerald-950">Start Creating Your Impact!</h3>
                        <p className="text-xs text-emerald-800">You haven't completed any distributions yet. Claim available donations nearby and log distributions to feed beneficiaries.</p>
                    </div>
                    <Link to="/ngo/donations" className="bg-[#059669] hover:bg-[#047857] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm shrink-0">
                        Browse Available Donations
                    </Link>
                </div>
            )}

            {/* Hero stats grid (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard icon={FiPackage} label="Lifetime Food Saved" value={`${analytics?.metrics?.totalFoodServed?.toLocaleString('en-IN') || 0} kg`} desc="Food served to beneficiaries" color="green" />
                <MetricCard icon={FiActivity} label="Beneficiaries Reach" value={`${analytics?.metrics?.beneficiaryReach?.toLocaleString('en-IN') || 0}`} desc="Registered beneficiaries" color="blue" />
                <MetricCard icon={FiAward} label="Partner Establishments" value={`${analytics?.metrics?.partnerEstablishments || 0}`} desc="Active collaborations" color="amber" />
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Monthly trends chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Food Rescue & Distribution Trends</h2>
                            <p className="text-xs text-gray-500">Track distribution volume by Weight Served or Distribution Frequency</p>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1 self-start">
                            <button 
                                onClick={() => setChartMetric('kg')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartMetric === 'kg' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500'}`}
                            >
                                Weight Served (kg)
                            </button>
                            <button 
                                onClick={() => setChartMetric('meals')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartMetric === 'meals' ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-500'}`}
                            >
                                Distributions (Qty)
                            </button>
                        </div>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.monthlyData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey={chartMetric} name={chartMetric === 'kg' ? 'Food Served (kg)' : 'Times Distributed (qty)'} fill="#059669" radius={[4, 4, 0, 0]} />
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
                        {analytics?.categoryData?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-400 text-xs py-8">
                                <FiGrid className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                No category data available yet.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Partners Table & Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top partner restaurants */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b pb-2">Top Partner Contributors</h2>
                    <div className="space-y-4">
                        {analytics?.topPartners?.length > 0 ? (
                            analytics.topPartners.map((p, idx) => (
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
                            ))
                        ) : (
                            <div className="text-center text-gray-400 text-xs py-12">
                                No partner contributions logged yet.
                            </div>
                        )}
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
