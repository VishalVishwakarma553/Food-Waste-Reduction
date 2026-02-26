import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiBell, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { mockFoodItems, mockRestaurants } from '../../data/mockData';

export default function FavoritesPage() {
    const { favorites, toggleFavorite, favoriteRestaurants, toggleFavoriteRestaurant, addToCart } = useCart();
    const [activeTab, setActiveTab] = useState('food');

    const favFood = mockFoodItems.filter(f => favorites.includes(f.id));
    const favRests = mockRestaurants.filter(r => favoriteRestaurants.includes(r.id));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#064E3B]">Favorites</h1>

            {/* Tabs */}
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('food')} className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}>
                    Saved Food ({favFood.length})
                </button>
                <button onClick={() => setActiveTab('restaurants')} className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}>
                    Restaurants ({favRests.length})
                </button>
            </div>

            {/* Food Tab */}
            {activeTab === 'food' && (
                favFood.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">❤️</div>
                        <h3 className="text-xl font-bold text-[#064E3B] mb-2">No saved food yet</h3>
                        <p className="text-[#065F46] mb-6">Tap the heart icon on any food listing to save it here.</p>
                        <Link to="/consumer/listings" className="btn-primary text-sm">Browse Listings</Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {favFood.map(food => {
                            const isExpired = new Date(food.expiresAt) < new Date();
                            return (
                                <div key={food.id} className={`card overflow-hidden ${isExpired ? 'opacity-60' : ''}`}>
                                    <div className="relative">
                                        <img src={food.images[0]} alt={food.name} className="w-full h-44 object-cover" />
                                        <span className="food-card-discount">{food.discount}% OFF</span>
                                        {isExpired && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="badge badge-red text-sm">Expired</span>
                                            </div>
                                        )}
                                        <button onClick={() => toggleFavorite(food.id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors">
                                            <FiHeart className="w-4 h-4 fill-current" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-[#064E3B] text-sm mb-1">{food.name}</h3>
                                        <p className="text-xs text-[#065F46] mb-3">{food.restaurantName}</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-[#059669]">₹{food.discountedPrice}</span>
                                                <span className="text-xs text-[#065F46] line-through ml-2">₹{food.originalPrice}</span>
                                            </div>
                                            {!isExpired ? (
                                                <button onClick={() => addToCart(food.id, 1, food.pickupSlots[0])}
                                                    className="flex items-center gap-1.5 text-xs font-semibold bg-[#059669] text-white px-3 py-1.5 rounded-full hover:bg-[#047857] cursor-pointer transition-colors">
                                                    <FiShoppingCart className="w-3.5 h-3.5" /> Add
                                                </button>
                                            ) : (
                                                <span className="text-xs text-red-500 font-semibold">Unavailable</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
                favRests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-xl font-bold text-[#064E3B] mb-2">No favourite restaurants</h3>
                        <p className="text-[#065F46] mb-6">Save restaurants to get notified when they post new listings.</p>
                        <Link to="/browse" className="btn-primary text-sm">Discover Restaurants</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favRests.map(r => (
                            <div key={r.id} className="card-flat p-5 flex items-center gap-4">
                                <img src={r.logo} alt={r.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#064E3B]">{r.name}</h3>
                                    <p className="text-xs text-[#065F46]">{r.cuisine} • ⭐ {r.rating}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-full bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] cursor-pointer transition-colors" title="Notify me">
                                        <FiBell className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => toggleFavoriteRestaurant(r.id)}
                                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer transition-colors">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                    <Link to={`/restaurant/${r.id}`} className="btn-primary text-xs py-2 px-4">View</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
