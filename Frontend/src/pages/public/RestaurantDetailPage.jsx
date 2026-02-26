import { useParams, Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiPhone, FiClock, FiShare2, FiHeart } from 'react-icons/fi';
import { mockRestaurants, mockFoodItems, mockReviews } from '../../data/mockData';
import FoodCard from '../../components/shared/FoodCard';
import { useCart } from '../../context/CartContext';

function StarRating({ rating, size = 'sm' }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <FiStar
                    key={s}
                    className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'} ${s <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-200 fill-gray-200'
                        }`}
                />
            ))}
        </div>
    );
}

export default function RestaurantDetailPage() {
    const { id } = useParams();
    const { toggleFavoriteRestaurant, isFavoriteRestaurant } = useCart();
    const restaurant = mockRestaurants.find(r => r.id === id) || mockRestaurants[0];
    const listings = mockFoodItems.filter(f => f.restaurantId === restaurant.id);
    const reviews = mockReviews.filter(r => r.restaurantId === restaurant.id);

    const sustainabilityColor =
        restaurant.sustainabilityScore >= 90 ? 'text-[#059669] bg-[#D1FAE5]' :
            restaurant.sustainabilityScore >= 75 ? 'text-amber-700 bg-amber-100' :
                'text-red-700 bg-red-100';

    return (
        <div className="pt-16 pb-20 bg-[#ECFDF5] min-h-screen">
            {/* Cover Photo */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <img src={restaurant.cover} alt={restaurant.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto flex items-end gap-4">
                        <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
                                {restaurant.isVerified && (
                                    <span className="badge bg-[#10B981] text-white text-xs">✓ Verified</span>
                                )}
                            </div>
                            <p className="text-white/80 text-sm mt-1">{restaurant.cuisine}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => toggleFavoriteRestaurant(restaurant.id)}
                                className={`p-2.5 rounded-full cursor-pointer transition-all ${isFavoriteRestaurant(restaurant.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-[#064E3B] hover:bg-white'
                                    }`}
                            >
                                <FiHeart className={`w-5 h-5 ${isFavoriteRestaurant(restaurant.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button className="p-2.5 rounded-full bg-white/80 text-[#064E3B] hover:bg-white cursor-pointer transition-all">
                                <FiShare2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-8">
                {/* Main */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <div className="card-flat p-6">
                        <h2 className="text-xl font-bold text-[#064E3B] mb-3">About</h2>
                        <p className="text-[#065F46] leading-relaxed">{restaurant.about}</p>
                    </div>

                    {/* Active Listings */}
                    {listings.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#064E3B] mb-4">Active Listings ({listings.length})</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {listings.map(food => (
                                    <FoodCard key={food.id} food={food} showLoginOverlay />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-[#064E3B]">Reviews ({reviews.length})</h2>
                            <div className="flex items-center gap-2">
                                <StarRating rating={restaurant.rating} size="md" />
                                <span className="font-bold text-[#064E3B]">{restaurant.rating}</span>
                                <span className="text-[#065F46] text-sm">({restaurant.totalReviews} reviews)</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {reviews.map(r => (
                                <div key={r.id} className="card-flat p-5">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img src={r.avatar} alt={r.userName} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-[#064E3B] text-sm">{r.userName}</p>
                                                {r.isVerified && <span className="badge badge-green text-xs">✓ Verified</span>}
                                                <span className="text-xs text-[#065F46] ml-auto">{r.date}</span>
                                            </div>
                                            <StarRating rating={r.rating} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#064E3B] leading-relaxed">{r.comment}</p>
                                    <p className="text-xs text-[#065F46] mt-2">{r.helpful} people found this helpful</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    <div>
                        <h2 className="text-xl font-bold text-[#064E3B] mb-4">Photos</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {restaurant.photos.map((photo, i) => (
                                <img
                                    key={i}
                                    src={photo}
                                    alt={`Photo ${i + 1}`}
                                    className="rounded-xl object-cover h-32 w-full hover:scale-105 cursor-pointer transition-transform duration-200"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info Card */}
                    <div className="card-flat p-6 space-y-4">
                        <h3 className="font-bold text-[#064E3B] mb-4">Restaurant Info</h3>
                        <div className="flex items-start gap-3 text-sm">
                            <FiMapPin className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                            <span className="text-[#065F46]">{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <FiPhone className="w-5 h-5 text-[#059669] shrink-0" />
                            <a href={`tel:${restaurant.phone}`} className="text-[#064E3B] hover:text-[#059669] transition-colors">{restaurant.phone}</a>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <FiClock className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                            <span className="text-[#065F46]">{restaurant.hours}</span>
                        </div>
                        <div className="pt-3 border-t border-[#D1FAE5]">
                            <button className="btn-primary w-full text-sm justify-center">
                                Get Directions
                            </button>
                        </div>
                    </div>

                    {/* Sustainability Score */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Sustainability Score</h3>
                        <div className="text-center mb-4">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${sustainabilityColor} border-4 ${restaurant.sustainabilityScore >= 90 ? 'border-[#10B981]' : 'border-amber-400'}`}>
                                {restaurant.sustainabilityScore}
                            </div>
                        </div>
                        <div className="progress-bar mb-2">
                            <div className="progress-fill" style={{ width: `${restaurant.sustainabilityScore}%` }} />
                        </div>
                        <p className="text-xs text-center text-[#065F46]">Excellent – Top 10% of partners</p>
                    </div>

                    {/* Impact */}
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Total Impact</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: `${restaurant.impact.foodSaved}kg`, label: 'Food Saved' },
                                { value: restaurant.impact.ordersCompleted, label: 'Orders' },
                                { value: `${restaurant.impact.co2Reduced}kg`, label: 'CO₂ Reduced' },
                                { value: restaurant.impact.mealsProvided, label: 'Meals' },
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-[#F0FDF4] rounded-xl p-3 text-center">
                                    <p className="font-bold text-[#059669] text-lg">{value}</p>
                                    <p className="text-xs text-[#065F46]">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-center text-[#065F46]">Partner since {new Date(restaurant.partnerSince).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                </div>
            </div>
        </div>
    );
}
