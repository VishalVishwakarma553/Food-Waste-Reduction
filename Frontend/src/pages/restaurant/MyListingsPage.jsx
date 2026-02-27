import { useState } from 'react';
import { FiSearch, FiFilter, FiDownload, FiPlus, FiGrid, FiList as FiListIcon, FiMoreVertical, FiClock, FiEdit2, FiCopy, FiTrash2, FiEye, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Dummy static listings
const initialListings = [
    {
        id: 'L-101',
        name: 'Fresh Artisan Sourdough Bread',
        category: 'Bakery',
        description: 'Baked fresh this morning. Contains gluten.',
        img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200',
        quantity: 12,
        totalQuantity: 20,
        expiryTime: 'Today, 8:00 PM',
        status: 'Active',
        orders: 8,
        views: 142
    },
    {
        id: 'L-102',
        name: 'Mixed Berry Muffins (Pack of 4)',
        category: 'Bakery',
        description: 'Sweet berry muffins, perfect for a quick snack.',
        img: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=200',
        quantity: 2,
        totalQuantity: 15,
        expiryTime: 'Today, 6:00 PM',
        status: 'Expiring Soon',
        orders: 13,
        views: 89
    },
    {
        id: 'L-103',
        name: 'Assorted Vegetable Curry & Rice',
        category: 'Prepared Meals',
        description: 'A mix of seasonal vegetables in a mildly spiced curry.',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
        quantity: 0,
        totalQuantity: 10,
        expiryTime: 'Today, 4:00 PM',
        status: 'Sold Out',
        orders: 10,
        views: 45
    },
    {
        id: 'L-104',
        name: 'Organic Tomatoes',
        category: 'Produce',
        description: 'Slightly bruised but perfectly ripe tomatoes.',
        img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200',
        quantity: 5,
        totalQuantity: 5,
        expiryTime: 'Tomorrow, 10:00 AM',
        status: 'Active',
        orders: 0,
        views: 12
    },
    {
        id: 'L-105',
        name: 'Yesterday\'s Croissants',
        category: 'Bakery',
        description: 'Day-old buttery croissants, great for reheating.',
        img: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=200',
        quantity: 8,
        totalQuantity: 10,
        expiryTime: 'Yesterday, 9:00 PM',
        status: 'Expired',
        orders: 2,
        views: 34
    }
];

export default function MyListingsPage() {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    const tabs = ['All', 'Active', 'Expiring Soon', 'Sold Out', 'Expired', 'Draft'];

    const filteredListings = initialListings.filter(listing => {
        const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' ||
            (activeTab === 'Expiring Soon' ? listing.status === 'Expiring Soon' : listing.status === activeTab);
        return matchesSearch && matchesTab;
    });

    const toggleSelect = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredListings.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredListings.map(l => l.id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>;
            case 'Expiring Soon': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 animate-pulse">Expiring Soon</span>;
            case 'Sold Out': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Sold Out</span>;
            case 'Expired': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Expired</span>;
            default: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">My Listings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your food rescue inventory and track performance.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <FiDownload className="w-4 h-4" /> Export CSV
                    </button>
                    <Link to="/restaurant/add-listing" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857] transition-colors shadow-sm">
                        <FiPlus className="w-4 h-4" /> Add Listing
                    </Link>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Listings</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">24</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <FiGrid className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Expiring Soon</p>
                        <p className="text-xl font-bold text-amber-600 mt-1">2</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <FiClock className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Views</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">1.2k</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FiEye className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Conversion Rate</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">18%</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <FiTrendingUp className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#E5E7EB] space-y-4">
                    {/* Tabs */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'bg-[#059669] text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        {/* Search & Filter */}
                        <div className="flex flex-1 gap-2 max-w-md">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all"
                                />
                            </div>
                            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors flex items-center justify-center">
                                <FiFilter className="w-5 h-5" />
                            </button>
                        </div>

                        {/* View Toggles & Bulk Actions */}
                        <div className="flex gap-4 items-center">
                            {selectedItems.length > 0 && (
                                <div className="flex gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-fadeIn">
                                    <span className="text-sm font-medium text-blue-800 self-center">{selectedItems.length} selected</span>
                                    <div className="h-4 w-px bg-blue-200 self-center mx-1"></div>
                                    <button className="text-xs text-blue-700 hover:underline">Edit Status</button>
                                    <button className="text-xs text-red-600 hover:underline ml-2">Delete</button>
                                </div>
                            )}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#059669]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <FiGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#059669]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <FiListIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Display */}
                <div className="p-4 bg-gray-50/30">
                    {filteredListings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <FiSearch className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No listings found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                            <Link to="/restaurant/add-listing" className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857] transition-colors">
                                <FiPlus className="w-4 h-4" /> Create New Listing
                            </Link>
                        </div>
                    ) : viewMode === 'grid' ? (
                        // Grid View
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredListings.map(listing => (
                                <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                                    <div className="relative aspect-video">
                                        <img src={listing.img} alt={listing.name} className="w-full h-[200px] object-cover" />
                                        <div className="absolute top-2 left-2">
                                            {getStatusBadge(listing.status)}
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(listing.id)}
                                                onChange={() => toggleSelect(listing.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-[#059669] focus:ring-[#059669] shadow-sm cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{listing.name}</h3>
                                        <p className="text-xs text-gray-500 mb-3">{listing.category}</p>

                                        <div className="mt-auto space-y-3">
                                            <p className="text-xs text-gray-600 line-clamp-2 min-h-[32px]">
                                                {listing.description}
                                            </p>

                                            <div className="flex justify-end pt-2 border-t border-gray-100">
                                                <div className="flex gap-2">
                                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                                                        <FiMoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // List View
                        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                        <th className="px-4 py-3 text-center w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.length === filteredListings.length && filteredListings.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-[#059669] focus:ring-[#059669]"
                                            />
                                        </th>
                                        <th className="px-4 py-3">Food Item</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-right">Performance</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredListings.map(listing => (
                                        <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(listing.id)}
                                                    onChange={() => toggleSelect(listing.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#059669] focus:ring-[#059669]"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={listing.img} alt={listing.name} className="w-10 h-10 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="font-bold text-gray-900">{listing.name}</p>
                                                        <p className="text-xs text-gray-500">{listing.category} • Exp: {listing.expiryTime}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(listing.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-600 truncate block max-w-[200px]" title={listing.description}>{listing.description}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs">
                                                <p><span className="font-medium text-gray-900">{listing.orders}</span> orders</p>
                                                <p className="text-gray-500">{listing.views} views</p>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-400">
                                                <div className="flex justify-center gap-2">
                                                    <button className="p-1 hover:text-blue-600 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                                    <button className="p-1 hover:text-[#059669] transition-colors" title="Duplicate"><FiCopy className="w-4 h-4" /></button>
                                                    <button className="p-1 hover:text-red-500 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
