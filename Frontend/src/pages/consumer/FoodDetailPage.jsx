import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar, FiMapPin, FiClock, FiShare2, FiChevronLeft } from 'react-icons/fi';
import { mockFoodItems, mockReviews } from '../../data/mockData';
import { useCart } from '../../context/CartContext';

function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [urgency, setUrgency] = useState('green');

    useEffect(() => {
        const calc = () => {
            const diff = new Date(expiresAt) - new Date();
            if (diff <= 0) { setTimeLeft('Expired'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`);
            setUrgency(diff < 2 * 3600000 ? 'red' : diff < 5 * 3600000 ? 'yellow' : 'green');
        };
        calc();
        const t = setInterval(calc, 30000);
        return () => clearInterval(t);
    }, [expiresAt]);

    const colors = { green: 'text-[#059669] bg-[#D1FAE5]', yellow: 'text-amber-700 bg-amber-100', red: 'text-red-700 bg-red-100 animate-pulse' };
    return (
        <span className={`badge ${colors[urgency]} flex items-center gap-1.5`}>
            <FiClock className="w-3 h-3" /> {timeLeft}
        </span>
    );
}

export default function FoodDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleFavorite, isFavorite, cartItems } = useCart();
    const food = mockFoodItems.find(f => f.id === id) || mockFoodItems[0];
    const reviews = mockReviews.filter(r => r.foodId === food.id);
    const related = mockFoodItems.filter(f => f.id !== food.id && f.category === food.category).slice(0, 3);

    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState(food.pickupSlots[0]);
    const [added, setAdded] = useState(false);

    const isInCart = cartItems.some(i => i.foodId === food.id);
    const fav = isFavorite(food.id);

    const handleAddToCart = () => {
        addToCart(food.id, qty, selectedSlot);
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
    };

    const handleBuyNow = () => {
        addToCart(food.id, qty, selectedSlot);
        navigate('/consumer/checkout');
    };

    return (
        <div className="space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#065F46] hover:text-[#059669] cursor-pointer transition-colors">
                <FiChevronLeft className="w-4 h-4" /> Back to Listings
            </button>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Images */}
                <div>
                    <div className="relative rounded-3xl overflow-hidden mb-3 bg-[#F0FDF4]" style={{ height: 380 }}>
                        <img src={food.images[activeImg]} alt={food.name} className="w-full h-full object-cover" />
                        <CountdownTimer expiresAt={food.expiresAt} />
                    </div>
                    <div className="flex gap-3">
                        {food.images.map((img, i) => (
                            <button key={i} onClick={() => setActiveImg(i)}
                                className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${i === activeImg ? 'border-[#059669]' : 'border-[#D1FAE5] hover:border-[#10B981]'}`}>
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-5">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[#064E3B] leading-tight">{food.name}</h1>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => toggleFavorite(food.id)}
                                    className={`p-2.5 rounded-full cursor-pointer transition-all ${fav ? 'bg-red-500 text-white' : 'bg-[#D1FAE5] text-[#064E3B] hover:bg-red-50 hover:text-red-500'}`}>
                                    <FiHeart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
                                </button>
                                <button className="p-2.5 rounded-full bg-[#D1FAE5] text-[#064E3B] hover:bg-[#A7F3D0] cursor-pointer transition-all">
                                    <FiShare2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="badge badge-green">{food.category}</span>
                            {food.dietary.veg && <span className="badge bg-green-100 text-green-700">Veg</span>}
                            {food.dietary.vegan && <span className="badge bg-purple-100 text-purple-700">Vegan</span>}
                            {food.dietary.glutenFree && <span className="badge bg-blue-100 text-blue-700">Gluten-Free</span>}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <FiStar key={s} className={`w-4 h-4 ${s <= Math.round(food.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-200 fill-gray-200'}`} />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-[#064E3B]">{food.rating}</span>
                        <span className="text-sm text-[#065F46]">({food.totalReviews} reviews)</span>
                        <div className="flex items-center gap-1.5 ml-auto text-sm text-[#065F46]">
                            <FiMapPin className="w-4 h-4 text-[#059669]" /> {food.distance}km away
                        </div>
                    </div>

                    {/* Free Tag */}
                    <div className="bg-[#F0FDF4] rounded-2xl p-4">
                        <div className="flex items-end gap-3 mb-1">
                            <span className="text-2xl font-bold text-[#059669]">100% Free</span>
                        </div>
                        <p className="text-xs text-[#065F46]">Per unit • {food.quantity} units available</p>
                    </div>

                    {/* Pickup Slot */}
                    <div>
                        <p className="text-sm font-semibold text-[#064E3B] mb-2">Select Pickup Time</p>
                        <div className="flex flex-wrap gap-2">
                            {food.pickupSlots.map(slot => (
                                <button key={slot} onClick={() => setSelectedSlot(slot)}
                                    className={`text-sm px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${selectedSlot === slot ? 'border-[#059669] bg-[#D1FAE5] text-[#059669] font-semibold' : 'border-[#D1FAE5] text-[#065F46] hover:border-[#10B981]'
                                        }`}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold text-[#064E3B]">Quantity:</p>
                        <div className="flex items-center gap-3 bg-[#F0FDF4] rounded-xl p-1">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#D1FAE5] cursor-pointer transition-all">
                                <FiMinus className="w-4 h-4 text-[#064E3B]" />
                            </button>
                            <span className="w-8 text-center font-bold text-[#064E3B]">{qty}</span>
                            <button onClick={() => setQty(q => Math.min(food.quantity, q + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#D1FAE5] cursor-pointer transition-all">
                                <FiPlus className="w-4 h-4 text-[#064E3B]" />
                            </button>
                        </div>
                        <span className="text-sm text-[#065F46]">Total: <strong className="text-[#059669]">₹{food.discountedPrice * qty}</strong></span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button onClick={handleAddToCart}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${added || isInCart ? 'bg-[#D1FAE5] text-[#059669] border border-[#059669]' : 'btn-primary'
                                }`}>
                            <FiShoppingCart className="w-5 h-5" />
                            {added ? 'Added to Order!' : isInCart ? 'In Order – Add More' : 'Add to Order'}
                        </button>
                        <button onClick={handleBuyNow} className="flex-1 btn-cta justify-center py-3 text-sm">
                            Order Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Food Info Tabs */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="card-flat p-6">
                    <h3 className="font-bold text-[#064E3B] mb-4">Description & Ingredients</h3>
                    <p className="text-sm text-[#065F46] leading-relaxed mb-4">{food.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {food.ingredients.map(ing => (
                            <span key={ing} className="bg-[#F0FDF4] text-[#065F46] text-xs px-3 py-1 rounded-full border border-[#D1FAE5]">{ing}</span>
                        ))}
                    </div>
                    {food.allergens.length > 0 && food.allergens[0] !== 'None' && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-xs text-amber-800"><strong>⚠️ Allergens:</strong> {food.allergens.join(', ')}</p>
                        </div>
                    )}
                </div>
                <div className="card-flat p-6">
                    <h3 className="font-bold text-[#064E3B] mb-4">Nutritional Facts</h3>
                    <p className="text-xs text-[#065F46] mb-3">Per serving: {food.nutrition.serving}</p>
                    <div className="space-y-2">
                        {[
                            { label: 'Calories', value: `${food.nutrition.calories} kcal` },
                            { label: 'Protein', value: `${food.nutrition.protein}g` },
                            { label: 'Carbs', value: `${food.nutrition.carbs}g` },
                            { label: 'Fat', value: `${food.nutrition.fat}g` },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-sm border-b border-[#D1FAE5] pb-1.5">
                                <span className="text-[#065F46]">{label}</span>
                                <span className="font-semibold text-[#064E3B]">{value}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-[#065F46] mt-4 italic">🗄 Storage: {food.storage}</p>
                </div>
            </div>

            {/* Restaurant */}
            <div className="card-flat p-6">
                <h3 className="font-bold text-[#064E3B] mb-4">From the Kitchen</h3>
                <div className="flex items-center gap-4">
                    <img src={food.restaurantLogo} alt={food.restaurantName} className="w-14 h-14 rounded-2xl object-cover" />
                    <div className="flex-1">
                        <h4 className="font-bold text-[#064E3B]">{food.restaurantName}</h4>
                        <div className="flex items-center gap-2 text-sm text-[#065F46] mt-1">
                            <FiStar className="text-amber-500 fill-amber-500 w-3.5 h-3.5" /> {food.rating} • {food.distance}km away
                        </div>
                    </div>
                    <Link to={`/restaurant/${food.restaurantId}`} className="btn-secondary text-sm py-2 px-5">View More</Link>
                </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-[#064E3B] mb-5">Customer Reviews</h3>
                    <div className="space-y-4">
                        {reviews.map(r => (
                            <div key={r.id} className="card-flat p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <img src={r.avatar} alt={r.userName} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-[#064E3B] text-sm">{r.userName}</p>
                                            {r.isVerified && <span className="badge badge-green text-xs">✓ Verified</span>}
                                            <span className="text-xs text-[#065F46] ml-auto">{r.date}</span>
                                        </div>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-[#064E3B]">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
