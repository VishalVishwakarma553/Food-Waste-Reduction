import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiClock, FiMapPin, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function CountdownBadge({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [urgency, setUrgency] = useState('green');

    useEffect(() => {
        const calc = () => {
            const diff = new Date(expiresAt) - new Date();
            if (diff <= 0) { setTimeLeft('Expired'); setUrgency('red'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
            setUrgency(diff < 2 * 3600000 ? 'red' : diff < 5 * 3600000 ? 'yellow' : 'green');
        };
        calc();
        const t = setInterval(calc, 60000);
        return () => clearInterval(t);
    }, [expiresAt]);

    const colors = {
        green: 'bg-white/95 text-[#059669]',
        yellow: 'bg-amber-50/95 text-amber-600',
        red: 'bg-red-50/95 text-red-600 animate-pulse',
    };

    return (
        <span className={`food-card-expiry flex items-center gap-1 ${colors[urgency]}`}>
            <FiClock className="w-3 h-3" />
            {timeLeft}
        </span>
    );
}

export default function FoodCard({ food, showLoginOverlay = false }) {
    const { addToCart, toggleFavorite, isFavorite, cartItems } = useCart();
    const { isAuthenticated } = useAuth();
    const [added, setAdded] = useState(false);

    const isInCart = cartItems.some(i => i.foodId === food.id);
    const fav = isFavorite(food.id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        addToCart(food.id, 1, food.pickupSlots[0]);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        toggleFavorite(food.id);
    };

    return (
        <Link to={isAuthenticated ? `/consumer/food/${food.id}` : '/login'} className="food-card block group relative">
            {/* Image */}
            <div className="relative overflow-hidden">
                <img
                    src={food.images[0]}
                    alt={food.name}
                    className="food-card-img transition-transform duration-500 group-hover:scale-105"
                />
                {/* Discount Badge */}
                <span className="food-card-discount">{food.discount}% OFF</span>
                {/* Expiry */}
                <CountdownBadge expiresAt={food.expiresAt} />
                {/* Favorite */}
                {isAuthenticated && (
                    <button
                        onClick={handleFavorite}
                        className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${fav ? 'bg-red-500 text-white' : 'bg-white/90 text-[#064E3B] hover:bg-red-50 hover:text-red-500'
                            }`}
                    >
                        <FiHeart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                    </button>
                )}
                {/* Dietary badges */}
                <div className="absolute bottom-3 left-3 flex gap-1">
                    {food.dietary.veg && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Veg</span>
                    )}
                    {food.dietary.vegan && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Vegan</span>
                    )}
                </div>

                {/* Login Overlay */}
                {showLoginOverlay && !isAuthenticated && (
                    <div className="absolute inset-0 overlay-blur flex items-center justify-center">
                        <Link
                            to="/login"
                            className="bg-white text-[#059669] font-bold text-sm px-4 py-2 rounded-full shadow-lg hover:bg-[#059669] hover:text-white transition-all duration-200"
                            onClick={e => e.stopPropagation()}
                        >
                            Login to Claim
                        </Link>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-[#064E3B] leading-tight line-clamp-1">{food.name}</h3>
                    <span className="badge badge-green text-xs shrink-0">{food.category}</span>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                    <img src={food.restaurantLogo} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs text-[#065F46] truncate">{food.restaurantName}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <FiMapPin className="w-3 h-3 text-[#065F46]" />
                    <span className="text-xs text-[#065F46]">{food.distance}km away</span>
                    <span className="text-xs text-[#065F46]">•</span>
                    <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-[#065F46]">{food.rating}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#059669]">₹{food.discountedPrice}</span>
                        <span className="text-sm text-[#065F46] line-through">₹{food.originalPrice}</span>
                    </div>

                    {isAuthenticated ? (
                        <button
                            onClick={handleAddToCart}
                            aria-label="Add to cart"
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${added || isInCart
                                    ? 'bg-[#D1FAE5] text-[#059669]'
                                    : 'bg-[#059669] text-white hover:bg-[#047857]'
                                }`}
                        >
                            <FiShoppingCart className="w-3.5 h-3.5" />
                            {added ? 'Added!' : isInCart ? 'In Cart' : 'Add'}
                        </button>
                    ) : (
                        <span className="text-xs text-[#065F46]">{food.quantity} left</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
