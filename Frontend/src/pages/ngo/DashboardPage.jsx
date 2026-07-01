import {
    FiPackage, FiShoppingBag, FiTrendingUp, FiClock, FiCheckCircle,
    FiChevronRight, FiBell, FiMapPin, FiPhone, FiCalendar, FiArrowRight, FiActivity
} from 'react-icons/fi';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { IMG_BASE_URL } from '../../lib/api';

export default function DashboardPage() {
    const { user, updateProfile } = useAuth();
    console.log(user)
    const ngoName = user?.businessName || user?.name || 'Helping Hands Foundation';
    const coordinatorName = user?.name || 'Coordinator';

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/ngo/dashboard');
            setDashboardData(data);
            if (data.user) {
                updateProfile(data.user);
            }
            setError(null);
        } catch (err) {
            console.error("fetchDashboard error:", err);
            setError(err.response?.data?.error || 'Failed to load dashboard data');
            toast.error('Could not load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleRequestPickup = async (donationId, restaurantName) => {
        try {
            await api.post('/ngo/donations/claim', {
                listingIds: [parseInt(donationId)],
                notes: "Requested from NGO Dashboard",
                pickupSlot: "Anytime"
            });
            toast.success(`Pickup request sent to ${restaurantName}!`);

            // Refresh dashboard data
            const { data } = await api.get('/ngo/dashboard');
            setDashboardData(data);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to claim donation");
        }
    };

    const handleCancelRequest = async (reqId) => {
        try {
            const orderId = reqId.split('-')[1] || reqId;
            await api.patch(`/ngo/pickups/${orderId}/cancel`);
            toast.success(`Request cancelled successfully`);

            // Refresh dashboard data
            const { data } = await api.get('/ngo/dashboard');
            setDashboardData(data);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to cancel request");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#059669] border-t-transparent" />
                <p className="text-sm font-semibold text-gray-700">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto mt-20">
                <h3 className="font-bold text-lg">Failed to Load Dashboard</h3>
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
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#064E3B] to-[#059669] rounded-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3 sm:gap-5">
                        {user?.avatar ? (
                            <img
                                src={`${IMG_BASE_URL}${user.avatar}`}
                                alt={ngoName}
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-4 border-white/20 shadow-lg bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold select-none shrink-0">
                                {ngoName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                                    Welcome, {ngoName}
                                </h1>
                                <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                                    <FiCheckCircle className="w-3 h-3" /> Verified NGO
                                </span>
                            </div>
                            <p className="text-[#D1FAE5] mt-1 text-sm">Logged in as {coordinatorName} (Coordinations Team)</p>
                        </div>
                    </div>
                    <div className="flex">
                        <Link to="/ngo/donations" className="btn-primary bg-white text-[#064E3B] hover:bg-[#F0FDF4] border-none text-sm py-2 px-4 font-semibold">
                            Browse Donations
                        </Link>
                    </div>
                </div>
                <div className="absolute top-[-20%] right-[-5%] w-[40%] h-[150%] bg-white/5 rotate-12 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard icon={FiShoppingBag} label="Active Requests" value={dashboardData?.activeRequestsCount || 0} trend="Awaiting processing" color="blue" />
                <MetricCard icon={FiCalendar} label="Pickups Scheduled Today" value={dashboardData?.todayPickupsCount || 0} trend="Requested today" color="green" />
                <MetricCard icon={FiPackage} label="Food Saved This Month" value={`${dashboardData?.foodSavedThisMonth || 0} kg`} trend="Served this month" color="teal" />
                <MetricCard icon={FiActivity} label="Beneficiary Reach" value={`${dashboardData?.beneficiaryReachThisMonth || 0} groups`} trend="Registered beneficiaries" color="amber" />
            </div>

            {/* Main content grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Available Donations Nearby */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-[#111827]">Donations Available Nearby</h2>
                                <p className="text-xs text-gray-500">Claim these donations before they expire</p>
                            </div>
                            <Link to="/ngo/donations" className="text-xs sm:text-sm text-[#059669] font-semibold hover:underline flex items-center gap-0.5">
                                View All <FiChevronRight />
                            </Link>
                        </div>

                        {dashboardData?.donationsNearby?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {dashboardData.donationsNearby.map((d) => (
                                    <div key={d.id} className="p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900 truncate text-sm">{d.restaurant}</h3>
                                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                                    <FiClock className="w-3 h-3" /> {d.expiry} left
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium mb-1">{d.foodType}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 mb-3">
                                                <span className="flex items-center gap-1"><FiPackage /> {d.quantity}</span>
                                                <span className="flex items-center gap-1"><FiMapPin /> {d.distance} away</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRequestPickup(d.id, d.restaurant)}
                                            className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2 rounded-xl text-xs font-semibold transition-colors mt-auto"
                                        >
                                            Request Pickup
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                                <FiShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                No active donations nearby within your service radius.
                            </div>
                        )}
                    </div>

                    {/* Active Requests Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                            <h2 className="text-base sm:text-lg font-bold text-[#111827]">Active Requests</h2>
                            <span className="text-xs text-gray-500">Recent requests status</span>
                        </div>
                        {dashboardData?.activeRequests?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[520px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                            <th className="px-4 py-3 font-semibold">Request ID</th>
                                            <th className="px-4 py-3 font-semibold">Restaurant</th>
                                            <th className="px-4 py-3 font-semibold">Item & Qty</th>
                                            <th className="px-4 py-3 font-semibold">Time</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {dashboardData.activeRequests.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-xs">{r.id}</td>
                                                <td className="px-4 py-3 font-medium text-gray-700 text-xs">{r.restaurant}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900 text-xs">{r.item}</p>
                                                    <p className="text-xs text-gray-500">{r.qty}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{r.time}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${r.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        r.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {r.status === 'Pending' ? (
                                                        <button
                                                            onClick={() => handleCancelRequest(r.id)}
                                                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : (
                                                        <Link to="/ngo/pickups" className="text-xs font-semibold text-[#059669] hover:underline">
                                                            Details
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-xs">
                                No recent requests logged yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Alerts & Notifications */}
                    {/* {dashboardData?.alerts?.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                            <h2 className="text-lg font-bold text-[#111827] mb-4">Alerts & Updates</h2>
                            <div className="space-y-3">
                                {dashboardData.alerts.map(alert => (
                                    <Link to={alert.link} key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <p className="text-xs text-gray-700">{alert.text}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )} */}

                    {/* Today's Pickups Timeline */}
                    {/* <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-[#111827]">Upcoming Pickups</h2>
                            <Link to="/ngo/pickups" className="text-xs text-[#059669] font-semibold hover:underline">Full Schedule</Link>
                        </div>
                        {dashboardData?.upcomingPickups?.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.upcomingPickups.map((pickup) => (
                                    <div key={pickup.id} className="relative pl-6 pb-2 border-l border-gray-200 last:border-none last:pb-0">
                                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#059669]" />
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-bold text-gray-900">{pickup.restaurant}</h3>
                                            <span className="text-[10px] font-semibold text-gray-500">{pickup.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{pickup.address}</p>
                                        <p className="text-xs font-semibold text-gray-700 mt-1">{pickup.items} ({pickup.qty})</p>
                                        <div className="flex gap-2 mt-3">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickup.address)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] font-bold text-[#059669] bg-green-50 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                Get Directions
                                            </a>
                                            <button
                                                onClick={() => toast.success(`Calling coordinator for ${pickup.restaurant}...`)}
                                                className="text-[10px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-xs">
                                No upcoming pickups scheduled.
                            </div>
                        )}
                    </div> */}

                    {/* Quick Actions Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <h2 className="text-lg font-bold text-[#111827] mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionBtn to="/ngo/donations" icon={FiShoppingBag} label="Claim Food" color="green" />
                            <QuickActionBtn to="/ngo/pickups" icon={FiCalendar} label="Pickups" color="blue" />
                            <QuickActionBtn to="/ngo/impact" icon={FiTrendingUp} label="Impact Report" color="purple" />
                            <QuickActionBtn to="/ngo/profile" icon={FiPackage} label="Verification" color="amber" />
                        </div>
                    </div>

                    {/* Impact Summary Mini Widget */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]  p-6">
                        <h2 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-1">
                            <FiActivity className="text-[#059669]" /> Monthly Distribution Summary
                        </h2>
                        <div className="h-55">
                            {dashboardData?.monthlyDistributionSummary?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.monthlyDistributionSummary} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                                        <Bar dataKey="foodCollected" name="Food (kg)" fill="#059669" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="beneficiaries" name="Distributions" fill="#10B981" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-12 text-gray-400 text-xs">
                                    No distribution metrics logged yet.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, trend, color }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        green: 'text-[#059669] bg-[#ECFDF5] border-[#D1FAE5]',
        teal: 'text-teal-600 bg-teal-50 border-teal-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
}

function QuickActionBtn({ to, icon: Icon, label, color }) {
    const colorClasses = {
        green: 'text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5]',
        blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
        purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
        amber: 'text-amber-600 bg-amber-50 hover:bg-amber-100',
    };

    return (
        <Link to={to} className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-all text-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${colorClasses[color]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-gray-700">{label}</span>
        </Link>
    );
}
