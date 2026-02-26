import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notes, setNotes] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState(false);

    const foodSaved = cartItems.reduce((sum, i) => sum + 0.4 * i.quantity, 0).toFixed(1);

    const handlePlaceOrder = () => {
        if (!accepted) return;
        setPlacing(true);
        setTimeout(() => {
            clearCart();
            setPlacing(false);
            setPlaced(true);
            setTimeout(() => navigate('/consumer/orders'), 3000);
        }, 1500);
    };

    if (placed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 rounded-full bg-[#D1FAE5] flex items-center justify-center mb-6 text-5xl animate-count-up">✅</div>
                <h2 className="text-3xl font-bold text-[#064E3B] mb-3">Order Placed!</h2>
                <p className="text-[#065F46] mb-2">Your order has been confirmed. Please pick up at the scheduled time.</p>
                <p className="text-sm text-[#065F46]">Redirecting to orders in 3 seconds...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-24">
                <p className="text-xl text-[#064E3B] mb-4">Your cart is empty.</p>
                <Link to="/consumer/listings" className="btn-primary">Browse Food</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#064E3B]">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Pickup Locations */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2">
                            <FiMapPin className="text-[#059669] w-4 h-4" /> Pickup Locations
                        </h3>
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.foodId} className="bg-[#F0FDF4] rounded-xl p-4">
                                    <div className="flex gap-3 mb-2">
                                        <img src={item.food.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-[#064E3B]">{item.food.name} × {item.quantity}</p>
                                            <p className="text-xs text-[#065F46]">{item.food.restaurantName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[#065F46]">
                                        <FiMapPin className="w-3 h-3 text-[#059669]" /> Go to: <strong className="text-[#064E3B]">Address given by restaurant at confirmation</strong>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[#065F46] mt-1">
                                        <FiClock className="w-3 h-3 text-[#059669]" /> Slot: <strong className="text-[#064E3B]">{item.pickupSlot}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-[#065F46] mb-1">Name</p>
                                <p className="font-semibold text-[#064E3B]">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-[#065F46] mb-1">Phone</p>
                                <p className="font-semibold text-[#064E3B]">{user?.phone}</p>
                            </div>
                            <div>
                                <p className="text-[#065F46] mb-1">Email</p>
                                <p className="font-semibold text-[#064E3B]">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-3 flex items-center gap-2">
                            <FiFileText className="text-[#059669] w-4 h-4" /> Order Notes (Optional)
                        </h3>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            maxLength={200}
                            placeholder="Any special instructions for the restaurant..."
                            className="input-field resize-none h-20 text-sm"
                        />
                        <p className="text-xs text-[#065F46] mt-1">{notes.length}/200</p>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer card-flat p-5">
                        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="custom-checkbox w-4 h-4 rounded mt-0.5 shrink-0" />
                        <span className="text-sm text-[#065F46]">
                            I understand that this is a <strong className="text-[#064E3B]">pickup-only order</strong> and I agree to FoodSave's
                            {' '}<span className="text-[#059669] underline cursor-pointer">Terms of Service</span> and
                            {' '}<span className="text-[#059669] underline cursor-pointer">Cancellation Policy</span>.
                        </span>
                    </label>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-5">Order Summary</h3>
                        <div className="space-y-3 mb-5">
                            {cartItems.map(item => (
                                <div key={item.foodId} className="flex items-center gap-3">
                                    <img src={item.food.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-[#064E3B] truncate">{item.food.name}</p>
                                        <p className="text-xs text-[#065F46]">×{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-bold text-[#059669] shrink-0 bg-[#D1FAE5] px-2 py-0.5 rounded">Free</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-[#D1FAE5] pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-[#065F46]">Platform Fee</span><span>₹0</span></div>
                            <div className="flex justify-between font-bold text-[#064E3B] text-base pt-2 border-t border-[#D1FAE5]">
                                <span>Total Cost</span><span className="text-[#059669]">Free</span>
                            </div>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={!accepted || placing}
                            className={`mt-5 w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${accepted ? 'btn-primary cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {placing
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <><FiCheckCircle className="w-5 h-5" /> Place Order</>
                            }
                        </button>
                    </div>

                    {/* Impact */}
                    <div className="bg-gradient-to-br from-[#059669] to-[#0891B2] rounded-2xl p-5 text-white text-sm">
                        <h4 className="font-bold mb-3">Your Impact</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-white/80">Food Rescued</span><span className="font-bold">~{foodSaved}kg</span></div>
                            <div className="flex justify-between"><span className="text-white/80">CO₂ Saved</span><span className="font-bold">~{(foodSaved * 0.4).toFixed(2)}kg</span></div>
                        </div>
                    </div>

                    <Link to="/consumer/cart" className="block text-center text-sm text-[#059669] font-semibold hover:underline">
                        ← Edit Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}
