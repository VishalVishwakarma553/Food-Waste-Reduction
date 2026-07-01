import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar,
    FiMapPin, FiClock, FiShare2, FiChevronLeft,
    FiPackage, FiTruck, FiAlertTriangle, FiCheckCircle,
    FiLoader, FiAlertCircle, FiTag, FiInfo
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import api, { IMG_BASE_URL } from '../../lib/api';

const API_BASE = IMG_BASE_URL;

// Live countdown badge
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

    const colors = {
        green: 'text-[#059669] bg-[#D1FAE5]',
        yellow: 'text-amber-700 bg-amber-100',
        red: 'text-red-700 bg-red-100 animate-pulse'
    };
    return (
        <span className={`absolute top-4 left-4 badge ${colors[urgency]} flex items-center gap-1.5 shadow-sm`}>
            <FiClock className="w-3 h-3" /> {timeLeft}
        </span>
    );
}

export default function FoodDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleFavorite, isFavorite, cartItems } = useCart();

    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [added, setAdded] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get(`/public/listings/${id}`)
            .then(({ data }) => {
                setFood(data.listing);
                setSelectedSlot(data.listing.pickupSlots?.[0] || '');
            })
            .catch(e => setError(e.response?.data?.error || 'Listing not found'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <FiLoader className="w-10 h-10 text-[#059669] animate-spin" />
            <p className="text-[#065F46] text-sm">Loading listing...</p>
        </div>
    );

    if (error || !food) return (
        <div className="text-center py-32">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Listing not found</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => navigate(-1)} className="btn-primary text-sm">Go Back</button>
        </div>
    );

    const isInCart = cartItems.some(i => i.foodId === food.id);
    const fav = isFavorite(food.id);

    const handleAddToCart = () => {
        addToCart(food.id, qty, selectedSlot, food);
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
    };

    const handleBuyNow = () => {
        addToCart(food.id, qty, selectedSlot, food);
        navigate('/consumer/checkout');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Parse arrays safely (normalizer already does this, but belt-and-suspenders)
    const allergens = Array.isArray(food.allergens) ? food.allergens : [];
    const dietaryArr = Array.isArray(food.dietaryArr) ? food.dietaryArr : [];
    const ingredients = Array.isArray(food.ingredients) ? food.ingredients : [];
    const hasAllergens = allergens.length > 0 && allergens[0] !== 'None';

    // Discount %
    const discountPct = food.originalPrice > 0
        ? Math.round(((food.originalPrice - food.discountedPrice) / food.originalPrice) * 100)
        : 0;
    const isFree = food.discountedPrice === 0;

    return (
        <div className="space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#065F46] hover:text-[#059669] cursor-pointer transition-colors">
                <FiChevronLeft className="w-4 h-4" /> Back to Listings
            </button>

            {/* ── Hero: Images + Details ── */}
            <div className="grid lg:grid-cols-2 gap-10">
                {/* Images */}
                <div>
                    <div className="relative rounded-3xl overflow-hidden mb-3 bg-[#F0FDF4]" style={{ height: 380 }}>
                        <img
                            src={food.images[activeImg] || food.images[0]}
                            alt={food.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80'; }}
                        />
                        {food.expiresAt && <CountdownTimer expiresAt={food.expiresAt} />}
                        {discountPct > 0 && (
                            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                                -{discountPct}% OFF
                            </span>
                        )}
                    </div>
                    {food.images.length > 1 && (
                        <div className="flex gap-3">
                            {food.images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)}
                                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${i === activeImg ? 'border-[#059669]' : 'border-[#D1FAE5] hover:border-[#10B981]'}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
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
                                <button onClick={handleShare}
                                    title={copied ? 'Link copied!' : 'Share'}
                                    className={`p-2.5 rounded-full cursor-pointer transition-all ${copied ? 'bg-[#059669] text-white' : 'bg-[#D1FAE5] text-[#064E3B] hover:bg-[#A7F3D0]'}`}>
                                    <FiShare2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="badge badge-green">{food.category}</span>
                            {food.subCategory && <span className="badge bg-gray-100 text-gray-600">{food.subCategory}</span>}
                            {food.dietary.veg && <span className="badge bg-green-100 text-green-700">🟢 Veg</span>}
                            {food.dietary.vegan && <span className="badge bg-purple-100 text-purple-700">🌿 Vegan</span>}
                            {food.dietary.glutenFree && <span className="badge bg-blue-100 text-blue-700">Gluten-Free</span>}
                            {food.dietary.dairyFree && <span className="badge bg-orange-100 text-orange-700">Dairy-Free</span>}
                        </div>
                    </div>

                    {/* Restaurant mini */}
                    <div className="flex items-center gap-3">
                        {food.restaurantLogo
                            ? <img src={food.restaurantLogo} alt="" className="w-8 h-8 rounded-full object-cover" onError={e => e.target.style.display = 'none'} />
                            : <span className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] text-sm font-bold flex items-center justify-center">{food.restaurantName?.charAt(0)}</span>
                        }
                        <span className="text-sm font-medium text-[#064E3B]">{food.restaurantName}</span>
                        {food.restaurantCity && (
                            <span className="flex items-center gap-1 text-xs text-[#065F46] ml-auto">
                                <FiMapPin className="w-3 h-3 text-[#059669]" /> {food.restaurantCity}
                            </span>
                        )}
                    </div>

                    {/* Price block */}
                    <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#D1FAE5]">
                        <div className="flex items-end gap-3 mb-1">
                            {isFree ? (
                                <span className="text-2xl font-bold text-[#059669]">100% Free</span>
                            ) : (
                                <>
                                    <span className="text-2xl font-bold text-[#059669]">₹{food.discountedPrice}</span>
                                    {food.originalPrice > food.discountedPrice && (
                                        <span className="text-base text-gray-400 line-through mb-0.5">₹{food.originalPrice}</span>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-xs text-[#065F46]">
                            Per {food.unit} · {food.quantity} {food.unit} available
                            {food.minOrder && ` · Min order: ${food.minOrder} ${food.unit}`}
                        </p>
                        {/* Expiry date line */}
                        <p className="text-xs text-amber-700 mt-1.5 font-medium">
                            ⏳ Expires: {food.expiryDate} at {food.expiryTime}
                        </p>
                    </div>

                    {/* Pickup Slot */}
                    {food.pickupSlots?.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-[#064E3B] mb-2">Select Pickup Time</p>
                            <div className="flex flex-wrap gap-2">
                                {food.pickupSlots.map(slot => (
                                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                                        className={`text-sm px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${selectedSlot === slot ? 'border-[#059669] bg-[#D1FAE5] text-[#059669] font-semibold' : 'border-[#D1FAE5] text-[#065F46] hover:border-[#10B981]'}`}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold text-[#064E3B]">Quantity:</p>
                        <div className="flex items-center gap-3 bg-[#F0FDF4] rounded-xl p-1">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#D1FAE5] cursor-pointer transition-all">
                                <FiMinus className="w-4 h-4 text-[#064E3B]" />
                            </button>
                            <span className="w-8 text-center font-bold text-[#064E3B]">{qty}</span>
                            <button onClick={() => setQty(q => Math.min(Math.floor(food.quantity), q + 1))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#D1FAE5] cursor-pointer transition-all">
                                <FiPlus className="w-4 h-4 text-[#064E3B]" />
                            </button>
                        </div>
                        {!isFree && (
                            <span className="text-sm text-[#065F46]">
                                Total: <strong className="text-[#059669]">₹{(food.discountedPrice * qty).toFixed(2)}</strong>
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button onClick={handleAddToCart}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${added || isInCart ? 'bg-[#D1FAE5] text-[#059669] border border-[#059669]' : 'btn-primary'}`}>
                            <FiShoppingCart className="w-5 h-5" />
                            {added ? 'Added to Order!' : isInCart ? 'In Order – Add More' : 'Add to Order'}
                        </button>
                        <button onClick={handleBuyNow} className="flex-1 btn-cta justify-center py-3 text-sm">
                            Order Now
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Info Panels ── */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Description & Ingredients */}
                <div className="card-flat p-6">
                    <h3 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2">
                        <FiInfo className="w-4 h-4 text-[#059669]" /> Description & Ingredients
                    </h3>
                    {food.description && (
                        <p className="text-sm text-[#065F46] leading-relaxed mb-4">{food.description}</p>
                    )}
                    {ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {ingredients.map((ing, i) => (
                                <span key={i} className="bg-[#F0FDF4] text-[#065F46] text-xs px-3 py-1 rounded-full border border-[#D1FAE5]">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    )}
                    {hasAllergens && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                            <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                                <strong>Allergens:</strong> {allergens.join(', ')}
                            </p>
                        </div>
                    )}
                    {dietaryArr.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-[#064E3B] mb-2">Dietary Info</p>
                            <div className="flex flex-wrap gap-1.5">
                                {dietaryArr.map((d, i) => (
                                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">{d}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Food Safety & Logistics — replaces Nutritional Facts */}
                <div className="card-flat p-6">
                    <h3 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2">
                        <FiPackage className="w-4 h-4 text-[#059669]" /> Food Safety & Logistics
                    </h3>

                    <div className="space-y-3">
                        {/* Storage */}
                        {food.storage && (
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-lg shrink-0">🧊</span>
                                <div>
                                    <p className="text-xs font-semibold text-blue-800 mb-0.5">Storage Instructions</p>
                                    <p className="text-xs text-blue-700">{food.storage}</p>
                                </div>
                            </div>
                        )}

                        {/* Packaging */}
                        {food.packaging && (
                            <div className="flex items-start gap-3 p-3 bg-[#F0FDF4] rounded-xl border border-[#D1FAE5]">
                                <span className="text-lg shrink-0">📦</span>
                                <div>
                                    <p className="text-xs font-semibold text-[#064E3B] mb-0.5">Packaging</p>
                                    <p className="text-xs text-[#065F46]">{food.packaging}</p>
                                </div>
                            </div>
                        )}

                        {/* Special Instructions */}
                        {food.instructions && (
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <span className="text-lg shrink-0">📋</span>
                                <div>
                                    <p className="text-xs font-semibold text-amber-800 mb-0.5">Special Instructions</p>
                                    <p className="text-xs text-amber-700">{food.instructions}</p>
                                </div>
                            </div>
                        )}

                        {/* Pickup / Delivery */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium ${food.pickup ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                                Pickup {food.pickup ? 'Available' : 'Unavailable'}
                            </div>
                            <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium ${food.delivery ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                <FiTruck className="w-3.5 h-3.5 shrink-0" />
                                Delivery {food.delivery ? 'Available' : 'Unavailable'}
                            </div>
                        </div>
                        {food.delivery && food.deliveryRadius && (
                            <p className="text-xs text-[#065F46] flex items-center gap-1.5 pl-1">
                                <FiMapPin className="w-3 h-3 text-[#059669]" />
                                Delivery radius: {food.deliveryRadius} km
                            </p>
                        )}

                        {/* Tags */}
                        {food.tags && (
                            <div className="flex items-start gap-2 pt-1">
                                <FiTag className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                                <div className="flex flex-wrap gap-1.5">
                                    {food.tags.split(',').map((t, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#065F46] border border-[#D1FAE5]">{t.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Restaurant Card ── */}
            <div className="card-flat p-6">
                <h3 className="font-bold text-[#064E3B] mb-4">From the Kitchen</h3>
                <div className="flex items-center gap-4">
                    {food.restaurantLogo
                        ? <img src={food.restaurantLogo} alt={food.restaurantName} className="w-14 h-14 rounded-2xl object-cover" onError={e => e.target.style.display = 'none'} />
                        : <span className="w-14 h-14 rounded-2xl bg-[#D1FAE5] text-[#059669] text-2xl font-bold flex items-center justify-center">{food.restaurantName?.charAt(0)}</span>
                    }
                    <div className="flex-1">
                        <h4 className="font-bold text-[#064E3B]">{food.restaurantName}</h4>
                        <div className="flex items-center gap-2 text-sm text-[#065F46] mt-1 flex-wrap">
                            {food.restaurantCity && (
                                <span className="flex items-center gap-1">
                                    <FiMapPin className="w-3 h-3 text-[#059669]" /> {food.restaurantAddress || food.restaurantCity}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link to={`/restaurant/${food.restaurantId}`} className="btn-secondary text-sm py-2 px-5">
                        View More
                    </Link>
                </div>
            </div>
        </div>
    );
}
