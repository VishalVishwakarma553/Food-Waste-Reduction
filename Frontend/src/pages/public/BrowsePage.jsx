import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiList, FiGrid, FiSliders, FiSearch, FiX } from 'react-icons/fi';
import FoodCard from '../../components/shared/FoodCard';
import { mockFoodItems } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const categories = ['All', 'Bakery', 'Prepared Meals', 'Fresh Produce', 'Dairy'];
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
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [maxPrice, setMaxPrice] = useState(500);
    const [maxDistance, setMaxDistance] = useState(10);
    const [sort, setSort] = useState('expiry');
    const [showFilters, setShowFilters] = useState(false);

    const toggleDietary = (d) => {
        setSelectedDietary(prev =>
            prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
        );
    };

    const filtered = useMemo(() => {
        let items = [...mockFoodItems];
        if (search) items = items.filter(f =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.restaurantName.toLowerCase().includes(search.toLowerCase())
        );
        if (selectedCategory !== 'All') items = items.filter(f => f.category === selectedCategory);
        if (selectedDietary.includes('Veg')) items = items.filter(f => f.dietary.veg);
        if (selectedDietary.includes('Vegan')) items = items.filter(f => f.dietary.vegan);
        if (selectedDietary.includes('Gluten-Free')) items = items.filter(f => f.dietary.glutenFree);
        if (selectedDietary.includes('Dairy-Free')) items = items.filter(f => f.dietary.dairyFree);
        items = items.filter(f => f.discountedPrice <= maxPrice && f.distance <= maxDistance);

        switch (sort) {
            case 'expiry': items.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt)); break;
            case 'price-asc': items.sort((a, b) => a.discountedPrice - b.discountedPrice); break;
            case 'price-desc': items.sort((a, b) => b.discountedPrice - a.discountedPrice); break;
            case 'distance': items.sort((a, b) => a.distance - b.distance); break;
            case 'discount': items.sort((a, b) => b.discount - a.discount); break;
            default: break;
        }
        return items;
    }, [search, selectedCategory, selectedDietary, maxPrice, maxDistance, sort]);

    return (
        <div className="pt-20 pb-20 min-h-screen bg-[#ECFDF5]">
            {/* Header */}
            <div className="gradient-hero py-14 text-center relative overflow-hidden mb-8">
                <div className="hero-blob w-60 h-60 bg-[#10B981] -top-10 right-10" />
                <div className="relative z-10 max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-white mb-3">Browse Available Food</h1>
                    <p className="text-white/80 mb-6">Discover fresh, quality surplus food near you at incredible prices.</p>
                    <div className="bg-white rounded-2xl p-2 flex gap-2 shadow-lg max-w-xl mx-auto">
                        <div className="flex items-center gap-2 flex-1 px-3">
                            <FiSearch className="text-[#059669] w-5 h-5 shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                type="text"
                                placeholder="Search food, restaurant..."
                                className="flex-1 outline-none text-sm text-[#064E3B] placeholder-[#065F46]/50 bg-transparent py-2"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="cursor-pointer">
                                    <FiX className="text-gray-400 w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button className="btn-primary text-sm shrink-0 py-2 px-5">Search</button>
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
                        onClick={() => { setSelectedCategory('All'); setSelectedDietary([]); setMaxPrice(500); setMaxDistance(10); setSearch(''); }}
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
                                <span className="font-bold text-[#064E3B]">{filtered.length}</span> items found
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
                    <div className="flex gap-2 flex-wrap mb-6">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedCategory === cat
                                        ? 'bg-[#059669] text-white shadow-md'
                                        : 'bg-white text-[#064E3B] border border-[#D1FAE5] hover:border-[#059669]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
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
                            {filtered.map(food => (
                                <FoodCard key={food.id} food={food} showLoginOverlay />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

