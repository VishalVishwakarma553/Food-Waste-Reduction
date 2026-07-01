import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMapPin, FiPhone, FiChevronLeft, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api, { IMG_BASE_URL } from '../../lib/api';

const statusFlow = ['pending', 'confirmed', 'approved', 'completed'];

const statusLabel = { 
    pending: 'Order Placed', 
    confirmed: 'Confirmed', 
    approved: 'Ready for Pickup', 
    ready: 'Ready for Pickup',
    completed: 'Completed', 
    cancelled: 'Cancelled' 
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        api.get(`/consumer/orders/${id}`)
            .then(r => setOrder(r.data.order))
            .catch(() => toast.error('Order not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleCancel = async () => {
        if (!confirm('Cancel this order?')) return;
        setCancelling(true);
        try {
            const r = await api.patch(`/consumer/orders/${id}/cancel`);
            setOrder(r.data.order);
            toast.success('Order cancelled');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel');
        } finally {
            setCancelling(false);
        }
    };

    const handleComplete = async () => {
        if (!confirm('Mark this order as completed?')) return;
        setCompleting(true);
        try {
            const r = await api.patch(`/consumer/orders/${id}/complete`);
            setOrder(r.data.order);
            toast.success('Order completed! Thank you for rescuing food.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to complete order');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-[#065F46]">Loading...</div>;
    if (!order) return <div className="text-center py-20 text-[#064E3B]">Order not found.</div>;

    const statusVal = order.status === 'ready' ? 'approved' : order.status;
    const currentStep = statusFlow.indexOf(statusVal);
    const stepsToShow = order.status === 'cancelled'
        ? [{ status: 'pending', label: 'Order Placed' }, { status: 'cancelled', label: 'Cancelled' }]
        : statusFlow.map(s => ({ status: s, label: statusLabel[s] }));

    const statusCls =
        order.status === 'completed' ? 'status-completed' :
        order.status === 'confirmed' ? 'status-confirmed' :
        (order.status === 'approved' || order.status === 'ready') ? 'status-ready' :
        order.status === 'cancelled' ? 'status-cancelled' : 'status-pending';

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#065F46] hover:text-[#059669] cursor-pointer transition-colors">
                <FiChevronLeft className="w-4 h-4" /> Back to Orders
            </button>

            {/* Header */}
            <div className="card-flat p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl font-bold text-[#064E3B]">Order #{order.id}</h1>
                    </div>
                    <p className="text-sm text-[#065F46]">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <span className={`badge text-sm px-4 py-2 ${statusCls}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Timeline */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-6">Order Status</h3>
                        <div className="space-y-4">
                            {stepsToShow.map((s, i) => {
                                const isDone = order.status === 'cancelled'
                                    ? i === 0 || s.status === 'cancelled'
                                    : i <= currentStep;
                                const isActive = !isDone && i === currentStep + 1;
                                return (
                                    <div key={s.status} className={`timeline-step ${isDone ? 'completed' : ''}`}>
                                        <div className={`timeline-dot ${isDone ? 'completed' : isActive ? 'active' : ''}`}>
                                            {isDone ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className={`text-sm font-bold ${isDone ? 'text-[#064E3B]' : 'text-[#065F46]'}`}>{s.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Items Ordered</h3>
                        <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    {item.image
                                        ? <img src={`${IMG_BASE_URL}${item.image}`} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                        : <div className="w-14 h-14 rounded-xl bg-[#D1FAE5] flex items-center justify-center text-2xl shrink-0">🍱</div>
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[#064E3B] text-sm">{item.name}</p>
                                        <p className="text-xs text-[#065F46]">{item.restaurantName}</p>
                                        <p className="text-xs text-[#065F46]">Qty: {item.quantity} {item.pickupSlot && `· Slot: ${item.pickupSlot}`}</p>
                                    </div>
                                    <p className="font-bold text-[#059669] bg-[#D1FAE5] px-2 py-1 rounded text-xs">Free</p>
                                </div>
                            ))}
                            <div className="border-t border-[#D1FAE5] pt-4 flex justify-between">
                                <span className="font-bold text-[#064E3B]">Total</span>
                                <span className="font-bold text-[#059669] text-lg">Free</span>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Info */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Pickup Details</h3>
                        <div className="space-y-3">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-start gap-3">
                                    <FiMapPin className="text-[#059669] w-5 h-5 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#064E3B]">{item.restaurantName}</p>
                                        {item.pickupSlot && <p className="text-xs text-[#065F46]">Slot: {item.pickupSlot}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!['completed', 'cancelled'].includes(order.status) && (
                            <div className="mt-4 bg-[#F0FDF4] border border-[#D1FAE5] rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#064E3B] rounded-xl flex items-center justify-center text-white text-xs font-bold text-center">
                                    QR<br />Code
                                </div>
                                <div>
                                    <p className="font-semibold text-[#064E3B] text-sm">Show this QR at pickup</p>
                                    <p className="text-xs text-[#065F46]">The restaurant will scan to verify your order.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Actions</h3>
                        <div className="space-y-2">
                            {order.status === 'completed' && (
                                <Link to="/consumer/listings" className="btn-secondary w-full justify-center text-sm py-2.5 flex items-center gap-2">
                                    <FiRefreshCw className="w-4 h-4" /> Order Again
                                </Link>
                            )}
                            {(order.status === 'approved' || order.status === 'ready') && (
                                <button
                                    onClick={handleComplete}
                                    disabled={completing}
                                    className="w-full py-2.5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                                >
                                    {completing ? 'Completing...' : <><FiCheckCircle className="w-4 h-4" /> Mark Complete</>}
                                </button>
                            )}
                            {['pending', 'confirmed', 'approved', 'ready'].includes(order.status) && (
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full py-2.5 rounded-2xl border-2 border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-60"
                                >
                                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            )}
                            <button className="flex items-center gap-2 w-full py-2.5 text-[#065F46] text-sm justify-center hover:text-[#059669] cursor-pointer transition-colors">
                                <FiPhone className="w-4 h-4" /> Contact Restaurant
                            </button>
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="bg-gradient-to-br from-[#059669] to-[#0891B2] rounded-2xl p-5 text-white text-sm">
                        <h4 className="font-bold mb-3">Order Impact</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-white/80">Food Saved</span><span className="font-bold">~{order.foodSaved}kg</span></div>
                            <div className="flex justify-between"><span className="text-white/80">CO₂ Reduced</span><span className="font-bold">~{order.co2Saved}kg</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
