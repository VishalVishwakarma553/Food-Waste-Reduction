import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, updatePickupSlot, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [removing, setRemoving] = useState(null);

    const handleRemove = (foodId) => {
        setRemoving(foodId);
        setTimeout(() => { removeFromCart(foodId); setRemoving(null); }, 300);
    };

    const foodSaved = cartItems.reduce((sum, i) => sum + 0.4 * i.quantity, 0).toFixed(1);
    const co2Saved = (foodSaved * 0.4).toFixed(2);

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-24">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-2xl font-bold text-[#064E3B] mb-3">Your cart is empty</h2>
                <p className="text-[#065F46] mb-8">Discover fresh homemade food for free and save it from waste!</p>
                <Link to="/consumer/listings" className="btn-primary">Browse Food Listings</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#064E3B]">Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h1>
                <button onClick={clearCart} className="text-sm text-red-500 hover:underline cursor-pointer">Clear Cart</button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div
                            key={item.foodId}
                            className={`card-flat p-5 transition-all duration-300 ${removing === item.foodId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        >
                            <div className="flex gap-4">
                                <img src={item.food.images[0]} alt={item.food.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-[#064E3B] text-sm leading-tight">{item.food.name}</h3>
                                        <button onClick={() => handleRemove(item.foodId)} className="text-red-400 hover:text-red-600 cursor-pointer shrink-0 transition-colors p-1">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#065F46] mb-2">📍 Pickup: {item.food.restaurantName}</p>

                                    {/* Pickup slot */}
                                    <select
                                        value={item.pickupSlot}
                                        onChange={e => updatePickupSlot(item.foodId, e.target.value)}
                                        className="text-xs border border-[#D1FAE5] rounded-lg px-2 py-1.5 text-[#064E3B] outline-none focus:border-[#059669] bg-white cursor-pointer mb-3 w-full max-w-[220px]"
                                    >
                                        {item.food.pickupSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                    </select>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-[#F0FDF4] rounded-xl p-1">
                                            <button onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#D1FAE5] cursor-pointer transition-all">
                                                <FiMinus className="w-3 h-3 text-[#064E3B]" />
                                            </button>
                                            <span className="w-6 text-center text-sm font-bold text-[#064E3B]">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#D1FAE5] cursor-pointer transition-all">
                                                <FiPlus className="w-3 h-3 text-[#064E3B]" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#059669] bg-[#D1FAE5] px-2 py-1 rounded-md text-xs">Free</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link to="/consumer/listings" className="flex items-center gap-2 text-sm text-[#059669] font-semibold hover:underline w-fit cursor-pointer">
                        <FiShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Link>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-5">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-[#065F46]">Items</span><span className="text-[#064E3B] font-medium">{cartItems.length}</span></div>
                            <div className="flex justify-between text-[#059669]"><span>Platform Fee</span><span className="font-bold">₹0</span></div>
                            <div className="border-t border-[#D1FAE5] pt-3 flex justify-between">
                                <span className="font-bold text-[#064E3B]">Total Cost</span>
                                <span className="font-bold text-xl text-[#059669]">Free</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/consumer/checkout')} className="btn-primary w-full justify-center mt-5 py-3">
                            Confirm Pickup Details
                        </button>
                    </div>

                    {/* Impact Preview */}
                    <div className="bg-gradient-to-br from-[#059669] to-[#0891B2] rounded-2xl p-5 text-white">
                        <h4 className="font-bold mb-3">This Order's Impact</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-white/80">Food Rescued</span><span className="font-bold">~{foodSaved}kg</span></div>
                            <div className="flex justify-between"><span className="text-white/80">CO₂ Prevented</span><span className="font-bold">~{co2Saved}kg</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
