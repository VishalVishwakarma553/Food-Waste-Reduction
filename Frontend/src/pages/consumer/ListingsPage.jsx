import { useState, useMemo } from 'react';
import { FiSearch, FiGrid, FiList, FiSliders, FiX, FiHeart } from 'react-icons/fi';
import FoodCard from '../../components/shared/FoodCard';
import { mockFoodItems } from '../../data/mockData';
import { useCart } from '../../context/CartContext';

const categories = ['All', 'Bakery', 'Prepared Meals', 'Fresh Produce', 'Dairy'];
const dietary = ['Veg', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
const sortOptions = [
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'discount', label: 'Highest Discount' },
    { value: 'recommended', label: 'Recommended' },
];

export default function ListingsPage() {
    const { favorites } = useCart();
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [maxDistance, setMaxDistance] = useState(10);
    const [sort, setSort] = useState('expiry');
    const [showFilters, setShowFilters] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const toggleDietary = (d) =>
        setSelectedDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    const filtered = useMemo(() => {
        let items = [...mockFoodItems];
        if (showFavoritesOnly) items = items.filter(f => favorites.includes(f.id));
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
    }, [search, selectedCategory, selectedDietary, maxPrice, maxDistance, sort, showFavoritesOnly, favorites]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Browse Food Listings</h1>
                    <p className="text-sm text-[#065F46]">{filtered.length} items available near you</p>
                </div>
                <div className="relative max-w-sm flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#059669] w-4 h-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search food or restaurant..."
                        className="input-field pl-10 pr-8 py-2.5 text-sm"
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
                            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${showFavoritesOnly ? 'bg-red-50 text-red-600 border border-red-200' : 'hover:bg-[#F0FDF4] text-[#064E3B]'
                                }`}
                        >
                            <FiHeart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
                            Favorites Only
                        </button>
                    </div>

                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Category</h4>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[#D1FAE5] text-[#059669] font-semibold' : 'text-[#065F46] hover:bg-[#F0FDF4]'
                                        }`}>{cat}</button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm flex justify-between">
                            Max Price <span className="text-[#059669]">₹{maxPrice}</span>
                        </h4>
                        <input type="range" min="50" max="1000" step="50" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full" />
                    </div>

                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm flex justify-between">
                            Distance <span className="text-[#059669]">{maxDistance}km</span>
                        </h4>
                        <input type="range" min="1" max="20" value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} className="w-full" />
                    </div>

                    <div className="mb-5">
                        <h4 className="font-semibold text-[#064E3B] mb-3 text-sm">Dietary</h4>
                        <div className="space-y-2">
                            {dietary.map(d => (
                                <label key={d} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={selectedDietary.includes(d)} onChange={() => toggleDietary(d)} className="custom-checkbox w-4 h-4 rounded" />
                                    <span className="text-sm text-[#064E3B]">{d}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => { setSelectedCategory('All'); setSelectedDietary([]); setMaxPrice(1000); setMaxDistance(10); setSearch(''); setShowFavoritesOnly(false); }}
                        className="w-full text-center text-sm text-[#059669] font-semibold hover:underline cursor-pointer">
                        Reset Filters
                    </button>
                </aside>

                {showFilters && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowFilters(false)} />}

                {/* Main */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                        <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 bg-white border border-[#D1FAE5] rounded-xl px-4 py-2 text-sm font-medium text-[#064E3B] hover:bg-[#F0FDF4] cursor-pointer">
                            <FiSliders className="w-4 h-4" /> Filters
                        </button>
                        <div className="flex items-center gap-3 ml-auto">
                            <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm border border-[#D1FAE5] rounded-xl px-3 py-2 text-[#064E3B] outline-none focus:border-[#059669] bg-white cursor-pointer">
                                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <div className="flex gap-1 bg-white border border-[#D1FAE5] rounded-xl p-1">
                                <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg cursor-pointer ${view === 'grid' ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#065F46]'}`}><FiGrid className="w-4 h-4" /></button>
                                <button onClick={() => setView('list')} className={`p-1.5 rounded-lg cursor-pointer ${view === 'list' ? 'bg-[#D1FAE5] text-[#059669]' : 'text-[#065F46]'}`}><FiList className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-5">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[#059669] text-white shadow-md' : 'bg-white text-[#064E3B] border border-[#D1FAE5] hover:border-[#059669]'
                                    }`}>{cat}</button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">{showFavoritesOnly ? '❤️' : '🍽️'}</div>
                            <h3 className="text-xl font-bold text-[#064E3B] mb-2">{showFavoritesOnly ? 'No favorites yet' : 'No listings found'}</h3>
                            <p className="text-[#065F46] mb-6">{showFavoritesOnly ? 'Heart items to save them here.' : 'Try adjusting your filters.'}</p>
                            <button onClick={() => { setSelectedCategory('All'); setSelectedDietary([]); setSearch(''); setShowFavoritesOnly(false); }} className="btn-primary text-sm">Clear Filters</button>
                        </div>
                    ) : (
                        <div className={view === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                            {filtered.map(food => <FoodCard key={food.id} food={food} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

