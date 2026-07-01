import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiList, FiGrid, FiSliders, FiSearch, FiX } from 'react-icons/fi';
import FoodCard from '../../components/shared/FoodCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const STATIC_CATEGORIES = ['All', 'Bakery', 'Prepared Meals', 'Fresh Produce', 'Dairy', 'Beverages', 'Other'];
const dietary = ['Veg', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
const sortOptions = [
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'discount', label: 'Highest Discount' },
];

export default function BrowsePage() {
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get('search') || '';
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState(querySearch);
    const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
    const [categories, setCategories] = useState(STATIC_CATEGORIES);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [maxDistance, setMaxDistance] = useState(10);
    const [sort, setSort] = useState('expiry');
    const [showFilters, setShowFilters] = useState(false);

    // Data state
    const [listings, setListings] = useState([]);
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

    // Fetch categories from API
    useEffect(() => {
        api.get('/public/categories')
            .then(({ data }) => {
                const apiCats = data.categories.map(c => c.name);
                const mapped = apiCats.map(c => c === 'Produce' ? 'Fresh Produce' : c);
                const merged = ['All', ...new Set([...mapped, ...STATIC_CATEGORIES.slice(1)])];
                setCategories(merged);
            })
            .catch(() => { /* fallback to static */ });
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
            params.sort = sort;
            if (userCoords) {
                params.lat = userCoords.lat;
                params.lng = userCoords.lng;
            }
            params.limit = 60;

            const { data } = await api.get('/public/listings', { params });
            let items = data.listings;

            // Client-side distance filter if needed
            if (maxDistance < 10) items = items.filter(f => f.distance == null || f.distance <= maxDistance);

            // Client-side sort fallbacks
            if (sort === 'distance') items.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
            if (sort === 'discount') items.sort((a, b) => b.discount - a.discount);

            setListings(items);
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategory, selectedDietary, maxPrice, maxDistance, sort, userCoords]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const toggleDietary = (d) => {
        setSelectedDietary(prev =>
            prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
        );
    };

    return (
        <div className="pt-20 pb-20 min-h-screen bg-[#ECFDF5]">
            {/* Header */}
            <div className="gradient-hero py-10 sm:py-14 text-center relative overflow-hidden mb-8">
                <div className="hero-blob w-60 h-60 bg-[#10B981] -top-10 right-10" />
                <div className="relative z-10 max-w-3xl mx-auto px-4">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">Browse Available Food</h1>
                    <p className="text-sm sm:text-base text-white/80 mb-6">Discover fresh, quality surplus food near you at incredible prices.</p>
                    <div className="bg-white rounded-2xl p-1.5 flex flex-col sm:flex-row gap-2 shadow-lg max-w-xl mx-auto">
                        <div className="flex items-center gap-2 flex-1 px-3">
                            <FiSearch className="text-[#059669] w-4.5 h-4.5 shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                type="text"
                                placeholder="Search food, restaurant..."
                                className="flex-1 outline-none text-xs sm:text-sm text-[#064E3B] placeholder-[#065F46]/50 bg-transparent py-1.5 sm:py-2"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="cursor-pointer">
                                    <FiX className="text-gray-400 w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button className="search-btn-primary text-xs sm:text-sm shrink-0 py-1.5 px-4 w-full sm:w-auto justify-center" onClick={fetchListings}>Search</button>
                    </div>
                </div>
            </div>

            {/* Non-auth banner */}
            {!isAuthenticated && (
                <div className="max-w-7xl mx-auto px-4 mb-6">
                    <div className="bg-gradient-to-r from-[#059669] to-[#0891B2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-white font-medium">🔒 Sign up for free to claim food, save favorites, and track your impact!</p>
                        <Link to="/register" className="bg-white text-[#059669] font-bold text-sm px-5 py-2 rounded-full hover:bg-opacity-90 transition-all cursor-pointer shrink-0">
                            Join Free
                        </Link>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 flex gap-8">
                {/* Filter Sidebar */}
                <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:shadow-none rounded-2xl border border-[#D1FAE5] p-6
          transition-transform duration-300 lg:translate-x-0 top-0 bottom-0 overflow-y-auto
          ${showFilters ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <h3 className="font-bold text-[#064E3B]">Filters</h3>
                        <button onClick={() => setShowFilters(false)} className="cursor-pointer p-1">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Category */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Category</h4>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${selectedCategory === cat
                                        ? 'bg-[#D1FAE5] text-[#059669] font-semibold'
                                        : 'text-[#065F46] hover:bg-[#F0FDF4]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm flex justify-between">
                            Max Price <span className="text-[#059669]">₹{maxPrice}</span>
                        </h4>
                        <input
                            type="range" min="50" max="1000" step="50"
                            value={maxPrice}
                            onChange={e => setMaxPrice(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-[#065F46] mt-1">
                            <span>₹50</span><span>₹1000</span>
                        </div>
                    </div>

                    {/* Distance */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm flex justify-between">
                            Distance <span className="text-[#059669]">{maxDistance}km</span>
                        </h4>
                        <input
                            type="range" min="1" max="20" step="1"
                            value={maxDistance}
                            onChange={e => setMaxDistance(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-[#065F46] mt-1">
                            <span>1km</span><span>20km</span>
                        </div>
                    </div>

                    {/* Dietary */}
                    <div>
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Dietary Preference</h4>
                        <div className="space-y-2">
                            {dietary.map(d => (
                                <label key={d} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedDietary.includes(d)}
                                        onChange={() => toggleDietary(d)}
                                        className="custom-checkbox w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-[#064E3B]">{d}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={() => { setSelectedCategory('All'); setSelectedDietary([]); setMaxPrice(1000); setMaxDistance(10); setSearch(''); }}
                        className="mt-6 w-full text-center text-sm text-[#059669] font-semibold hover:underline cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                </aside>

                {/* Mobile filter backdrop */}
                {showFilters && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowFilters(false)} />}

                {/* Main */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden flex items-center gap-2 bg-white border border-[#D1FAE5] rounded-xl px-4 py-2 text-sm font-medium text-[#064E3B] hover:bg-[#F0FDF4] cursor-pointer"
                            >
                                <FiSliders className="w-4 h-4" /> Filters
                            </button>
                            <p className="text-sm text-[#065F46]">
                                <span className="font-bold text-[#064E3B]">{listings.length}</span> items found
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="text-sm border border-[#D1FAE5] rounded-xl px-3 py-2 text-[#064E3B] outline-none focus:border-[#059669] bg-white cursor-pointer"
                            >
                                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <div className="flex gap-1 bg-white border border-[#D1FAE5] rounded-xl p-1">
                                <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg cursor-pointer transition-all ${view === 'grid' ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#065F46]'}`}>
                                    <FiGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setView('list')} className={`p-1.5 rounded-lg cursor-pointer transition-all ${view === 'list' ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#065F46]'}`}>
                                    <FiList className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap flex-nowrap mb-6 p-0.5">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer inline-block shrink-0 ${selectedCategory === cat
                                    ? 'bg-[#059669] text-white shadow-md'
                                    : 'bg-white text-[#064E3B] border border-[#D1FAE5] hover:border-[#059669]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#065F46] text-xs">Updating listings...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-600">
                            <p className="font-semibold">{error}</p>
                            <button onClick={fetchListings} className="mt-4 text-xs bg-[#059669] text-white px-4 py-2 rounded-full font-bold">Try Again</button>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h3 className="text-xl font-bold text-[#064E3B] mb-2">No listings found</h3>
                            <p className="text-[#065F46] mb-6">Try adjusting your filters or search terms.</p>
                            <button
                                onClick={() => { setSelectedCategory('All'); setSelectedDietary([]); setSearch(''); }}
                                className="btn-primary text-sm"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className={view === 'grid'
                            ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6'
                            : 'space-y-4'
                        }>
                            {listings.map(food => (
                                <FoodCard key={food.id} food={food} showLoginOverlay />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
