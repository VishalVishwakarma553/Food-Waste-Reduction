import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMapPin, FiPhone, FiChevronLeft, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { mockOrders } from '../../data/mockData';

const statusFlow = ['placed', 'confirmed', 'ready', 'completed'];

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const order = mockOrders.find(o => o.id === id) || mockOrders[0];
    const currentStep = statusFlow.indexOf(order.status);

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#065F46] hover:text-[#059669] cursor-pointer transition-colors">
                <FiChevronLeft className="w-4 h-4" /> Back to Orders
            </button>

            {/* Order Header */}
            <div className="card-flat p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl font-bold text-[#064E3B]">Order #{order.id}</h1>
                        <button className="text-[#065F46] hover:text-[#059669] cursor-pointer transition-colors" title="Copy ID">
                            📋
                        </button>
                    </div>
                    <p className="text-sm text-[#065F46]">{new Date(order.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <span className={`badge text-sm px-4 py-2 ${order.status === 'completed' ? 'status-completed' :
                        order.status === 'confirmed' ? 'status-confirmed' :
                            order.status === 'ready' ? 'status-ready' :
                                order.status === 'cancelled' ? 'status-cancelled' : 'status-pending'
                    }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Timeline */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-6">Order Status</h3>
                        <div className="space-y-4">
                            {order.statusHistory.map((s, i) => {
                                const isDone = i <= currentStep;
                                const isActive = i === currentStep && order.status !== 'completed';
                                return (
                                    <div key={s.status} className={`timeline-step ${isDone ? 'completed' : ''}`}>
                                        <div className={`timeline-dot ${isDone ? 'completed' : isActive ? 'active' : ''}`}>
                                            {isDone ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className={`text-sm font-bold ${isDone ? 'text-[#064E3B]' : 'text-[#065F46]'}`}>{s.label}</p>
                                            <p className="text-xs text-[#065F46]">{new Date(s.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
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
                                <div key={item.foodId} className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[#064E3B] text-sm">{item.name}</p>
                                        <p className="text-xs text-[#065F46]">Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-bold text-[#064E3B]">₹{item.price * item.qty}</p>
                                </div>
                            ))}
                            <div className="border-t border-[#D1FAE5] pt-4 flex justify-between">
                                <span className="font-bold text-[#064E3B]">Total</span>
                                <span className="font-bold text-[#059669] text-lg">₹{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Info */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Pickup Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <FiMapPin className="text-[#059669] w-5 h-5 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#064E3B]">{order.restaurantName}</p>
                                    <p className="text-xs text-[#065F46]">{order.pickupAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiClock className="text-[#059669] w-5 h-5 shrink-0" />
                                <p className="text-sm text-[#064E3B]">Pickup Time: <strong>{order.pickupTime}</strong></p>
                            </div>
                        </div>

                        {/* QR Code Placeholder */}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
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
                    {/* Actions */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Actions</h3>
                        <div className="space-y-2">
                            {order.status === 'completed' && !order.isReviewed && (
                                <button className="btn-primary w-full justify-center text-sm py-2.5">Rate & Review</button>
                            )}
                            {order.status === 'completed' && (
                                <Link to="/consumer/listings" className="btn-secondary w-full justify-center text-sm py-2.5 flex items-center gap-2">
                                    <FiRefreshCw className="w-4 h-4" /> Reorder
                                </Link>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                                <button className="w-full py-2.5 rounded-2xl border-2 border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 cursor-pointer transition-colors">
                                    Cancel Order
                                </button>
                            )}
                            {order.status === 'completed' && (
                                <button className="flex items-center gap-2 w-full py-2.5 rounded-2xl bg-[#F0FDF4] text-[#064E3B] text-sm font-semibold justify-center hover:bg-[#D1FAE5] cursor-pointer transition-colors">
                                    <FiDownload className="w-4 h-4" /> Download Invoice
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
                            <div className="flex justify-between"><span className="text-white/80">Food Saved</span><span className="font-bold">{order.foodSaved}kg</span></div>
                            <div className="flex justify-between"><span className="text-white/80">CO₂ Reduced</span><span className="font-bold">{order.co2Reduced}kg</span></div>
                            <div className="flex justify-between"><span className="text-white/80">Money Saved</span><span className="font-bold">₹{order.moneySaved}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
