import {
    FiPackage, FiShoppingBag, FiTrendingUp, FiClock, FiCheckCircle,
    FiChevronRight, FiBell, FiMapPin, FiPhone, FiCalendar, FiArrowRight, FiActivity
} from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

const mockImpactData = [
    { name: 'Jan', foodCollected: 400, beneficiaries: 800 },
    { name: 'Feb', foodCollected: 300, beneficiaries: 650 },
    { name: 'Mar', foodCollected: 500, beneficiaries: 1100 },
    { name: 'Apr', foodCollected: 450, beneficiaries: 950 },
    { name: 'May', foodCollected: 600, beneficiaries: 1300 },
    { name: 'Jun', foodCollected: 800, beneficiaries: 1800 },
];

const mockDonations = [
    { id: '1', restaurant: 'Gourmet Kitchen', foodType: 'Fresh Bread & Pastries', quantity: '15 kg', distance: '1.2 km', expiry: '2 hours' },
    { id: '2', restaurant: 'Star Buffet', foodType: 'Prepared Meals (Veg rice/curry)', quantity: '25 kg', distance: '2.5 km', expiry: '4 hours' },
    { id: '3', restaurant: 'Green Salads Co', foodType: 'Organic Veg Mix', quantity: '8 kg', distance: '0.8 km', expiry: '1 hour' },
    { id: '4', restaurant: 'Supermart Express', foodType: 'Assorted Dairy Products', quantity: '12 kg', distance: '3.1 km', expiry: '5 hours' },
];

const mockPickups = [
    { id: 'P1', restaurant: 'Gourmet Kitchen', address: '12 Bakery Lane, City Center', time: '04:30 PM', items: 'Fresh Bread', qty: '15 kg', status: 'Confirmed' },
    { id: 'P2', restaurant: 'Pizza Palace', address: '45 High St, North End', time: '06:00 PM', items: 'Surplus Pizzas', qty: '10 kg', status: 'Pending' },
];

const mockRequests = [
    { id: 'REQ-2045', restaurant: 'Gourmet Kitchen', item: 'Fresh Bread', qty: '15 kg', time: '10:30 AM', status: 'Confirmed' },
    { id: 'REQ-2044', restaurant: 'Pizza Palace', item: 'Surplus Pizzas', qty: '10 kg', time: '09:15 AM', status: 'Pending' },
    { id: 'REQ-2043', restaurant: 'Downtown Cafe', item: 'Sandwiches & Salads', qty: '5 kg', time: 'Yesterday', status: 'Completed' },
];

const mockAlerts = [
    { id: 1, type: 'warning', text: '12A registration document expires in 15 days', link: '/ngo/profile' },
    { id: 2, type: 'info', text: 'New bulk donation posted by Gourmet Kitchen (1.2 km)', link: '/ngo/donations' },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const ngoName = user?.businessName || user?.name || 'Helping Hands Foundation';
    const coordinatorName = user?.name || 'Coordinator';

    const [requests, setRequests] = useState(mockRequests);

    const handleRequestPickup = (donationId, restaurantName) => {
        toast.success(`Pickup request sent to ${restaurantName}!`);
        // Add to active requests table optimistically
        const newReq = {
            id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
            restaurant: restaurantName,
            item: 'Requested Surplus',
            qty: 'Calculated at pickup',
            time: 'Just now',
            status: 'Pending'
        };
        setRequests([newReq, ...requests]);
    };

    const handleCancelRequest = (reqId) => {
        setRequests(prev => prev.filter(r => r.id !== reqId));
        toast.error(`Request ${reqId} cancelled successfully`);
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#064E3B] to-[#059669] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between">
                <div className="relative z-10 flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white/20 shadow-lg bg-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold select-none">
                        {ngoName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Playfair Display SC', serif" }}>
                                Welcome, {ngoName}
                            </h1>
                            <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <FiCheckCircle className="w-3 h-3" /> Verified NGO
                            </span>
                        </div>
                        <p className="text-[#D1FAE5] mt-1">Logged in as {coordinatorName} (Coordinations Team)</p>
                    </div>
                </div>
                <div className="relative z-10">
                    <Link to="/ngo/donations" className="btn-primary bg-white text-[#064E3B] hover:bg-[#F0FDF4] border-none font-semibold">
                        Browse Donations
                    </Link>
                </div>
                <div className="absolute top-[-20%] right-[-5%] w-[40%] h-[150%] bg-white/5 rotate-12 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={FiShoppingBag} label="Active Requests" value={requests.filter(r => r.status === 'Pending' || r.status === 'Confirmed').length} trend="Awaiting approval" color="blue" />
                <MetricCard icon={FiCalendar} label="Pickups Scheduled Today" value={mockPickups.length} trend="In Progress" color="green" />
                <MetricCard icon={FiPackage} label="Food Saved This Month" value="480 kg" trend="+12% from last month" color="teal" />
                <MetricCard icon={FiActivity} label="Beneficiary Reach" value="1,800 served" trend="This Month" color="amber" />
            </div>

            {/* Main content grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Available Donations Nearby */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#111827]">Donations Available Nearby</h2>
                                <p className="text-xs text-gray-500">Claim these donations before they expire</p>
                            </div>
                            <Link to="/ngo/donations" className="text-sm text-[#059669] font-semibold hover:underline flex items-center gap-0.5">
                                View All <FiChevronRight />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mockDonations.map((d) => (
                                <div key={d.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900 truncate">{d.restaurant}</h3>
                                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                                <FiClock className="w-3 h-3" /> {d.expiry} left
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium mb-1">{d.foodType}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 mb-4">
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
                    </div>

                    {/* Active Requests Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#111827]">Active Requests</h2>
                            <span className="text-xs text-gray-500">Recent requests status</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-4 font-semibold">Request ID</th>
                                        <th className="px-6 py-4 font-semibold">Restaurant</th>
                                        <th className="px-6 py-4 font-semibold">Item & Qty</th>
                                        <th className="px-6 py-4 font-semibold">Time</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {requests.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{r.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{r.restaurant}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{r.item}</p>
                                                <p className="text-xs text-gray-500">{r.qty}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{r.time}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    r.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    r.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {r.status === 'Pending' ? (
                                                    <button 
                                                        onClick={() => handleCancelRequest(r.id)}
                                                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <Link to={`/ngo/requests/${r.id.split('-')[1] || r.id}`} className="text-xs font-semibold text-[#059669] hover:underline">
                                                        Details
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Alerts & Notifications */}
                    {mockAlerts.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                            <h2 className="text-lg font-bold text-[#111827] mb-4">Alerts & Updates</h2>
                            <div className="space-y-3">
                                {mockAlerts.map(alert => (
                                    <Link to={alert.link} key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                            alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                        <p className="text-xs text-gray-700">{alert.text}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Today's Pickups Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-[#111827]">Today's Pickups</h2>
                            <Link to="/ngo/pickups" className="text-xs text-[#059669] font-semibold hover:underline">Full Schedule</Link>
                        </div>
                        <div className="space-y-4">
                            {mockPickups.map((pickup, idx) => (
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
                                            onClick={() => toast.success(`Calling ${pickup.restaurant} coordinator...`)}
                                            className="text-[10px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            Contact
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

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
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                        <h2 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-1">
                            <FiActivity className="text-[#059669]" /> Monthly Distribution Summary
                        </h2>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockImpactData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                                    <Bar dataKey="foodCollected" name="Food (kg)" fill="#059669" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="beneficiaries" name="Reach" fill="#10B981" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
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
