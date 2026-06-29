import { useState } from 'react';
import {
    FiSearch, FiMapPin, FiClock, FiGrid, FiList, FiCheckSquare,
    FiFilter, FiArrowDown, FiHeart, FiPackage, FiInfo, FiSliders, FiMap
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockAllDonations = [
    { id: 1, name: 'Assorted Bakery Surplus', category: 'Bakery', description: 'Freshly baked croissants, baguettes, and sweet buns from today.', restaurant: 'Gourmet Kitchen', quantity: 15, unit: 'kg', distance: 1.2, expiry: '2h 15m', type: 'Free', dietary: 'Veg', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
    { id: 2, name: 'Veg Biryani & Curry', category: 'Prepared Meals', description: 'Leftover catering trays of basmati rice, vegetable korma, and salads.', restaurant: 'Star Buffet', quantity: 25, unit: 'kg', distance: 2.5, expiry: '4h 00m', type: 'Subsidized', dietary: 'Veg', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
    { id: 3, name: 'Mixed Organic Vegetables', category: 'Produce', description: 'Slightly bruised tomatoes, carrots, and lettuce suitable for cooking.', restaurant: 'Green Salads Co', quantity: 8, unit: 'kg', distance: 0.8, expiry: '1h 30m', type: 'Free', dietary: 'Vegan', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' },
    { id: 4, name: 'Milk & Fresh Cream', category: 'Dairy', description: 'Unopened milk cartons and containers of cream expiring tomorrow.', restaurant: 'Supermart Express', quantity: 12, unit: 'liters', distance: 3.1, expiry: '5h 45m', type: 'Free', dietary: 'Veg', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80' },
    { id: 5, name: 'Tandoori Chicken Platters', category: 'Prepared Meals', description: 'Roasted tandoori chicken pieces packed in insulated containers.', restaurant: 'Spicy Palace', quantity: 18, unit: 'kg', distance: 4.0, expiry: '3h 10m', type: 'Subsidized', dietary: 'Non-veg', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
    { id: 6, name: 'Sliced Fruit Platters', category: 'Produce', description: 'Melon, pineapple, and grape skewers prepared this morning.', restaurant: 'Fruit & Juice Hub', quantity: 10, unit: 'kg', distance: 2.2, expiry: '1h 45m', type: 'Free', dietary: 'Vegan', img: 'https://images.unsplash.com/photo-1519996521430-02b798c1d881?w=400&q=80' },
];

export default function AvailableDonationsPage() {
    const [viewMode, setViewMode] = useState('grid'); // grid | list | map
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dietaryFilter, setDietaryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [maxDistance, setMaxDistance] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);
    const [savedIds, setSavedIds] = useState([]);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [pickupSlot, setPickupSlot] = useState('05:00 PM - 06:00 PM');

    const handleSelectCard = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredDonations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredDonations.map(d => d.id));
        }
    };

    const handleSaveForLater = (id, name) => {
        setSavedIds(prev => {
            const exists = prev.includes(id);
            if (exists) {
                toast.success(`Removed ${name} from saved list`);
                return prev.filter(x => x !== id);
            } else {
                toast.success(`Saved ${name} for later review`);
                return [...prev, id];
            }
        });
    };

    const handleRequestPickup = (name) => {
        toast.success(`Pickup request submitted for "${name}"!`);
    };

    const handleBulkRequestSubmit = () => {
        toast.success(`Bulk request submitted for ${selectedIds.length} donations!`);
        setSelectedIds([]);
        setBulkModalOpen(false);
    };

    // Filter Logic
    const filteredDonations = mockAllDonations.filter(d => {
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.restaurant.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All' || d.category === categoryFilter;
        const matchDietary = dietaryFilter === 'All' || d.dietary === dietaryFilter || (dietaryFilter === 'Veg' && d.dietary === 'Vegan');
        const matchType = typeFilter === 'All' || d.type === typeFilter;
        const matchDist = d.distance <= maxDistance;
        return matchSearch && matchCategory && matchDietary && matchType && matchDist;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Available Food Donations</h1>
                    <p className="text-[#065F46] mt-1">Browse surplus food posted by local establishments available for distribution.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 self-start">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#059669] text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Grid View">
                        <FiGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#059669] text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="List View">
                        <FiList className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-[#059669] text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Map View">
                        <FiMap className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Filters Sidebar */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-6 lg:sticky lg:top-6 self-start">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
                        <FiSliders className="text-[#059669]" /> Advanced Filters
                    </h2>

                    {/* Search */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Search</label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Food, restaurant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] text-sm"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                        >
                            <option value="All">All Categories</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Prepared Meals">Prepared Meals</option>
                            <option value="Produce">Produce</option>
                            <option value="Dairy">Dairy</option>
                        </select>
                    </div>

                    {/* Dietary Type */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Dietary Type</label>
                        <select
                            value={dietaryFilter}
                            onChange={(e) => setDietaryFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                        >
                            <option value="All">All Dietary Types</option>
                            <option value="Veg">Vegetarian (Veg & Vegan)</option>
                            <option value="Vegan">Vegan Only</option>
                            <option value="Non-veg">Non-Vegetarian</option>
                        </select>
                    </div>

                    {/* Donation Type */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Pricing Model</label>
                        <div className="flex gap-2">
                            {['All', 'Free', 'Subsidized'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTypeFilter(t)}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                        typeFilter === t
                                            ? 'bg-green-50 border-[#059669] text-[#059669]'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Distance Slider */}
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                            <span>Max Distance</span>
                            <span className="text-[#059669]">{maxDistance} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#059669]"
                        />
                    </div>
                </div>

                {/* Donation Listings Feed */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Toolbar & Bulk controls */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-700">
                            Showing {filteredDonations.length} available donations
                        </span>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-gray-600 bg-gray-50 border hover:bg-gray-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                            >
                                <FiCheckSquare className="w-4 h-4" />
                                {selectedIds.length === filteredDonations.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                    </div>

                    {/* Map View Integration Mock */}
                    {viewMode === 'map' && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden bg-emerald-50/20">
                            <FiMap className="w-16 h-16 text-[#059669]/40 mb-3 animate-pulse" />
                            <h3 className="font-bold text-[#064E3B] text-lg">Interactive Service Area Map</h3>
                            <p className="text-xs text-[#065F46] max-w-sm text-center mt-1">
                                Geolocation nodes showing food providers within your {maxDistance}km radius. (Mapbox API loading simulation)
                            </p>
                            {/* Visual mock nodes representing restaurants */}
                            <div className="absolute top-[30%] left-[25%] bg-white px-3 py-1.5 rounded-full shadow-lg border border-green-200 flex items-center gap-1.5 text-xs font-bold text-[#064E3B]">
                                <FiMapPin className="text-[#059669]" /> Gourmet Kitchen (15kg)
                            </div>
                            <div className="absolute bottom-[20%] right-[30%] bg-white px-3 py-1.5 rounded-full shadow-lg border border-green-200 flex items-center gap-1.5 text-xs font-bold text-[#064E3B]">
                                <FiMapPin className="text-amber-500" /> Star Buffet (25kg)
                            </div>
                        </div>
                    )}

                    {/* Listings */}
                    {viewMode !== 'map' && (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                            {filteredDonations.length > 0 ? (
                                filteredDonations.map((d) => {
                                    const isSelected = selectedIds.includes(d.id);
                                    const isSaved = savedIds.includes(d.id);

                                    return (
                                        <div
                                            key={d.id}
                                            className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                                                isSelected ? 'border-2 border-[#059669] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                                            } ${viewMode === 'list' ? 'sm:flex-row h-auto' : ''}`}
                                        >
                                            {/* Image & Badges */}
                                            <div className={`relative ${viewMode === 'list' ? 'sm:w-48 h-48 sm:h-auto' : 'h-48'} shrink-0 bg-gray-100`}>
                                                <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${d.type === 'Free' ? 'bg-[#059669]' : 'bg-purple-600'}`}>
                                                        {d.type}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-gray-800 shadow-sm border">
                                                        {d.dietary}
                                                    </span>
                                                </div>

                                                {/* Checkbox selector for Bulk */}
                                                <button
                                                    onClick={() => handleSelectCard(d.id)}
                                                    className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white/90 flex items-center justify-center border hover:bg-white transition-colors"
                                                >
                                                    <div className={`w-3.5 h-3.5 rounded ${isSelected ? 'bg-[#059669]' : 'border-2 border-gray-400'}`} />
                                                </button>
                                            </div>

                                            {/* Details & Action */}
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <h3 className="font-bold text-[#064E3B] text-base leading-snug">{d.name}</h3>
                                                        <button
                                                            onClick={() => handleSaveForLater(d.id, d.name)}
                                                            className={`p-1.5 rounded-full border transition-colors shrink-0 ${
                                                                isSaved ? 'bg-red-50 text-red-500 border-red-200' : 'text-gray-400 hover:text-red-500 border-gray-100'
                                                            }`}
                                                        >
                                                            <FiHeart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-semibold mb-2">{d.restaurant}</p>
                                                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">{d.description}</p>
                                                    
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 border-t pt-3 mt-3">
                                                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                                                            <FiPackage className="text-gray-400" /> {d.quantity} {d.unit}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FiMapPin className="text-gray-400" /> {d.distance} km away
                                                        </span>
                                                        <span className="flex items-center gap-1 font-medium text-amber-600">
                                                            <FiClock /> Expiring in {d.expiry}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={() => handleRequestPickup(d.name)}
                                                        className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2 rounded-xl text-xs font-bold transition-colors"
                                                    >
                                                        Request Pickup
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                                    <FiInfo className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-lg font-semibold text-gray-900">No donations match your filters</p>
                                    <p className="text-sm mt-1">Try increasing your distance limit or toggling dietary preferences.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Floating Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between gap-6 max-w-lg w-[90%] animate-bounce">
                    <div className="text-sm">
                        <p className="font-bold text-[#064E3B]">{selectedIds.length} Selected</p>
                        <p className="text-xs text-gray-500">Bulk schedule pickup</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setBulkModalOpen(true)}
                            className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                            Schedule Selected
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Request Schedule Modal */}
            {bulkModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
                        <h3 className="text-lg font-bold text-[#064E3B]">Schedule Bulk Pickups</h3>
                        <p className="text-xs text-gray-500">You are requesting pickups for {selectedIds.length} donations in a single optimized block.</p>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Select Pickup Slot Today</label>
                            <select
                                value={pickupSlot}
                                onChange={(e) => setPickupSlot(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            >
                                <option>04:00 PM - 05:00 PM</option>
                                <option>05:00 PM - 06:00 PM</option>
                                <option>06:00 PM - 07:00 PM</option>
                                <option>07:00 PM - 08:00 PM</option>
                            </select>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                onClick={handleBulkRequestSubmit}
                                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-xs font-bold"
                            >
                                Confirm Request
                            </button>
                            <button
                                onClick={() => setBulkModalOpen(false)}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
