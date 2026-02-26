import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import { mockOrders } from '../../data/mockData';

const tabs = ['All', 'Active', 'Completed', 'Cancelled'];

const statusConfig = {
    pending: { label: 'Pending', cls: 'status-pending' },
    confirmed: { label: 'Confirmed', cls: 'status-confirmed' },
    ready: { label: 'Ready', cls: 'status-ready' },
    completed: { label: 'Completed', cls: 'status-completed' },
    cancelled: { label: 'Cancelled', cls: 'status-cancelled' },
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = mockOrders.filter(o => {
        const matchTab =
            activeTab === 'All' ? true :
                activeTab === 'Active' ? ['pending', 'confirmed', 'ready'].includes(o.status) :
                    activeTab === 'Completed' ? o.status === 'completed' :
                        o.status === 'cancelled';
        const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.restaurantName.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-[#064E3B]">My Orders</h1>
                <div className="relative max-w-xs flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#059669] w-4 h-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by ID or restaurant..."
                        className="input-field pl-10 py-2 text-sm" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`tab-btn ${activeTab === t ? 'active' : ''}`}>
                        {t}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-[#064E3B] mb-2">No orders found</h3>
                    <p className="text-[#065F46] mb-6">Start by browsing available food near you.</p>
                    <Link to="/consumer/listings" className="btn-primary text-sm">Browse Food</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => (
                        <Link
                            key={order.id}
                            to={`/consumer/order/${order.id}`}
                            className="card-flat p-5 flex items-center gap-4 hover:border-[#10B981] transition-all cursor-pointer block"
                        >
                            <img src={order.restaurantLogo} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 justify-between flex-wrap">
                                    <div>
                                        <p className="font-bold text-[#064E3B] text-sm">{order.restaurantName}</p>
                                        <p className="text-xs text-[#065F46] mt-0.5">#{order.id}</p>
                                    </div>
                                    <span className={`badge text-xs ${statusConfig[order.status]?.cls}`}>
                                        {statusConfig[order.status]?.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                    <span className="text-xs text-[#065F46]">
                                        {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="text-xs text-[#065F46]">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                                    <span className="font-bold text-[#059669] text-sm">₹{order.total}</span>
                                    {!order.isReviewed && order.status === 'completed' && (
                                        <span className="badge badge-amber text-xs">Rate & Review</span>
                                    )}
                                </div>
                            </div>
                            <FiChevronRight className="w-5 h-5 text-[#065F46] shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
