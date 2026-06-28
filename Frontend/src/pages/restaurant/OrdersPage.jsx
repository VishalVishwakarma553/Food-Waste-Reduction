import { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiMoreVertical, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const statusConfig = {
    pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    confirmed: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    ready:     { label: 'Ready',     cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-800 border-green-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-800 border-red-200' },
};

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/restaurant/orders');
            setOrders(data.orders);
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            const { data } = await api.patch(`/restaurant/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
            toast.success(`Order #${orderId} marked as ${statusConfig[newStatus]?.label || newStatus}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update order');
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter !== 'All' && order.status !== statusFilter.toLowerCase()) return false;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            const matchesId = String(order.id).includes(q);
            const matchesCustomer = (order.consumer?.name || '').toLowerCase().includes(q);
            if (!matchesId && !matchesCustomer) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Order Management</h1>
                    <p className="text-[#065F46] mt-1">Track and update food pickups.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gray-50/50">
                    <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-full md:w-auto flex-wrap">
                        {['All','Pending','Ready','Completed','Cancelled'].map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === status ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >{status}</button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search orders or customers..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-900">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col lg:flex-row xl:items-center gap-4 lg:gap-6 cursor-pointer"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                    {/* Order ID & Status */}
                                    <div className="flex-1 min-w-0 flex items-start justify-between lg:justify-start lg:block">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900">#{order.id}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[order.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                                                    {statusConfig[order.status]?.label || order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <FiClock className="w-3.5 h-3.5" />
                                                {new Date(order.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Customer */}
                                    <div className="flex items-center gap-3 min-w-[160px]">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#059669] to-[#064E3B] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {(order.consumer?.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{order.consumer?.name || 'Unknown'}</p>
                                            {order.consumer?.phone && (
                                                <p className="text-xs text-gray-500">{order.consumer.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Items */}
                                    <div className="flex items-center gap-2 min-w-[100px]">
                                        <FiShoppingBag className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {order.items.reduce((sum,i) => sum + i.quantity, 0)} items
                                        </span>
                                    </div>


                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 xl:justify-end">
                                        {order.status === 'pending' && (
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'ready'); }}
                                                disabled={updating === order.id}
                                                className="btn-primary py-1.5 px-4 text-xs shrink-0 disabled:opacity-50"
                                            >{updating === order.id ? '...' : 'Mark Ready'}</button>
                                        )}
                                        {(order.status === 'pending' || order.status === 'ready') && (
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'cancelled'); }}
                                                disabled={updating === order.id}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 px-3 rounded-xl font-semibold text-xs transition-transform transform active:scale-95 shrink-0 disabled:opacity-50 flex items-center gap-1"
                                            >{updating === order.id ? '...' : <><FiXCircle className="w-3.5 h-3.5" />Cancel</>}</button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'completed'); }}
                                                disabled={updating === order.id}
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-xl font-semibold text-xs transition-transform transform active:scale-95 shrink-0 disabled:opacity-50"
                                            >{updating === order.id ? '...' : <><FiCheckCircle className="w-3.5 h-3.5 inline mr-1" />Confirm Pickup</>}</button>
                                        )}
                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FiMoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 pl-2 pr-2 lg:pr-12">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <FiShoppingBag className="w-4 h-4 text-gray-500" />
                                            Order Items ({order.items.reduce((acc,item) => acc + item.quantity, 0)})
                                        </h4>
                                        <div className="bg-white border text-sm border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between p-3 items-center">
                                                    <div className="flex gap-3 items-center">
                                                        <span className="font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                                        <span className="text-gray-800">{item.name}</span>
                                                    </div>
                                                    {item.pickupSlot && <span className="text-xs text-gray-400">{item.pickupSlot}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        {order.notes && (
                                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                                <span className="font-medium">Notes:</span> {order.notes}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <FiShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900">No orders found</p>
                            <p className="text-sm">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

