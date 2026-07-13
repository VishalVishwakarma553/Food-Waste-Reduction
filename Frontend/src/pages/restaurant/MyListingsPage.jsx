import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiDownload, FiPlus, FiGrid, FiList as FiListIcon, FiMoreVertical, FiClock, FiEdit2, FiCopy, FiTrash2, FiEye, FiTrendingUp, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import FoodCardSkeleton from '../../components/shared/FoodCardSkeleton';

import { BASE_URL, IMG_BASE_URL } from '../../lib/api';
const TABS = ['All', 'active', 'draft', 'expired'];
const TAB_LABELS = { All: 'All', active: 'Active', draft: 'Draft', expired: 'Expired' };

// ponytail: inline status badge, no separate component needed
function StatusBadge({ status }) {
    const styles = {
        active: 'bg-green-100 text-green-700',
        draft: 'bg-gray-100 text-gray-600',
        expired: 'bg-red-100 text-red-600',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

export default function MyListingsPage() {
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, expired: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Fetch listings when tab/search changes
    const fetchListings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (activeTab !== 'All') params.status = activeTab;
            if (debouncedSearch) params.search = debouncedSearch;
            const { data } = await api.get('/restaurant/listings', { params });
            setListings(data.listings);
            setSelectedItems([]);
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    }, [activeTab, debouncedSearch]);

    // Fetch stats for header cards
    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/restaurant/stats');
            setStats(data);
        } catch { /* non-critical */ }
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        setDeleteLoading(id);
        try {
            await api.delete(`/restaurant/listings/${id}`);
            toast.success('Listing deleted');
            fetchListings();
            fetchStats();
        } catch (e) {
            toast.error(e.response?.data?.error || 'Delete failed');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedItems.length} listing(s)?`)) return;
        try {
            await Promise.all(selectedItems.map(id => api.delete(`/restaurant/listings/${id}`)));
            toast.success(`${selectedItems.length} listing(s) deleted`);
            fetchListings();
            fetchStats();
        } catch {
            toast.error('Some deletions failed');
        }
    };

    // CSV export: let the browser handle the download via a token-authenticated fetch
    const handleExportCSV = async () => {
        setExportLoading(true);
        try {
            const token = localStorage.getItem('foodsave_token');
            const res = await fetch(`${BASE_URL}/restaurant/listings/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'listings.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV exported!');
        } catch {
            toast.error('Export failed');
        } finally {
            setExportLoading(false);
        }
    };

    const toggleSelect = (id) =>
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const toggleSelectAll = () =>
        setSelectedItems(selectedItems.length === listings.length ? [] : listings.map(l => l.id));

    // Parse images JSON safely
    const getFirstImage = (images) => {
        try {
            const arr = typeof images === 'string' ? JSON.parse(images) : images;
            return arr?.[0] ? `${IMG_BASE_URL}${arr[0]}` : null;
        } catch { return null; }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">My Listings</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage your food rescue inventory and track performance.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={exportLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60 flex-1 sm:flex-none justify-center"
                    >
                        {exportLoading
                            ? <FiLoader className="w-4 h-4 animate-spin" />
                            : <FiDownload className="w-4 h-4" />
                        }
                        Export CSV
                    </button>
                    <Link to="/restaurant/add-listing" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857] transition-colors shadow-sm flex-1 sm:flex-none justify-center">
                        <FiPlus className="w-4 h-4" /> Add Listing
                    </Link>
                </div>
            </div>

            {/* Stats Cards — live from API */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Listings', value: stats.total, icon: FiGrid, color: 'text-gray-600 bg-gray-50' },
                    { label: 'Active', value: stats.active, icon: FiEye, color: 'text-green-600 bg-green-50' },
                    { label: 'Draft', value: stats.draft, icon: FiClock, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Expired', value: stats.expired, icon: FiTrendingUp, color: 'text-red-600 bg-red-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{label}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table/Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#E5E7EB] space-y-4">
                    {/* Status Tabs */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'bg-[#059669] text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {TAB_LABELS[tab]}
                                {tab !== 'All' && stats[tab] > 0 && (
                                    <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                        {stats[tab]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        {/* Search */}
                        <div className="flex flex-1 gap-2 max-w-md">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search listings by name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Bulk actions + view toggle */}
                        <div className="flex gap-4 items-center">
                            {selectedItems.length > 0 && (
                                <div className="flex gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-fadeIn">
                                    <span className="text-sm font-medium text-red-800 self-center">{selectedItems.length} selected</span>
                                    <div className="h-4 w-px bg-red-200 self-center mx-1" />
                                    <button onClick={handleBulkDelete} className="text-xs text-red-600 hover:underline font-medium">Delete</button>
                                </div>
                            )}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#059669]' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <FiGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#059669]' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <FiListIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-gray-50/30">
                    {loading ? (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'space-y-4'
                        }>
                            {['skel-1', 'skel-2', 'skel-3', 'skel-4'].map(key => (
                                <FoodCardSkeleton key={key} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                            <p className="text-red-600 font-medium">{error}</p>
                            <button onClick={fetchListings} className="mt-3 text-sm text-[#059669] hover:underline">Retry</button>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <FiSearch className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No listings found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery ? 'Try a different search term.' : 'Create your first listing to get started.'}
                            </p>
                            <Link to="/restaurant/add-listing" className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857] transition-colors">
                                <FiPlus className="w-4 h-4" /> Create New Listing
                            </Link>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {listings.map(listing => {
                                const img = getFirstImage(listing.images);
                                return (
                                    <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col group">
                                        <div className="relative">
                                            {img
                                                ? <img src={img} alt={listing.name} className="w-full h-40 object-cover" />
                                                : <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-4xl">🍱</div>
                                            }
                                            <div className="absolute top-2 left-2"><StatusBadge status={listing.status} /></div>
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
                                            <p className="text-xs text-gray-500 mb-1">{listing.category}</p>
                                            <p className="text-xs text-gray-400 mb-2">Exp: {listing.expiryDate} {listing.expiryTime}</p>
                                            <div className="flex items-center gap-2 mt-auto">
                                                <span className="text-xs text-gray-500 line-through">₹{listing.originalPrice}</span>
                                                <span className="text-sm font-bold text-[#059669]">₹{listing.discountedPrice}</span>
                                                <span className="text-xs text-gray-400 ml-auto">{listing.quantity} {listing.unit}</span>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-gray-100">
                                                <Link
                                                    to={`/restaurant/listings/${listing.id}/edit`}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    disabled={deleteLoading === listing.id}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteLoading === listing.id
                                                        ? <FiLoader className="w-4 h-4 animate-spin" />
                                                        : <FiTrash2 className="w-4 h-4" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* List / Table View */
                        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 text-center w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.length === listings.length && listings.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-[#059669] focus:ring-[#059669]"
                                            />
                                        </th>
                                        <th className="px-4 py-3">Food Item</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3">Expiry</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {listings.map(listing => {
                                        const img = getFirstImage(listing.images);
                                        return (
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
                                                        {img
                                                            ? <img src={img} alt={listing.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                            : <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-lg flex-shrink-0">🍱</div>
                                                        }
                                                        <span className="font-semibold text-gray-900 max-w-[180px] truncate">{listing.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{listing.category}</td>
                                                <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-[#059669]">₹{listing.discountedPrice}</span>
                                                    <span className="text-xs text-gray-400 line-through ml-1">₹{listing.originalPrice}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">{listing.quantity} {listing.unit}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{listing.expiryDate}<br />{listing.expiryTime}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-2 text-gray-400">
                                                        <Link
                                                            to={`/restaurant/listings/${listing.id}/edit`}
                                                            className="p-1 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(listing.id)}
                                                            disabled={deleteLoading === listing.id}
                                                            className="p-1 hover:text-red-500 transition-colors disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deleteLoading === listing.id
                                                                ? <FiLoader className="w-4 h-4 animate-spin" />
                                                                : <FiTrash2 className="w-4 h-4" />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
