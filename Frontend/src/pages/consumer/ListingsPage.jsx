import { useState, useEffect, useCallback, useRef } from 'react';
import { FiSearch, FiGrid, FiList, FiSliders, FiX, FiHeart, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import FoodCard from '../../components/shared/FoodCard';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';

// ponytail: static constants outside component
const SORT_OPTIONS = [
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'discount', label: 'Highest Discount' },
    { value: 'recommended', label: 'Recommended' },
];
const DIETARY_OPTIONS = ['Veg', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
const STATIC_CATEGORIES = ['All', 'Bakery', 'Prepared Meals', 'Fresh Produce', 'Dairy', 'Beverages', 'Other'];

export default function ListingsPage() {
    const { favorites } = useCart();

    // Filter/UI state
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [maxDistance, setMaxDistance] = useState(10);
    const [pickupOnly, setPickupOnly] = useState(false);
    const [deliveryOnly, setDeliveryOnly] = useState(false);
    const [sort, setSort] = useState('expiry');
    const [showFilters, setShowFilters] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Data state
    const [listings, setListings] = useState([]);
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState(STATIC_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    // Request browser coordinates on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserCoords({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => {
                    console.warn("Could not retrieve GPS coordinates:", err.message);
                },
                { enableHighAccuracy: false, timeout: 4000 }
            );
        }
    }, []);

    // Debounce search 400ms
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Fetch categories from API (with counts), merge with static list
    useEffect(() => {
        api.get('/public/categories').then(({ data }) => {
            const apiCats = data.categories.map(c => c.name);
            // UI label mapping: Produce → Fresh Produce
            const mapped = apiCats.map(c => c === 'Produce' ? 'Fresh Produce' : c);
            const merged = ['All', ...new Set([...mapped, ...STATIC_CATEGORIES.slice(1)])];
            setCategories(merged);
        }).catch(() => { /* use static list */ });
    }, []);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedCategory !== 'All') params.category = selectedCategory;
            if (selectedDietary.length) params.dietary = selectedDietary.map(d => d.toLowerCase()).join(',');
            if (maxPrice < 1000) params.maxPrice = maxPrice;
            if (pickupOnly) params.pickup = 'true';
            if (deliveryOnly) params.delivery = 'true';
            if (sort !== 'recommended') params.sort = sort;
            if (userCoords) {
                params.lat = userCoords.lat;
                params.lng = userCoords.lng;
            }
            params.limit = 60;

            const { data } = await api.get('/public/listings', { params });
            let items = data.listings;

            // Client-side: favorites filter (no backend support needed)
            if (showFavoritesOnly) items = items.filter(f => favorites.includes(f.id));

            // Client-side: distance filter (distance=null from API, skip if no location)
            if (maxDistance < 10) items = items.filter(f => f.distance == null || f.distance <= maxDistance);

            // Client-side: remaining sort options not handled server-side
            if (sort === 'distance') items.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
            if (sort === 'discount') items.sort((a, b) => b.discount - a.discount);

            setListings(items);
            setTotal(data.total);
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategory, selectedDietary, maxPrice, maxDistance, pickupOnly, deliveryOnly, sort, showFavoritesOnly, favorites, userCoords]);

    useEffect(() => { fetchListings(); }, [fetchListings]);

    const toggleDietary = (d) =>
        setSelectedDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    const resetFilters = () => {
        setSelectedCategory('All');
        setSelectedDietary([]);
        setMaxPrice(1000);
        setMaxDistance(10);
        setSearch('');
        setPickupOnly(false);
        setDeliveryOnly(false);
        setShowFavoritesOnly(false);
    };

    const activeFilterCount = [
        selectedCategory !== 'All',
        selectedDietary.length > 0,
        maxPrice < 1000,
        maxDistance < 10,
        pickupOnly,
        deliveryOnly,
    ].filter(Boolean).length;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#064E3B]">Browse Food Listings</h1>
                    <p className="text-xs text-[#065F46]">
                        {loading ? 'Loading...' : `${listings.length} items available`}
                    </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#059669] w-4 h-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search food or restaurant..."
                        className="input-field !pl-10 pr-8 py-2 text-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                            <FiX className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-6">
                {/* Filter Sidebar */}
                <aside className={`
                    fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-none rounded-2xl border border-[#D1FAE5] p-5 overflow-y-auto flex-shrink-0
                    transition-transform duration-300 lg:translate-x-0
                    ${showFilters ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex items-center justify-between mb-5 lg:hidden">
                        <h3 className="font-bold text-[#064E3B]">Filters</h3>
                        <button onClick={() => setShowFilters(false)} className="cursor-pointer"><FiX className="w-5 h-5" /></button>
                    </div>

                    {/* Favorites toggle */}
                    <div className="mb-5 pb-5 border-b border-[#D1FAE5]">
                        <button
                            onClick={() => setShowFavoritesOnly(p => !p)}
                            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${showFavoritesOnly ? 'bg-red-50 text-red-600 border border-red-200' : 'hover:bg-[#F0FDF4] text-[#064E3B]'}`}
                        >
                            <FiHeart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
                            Favorites Only
                        </button>
                    </div>

                    {/* Category */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Category</h4>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[#D1FAE5] text-[#059669] font-semibold' : 'text-[#065F46] hover:bg-[#F0FDF4]'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Max Price */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm flex justify-between">
                            Max Price <span className="text-[#059669]">₹{maxPrice}</span>
                        </h4>
                        <input type="range" min="50" max="1000" step="50" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full" />
                    </div>

                    {/* Distance */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm flex justify-between">
                            Distance <span className="text-[#059669]">{maxDistance}km</span>
                        </h4>
                        <input type="range" min="1" max="20" value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} className="w-full" />
                        <p className="text-xs text-gray-400 mt-1">Applies when distance data is available</p>
                    </div>

                    {/* Dietary */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Dietary</h4>
                        <div className="space-y-2">
                            {DIETARY_OPTIONS.map(d => (
                                <label key={d} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedDietary.includes(d)} onChange={() => toggleDietary(d)} className="custom-checkbox w-4 h-4 rounded" />
                                    <span className="text-sm text-[#064E3B]">{d}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Logistics</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={pickupOnly} onChange={e => setPickupOnly(e.target.checked)} className="custom-checkbox w-4 h-4 rounded" />
                                <span className="text-sm text-[#064E3B]">Pickup Available</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={deliveryOnly} onChange={e => setDeliveryOnly(e.target.checked)} className="custom-checkbox w-4 h-4 rounded" />
                                <span className="text-sm text-[#064E3B]">Delivery Available</span>
                            </label>
                        </div>
                    </div>

                    <button onClick={resetFilters}
                        className="w-full text-center text-sm text-[#059669] font-semibold hover:underline cursor-pointer">
                        Reset All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                </aside>

                {showFilters && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowFilters(false)} />}

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar row */}
                    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="lg:hidden flex items-center gap-2 bg-white border border-[#D1FAE5] rounded-xl px-4 py-2 text-sm font-medium text-[#064E3B] hover:bg-[#F0FDF4] cursor-pointer"
                        >
                            <FiSliders className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-[#059669] text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                            )}
                        </button>
                        <div className="flex items-center gap-3 ml-auto">
                            <select value={sort} onChange={e => setSort(e.target.value)}
                                className="text-sm border border-[#D1FAE5] rounded-xl px-3 py-2 text-[#064E3B] outline-none focus:border-[#059669] bg-white cursor-pointer">
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <div className="flex gap-1 bg-white border border-[#D1FAE5] rounded-xl p-1">
                                <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg cursor-pointer ${view === 'grid' ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#065F46]'}`}><FiGrid className="w-4 h-4" /></button>
                                <button onClick={() => setView('list')} className={`p-1.5 rounded-lg cursor-pointer ${view === 'list' ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#065F46]'}`}><FiList className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Category pill chips */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap flex-nowrap mb-5 p-0.5">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer inline-block shrink-0 ${selectedCategory === cat ? 'bg-[#059669] text-white shadow-md' : 'bg-white text-[#064E3B] border border-[#D1FAE5] hover:border-[#059669]'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <FiLoader className="w-10 h-10 text-[#059669] animate-spin" />
                            <p className="text-[#065F46] text-sm">Finding food near you...</p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="text-center py-20">
                            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Couldn't load listings</h3>
                            <p className="text-gray-500 text-sm mb-4">{error}</p>
                            <button onClick={fetchListings} className="btn-primary text-sm flex items-center gap-2 mx-auto">
                                <FiRefreshCw className="w-4 h-4" /> Retry
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && listings.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">{showFavoritesOnly ? '❤️' : '🍽️'}</div>
                            <h3 className="text-xl font-bold text-[#064E3B] mb-2">
                                {showFavoritesOnly ? 'No favorites yet' : 'No listings found'}
                            </h3>
                            <p className="text-[#065F46] mb-6">
                                {showFavoritesOnly ? 'Heart items to save them here.' : 'Try adjusting your filters or check back later.'}
                            </p>
                            <button onClick={resetFilters} className="btn-primary text-sm">Clear Filters</button>
                        </div>
                    )}

                    {/* Grid / List */}
                    {!loading && !error && listings.length > 0 && (
                        <div className={view === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                            {listings.map(food => <FoodCard key={food.id} food={food} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
