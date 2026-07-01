import { useState, useEffect } from 'react';
import {
    FiUsers, FiPlus, FiSearch, FiSliders, FiEdit, FiTrash2,
    FiCheckCircle, FiChevronRight, FiList, FiClock, FiPlusCircle, FiLoader, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import LocationPicker from '../../components/shared/LocationPicker';

export default function BeneficiaryManagementPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBeneficiary, setEditingBeneficiary] = useState(null);
    const [activeTab, setActiveTab] = useState('directory'); // directory | distributions
    
    // Distributions states
    const [completedOrders, setCompletedOrders] = useState([]);
    const [distributions, setDistributions] = useState([]);
    const [distTab, setDistTab] = useState('add'); // add | history
    const [selectedOrder, setSelectedOrder] = useState('');
    const [distFormData, setDistFormData] = useState({
        beneficiaryId: '',
        foodItems: '',
        quantity: '',
        unit: 'kg'
    });
    const [distributing, setDistributing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: ''
    });

    const fetchBeneficiaries = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ngo/beneficiaries');
            setBeneficiaries(data.beneficiaries || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load beneficiaries');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedOrders = async () => {
        try {
            const { data } = await api.get('/ngo/completed-orders');
            setCompletedOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDistributions = async () => {
        try {
            const { data } = await api.get('/ngo/distributions');
            setDistributions(data.distributions || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBeneficiaries();
        // Fetch distributions count on load to populate stats card
        fetchDistributions();
        if (activeTab === 'distributions') {
            fetchCompletedOrders();
        }
    }, [activeTab]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.location || !formData.size) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            if (editingBeneficiary) {
                await api.patch(`/ngo/beneficiaries/${editingBeneficiary.id}`, {
                    name: formData.name,
                    type: formData.type,
                    location: formData.location,
                    size: parseInt(formData.size) || 1,
                    contactPhone: formData.contactPhone || '',
                    notes: formData.notes || ''
                });
                toast.success(`Updated "${formData.name}" successfully`);
            } else {
                await api.post('/ngo/beneficiaries', {
                    name: formData.name,
                    type: formData.type,
                    location: formData.location,
                    size: parseInt(formData.size) || 1,
                    contactPhone: formData.contactPhone || '',
                    notes: formData.notes || ''
                });
                toast.success(`Registered "${formData.name}" successfully`);
            }
            setModalOpen(false);
            setEditingBeneficiary(null);
            setFormData({ name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: '' });
            fetchBeneficiaries();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save beneficiary');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            await api.delete(`/ngo/beneficiaries/${id}`);
            toast.success(`Removed beneficiary: ${name}`);
            fetchBeneficiaries();
        } catch (err) {
            toast.error('Failed to delete beneficiary');
        }
    };

    const handleEditClick = (b) => {
        setEditingBeneficiary(b);
        setFormData({
            name: b.name,
            type: b.type,
            location: b.location,
            size: b.size,
            contactPhone: b.contactPhone || '',
            notes: b.notes || ''
        });
        setModalOpen(true);
    };

    const handleOrderSelect = (orderId) => {
        setSelectedOrder(orderId);
        if (!orderId) {
            setDistFormData(prev => ({ ...prev, foodItems: '', quantity: '' }));
            return;
        }
        const order = completedOrders.find(o => o.id === parseInt(orderId));
        if (order) {
            const itemsList = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
            const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
            setDistFormData(prev => ({
                ...prev,
                foodItems: itemsList,
                quantity: totalQty,
                unit: order.items[0]?.unit || 'kg'
            }));
        }
    };

    const handleLogDistribution = async (e) => {
        e.preventDefault();
        if (!distFormData.beneficiaryId || !distFormData.foodItems || !distFormData.quantity) {
            toast.error('Please fill in all distribution fields');
            return;
        }

        if (selectedOrder) {
            const order = completedOrders.find(o => o.id === parseInt(selectedOrder));
            if (order) {
                const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                if (parseFloat(distFormData.quantity) > totalQty) {
                    toast.error(`Quantity cannot exceed order quantity of ${totalQty} ${distFormData.unit}`);
                    return;
                }
            }
        }

        setDistributing(true);
        try {
            await api.post('/ngo/distributions', {
                beneficiaryId: parseInt(distFormData.beneficiaryId),
                orderId: selectedOrder ? parseInt(selectedOrder) : null,
                foodItems: distFormData.foodItems,
                quantity: parseFloat(distFormData.quantity),
                unit: distFormData.unit
            });
            toast.success('Distribution logged successfully and reach updated!');
            setDistFormData({ beneficiaryId: '', foodItems: '', quantity: '', unit: 'kg' });
            setSelectedOrder('');
            fetchBeneficiaries();
            fetchDistributions();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to log distribution');
        } finally {
            setDistributing(false);
        }
    };

    const handleExport = () => {
        toast.success('Exporting beneficiary log to CSV...');
    };

    const filteredList = beneficiaries.filter(b => {
        const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'All' || b.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Beneficiary Management</h1>
                    <p className="text-[#065F46] mt-1">Manage and track shelters, schools, and orphanages receiving surplus food.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExport}
                        className="bg-white border text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm self-start"
                    >
                        Export Log
                    </button>
                    <button
                        onClick={() => { setEditingBeneficiary(null); setFormData({ name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: '' }); setModalOpen(true); }}
                        className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start shadow-sm"
                    >
                        <FiPlus /> Add Beneficiary Group
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('directory')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === 'directory' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FiUsers /> Beneficiary Directory
                </button>
                <button
                    onClick={() => setActiveTab('distributions')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === 'distributions' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FiPlusCircle /> Food Distribution
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <FiLoader className="animate-spin text-[#059669] w-8 h-8 mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Loading beneficiary dashboard...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'directory' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                                    <div className="p-3 bg-green-50 border border-green-100 text-[#059669] rounded-xl">
                                        <FiUsers className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Total Beneficiaries</p>
                                        <h3 className="text-xl font-bold text-gray-900">{beneficiaries.length} Groups</h3>
                                        <p className="text-[10px] text-gray-400">Registered centers</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                                        <FiCheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Total Estimated Reach</p>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {beneficiaries.reduce((sum, b) => sum + (b.size || 0), 0)} Individuals
                                        </h3>
                                        <p className="text-[10px] text-gray-400">Regular daily capacity</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                                    <div className="p-3 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl">
                                        <FiPlusCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Lifetime Distributions</p>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {distributions.length} times
                                        </h3>
                                        <p className="text-[10px] text-gray-400">Distribution rounds logged</p>
                                    </div>
                                </div>
                            </div>

                            {/* List and Filters Grid */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                {/* Search / Filter toolbar */}
                                <div className="p-4 bg-gray-50/50 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-full sm:w-auto overflow-x-auto">
                                        {['All', 'Orphanage', 'Homeless Shelter', 'Old Age Home', 'School'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTypeFilter(t)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                                                    typeFilter === t ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full sm:w-64 shrink-0">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search name, city..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b text-xs uppercase tracking-wider text-gray-500">
                                                <th className="px-6 py-4 font-semibold">Group / Center Name</th>
                                                <th className="px-6 py-4 font-semibold">Type</th>
                                                <th className="px-6 py-4 font-semibold">Location</th>
                                                <th className="px-6 py-4 font-semibold text-center">Avg Capacity</th>
                                                <th className="px-6 py-4 font-semibold text-center">Total Food Received</th>
                                                <th className="px-6 py-4 font-semibold">Last Served</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {filteredList.length > 0 ? (
                                                filteredList.map((b) => (
                                                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{b.name}</td>
                                                        <td className="px-6 py-4 font-semibold text-gray-700">{b.type}</td>
                                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{b.location}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-800">{b.size} people</td>
                                                        <td className="px-6 py-4 text-center font-bold text-[#059669]">{b.mealsReceived || 0} kg</td>
                                                        <td className="px-6 py-4 text-gray-500 font-medium">{b.lastServed || 'Never'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-3 text-sm">
                                                                <button 
                                                                    onClick={() => handleEditClick(b)}
                                                                    className="p-1 text-gray-400 hover:text-[#059669]" title="Edit"
                                                                >
                                                                    <FiEdit className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(b.id, b.name)}
                                                                    className="p-1 text-gray-400 hover:text-red-600" title="Delete"
                                                                >
                                                                    <FiTrash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                        No registered beneficiary centers found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'distributions' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {/* Distribution Sub-tabs */}
                            <div className="flex border-b border-gray-100 gap-4 mb-4 bg-white p-3 rounded-xl border">
                                <button
                                    onClick={() => setDistTab('add')}
                                    className={`pb-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                                        distTab === 'add' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <FiPlus /> Log Distribution
                                </button>
                                <button
                                    onClick={() => setDistTab('history')}
                                    className={`pb-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                                        distTab === 'history' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <FiList /> Distribution History
                                </button>
                            </div>

                            {distTab === 'add' ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl mx-auto animate-fadeIn">
                                    <h2 className="text-lg font-bold text-[#064E3B] mb-2 flex items-center gap-2">
                                        <FiPlusCircle /> Log & Assign Food Distribution
                                    </h2>
                                    <p className="text-xs text-gray-500 mb-6">
                                        Assign collected food orders or custom supplies to registered beneficiary groups. This dynamically logs reach metrics.
                                    </p>

                                    <form onSubmit={handleLogDistribution} className="space-y-4 text-xs">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Select Completed Order (Optional)</label>
                                            <select
                                                value={selectedOrder}
                                                onChange={(e) => handleOrderSelect(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                            >
                                                <option value="">-- Manual Supply (No Linked Order) --</option>
                                                {completedOrders.map(o => (
                                                    <option key={o.id} value={o.id}>
                                                        Order #{o.id} from {o.items[0]?.restaurantName || 'Restaurant'} ({new Date(o.createdAt).toLocaleDateString('en-IN')})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Selecting an order will auto-fill the food items list and quantities below.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Assign to Beneficiary Center *</label>
                                                <select
                                                    value={distFormData.beneficiaryId}
                                                    onChange={(e) => setDistFormData({ ...distFormData, beneficiaryId: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                                    required
                                                >
                                                    <option value="">-- Choose Center --</option>
                                                    {beneficiaries.map(b => (
                                                        <option key={b.id} value={b.id}>
                                                            {b.name} ({b.type} - Capacity: {b.size})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="col-span-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Quantity *</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        placeholder="e.g. 15"
                                                        value={distFormData.quantity}
                                                        onChange={(e) => setDistFormData({ ...distFormData, quantity: e.target.value })}
                                                        className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                        disabled={!!selectedOrder}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Unit</label>
                                                    <input
                                                        type="text"
                                                        value={distFormData.unit}
                                                        onChange={(e) => setDistFormData({ ...distFormData, unit: e.target.value })}
                                                        className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-gray-50 text-center disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                        disabled={!!selectedOrder}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Food Items Detail *</label>
                                            <textarea
                                                placeholder="e.g. Fresh Bread (15 kg), Sandwiches (10 packets)"
                                                value={distFormData.foodItems}
                                                onChange={(e) => setDistFormData({ ...distFormData, foodItems: e.target.value })}
                                                className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669] h-24"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={distributing}
                                            className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl font-bold transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        >
                                            {distributing ? 'Logging...' : <><FiCheckCircle /> Confirm Distribution</>}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-fadeIn">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                                    <th className="px-6 py-4">Beneficiary Center</th>
                                                    <th className="px-6 py-4">Distributed Items</th>
                                                    <th className="px-6 py-4 text-center">Amount / Quantity</th>
                                                    <th className="px-6 py-4">Distributed On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-xs">
                                                {distributions.length > 0 ? (
                                                    distributions.map((d) => (
                                                        <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-gray-900">{d.beneficiary?.name || 'Unknown Center'}</td>
                                                            <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{d.foodItems}</td>
                                                            <td className="px-6 py-4 text-center font-bold text-[#059669]">{d.quantity} {d.unit}</td>
                                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                                {new Date(d.distributedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                                            No food distributions logged yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Beneficiary Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border transition-all duration-300 transform scale-100 opacity-100 animate-[scaleIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-lg font-bold text-[#064E3B]">
                                {editingBeneficiary ? 'Edit Beneficiary Group' : 'Add New Beneficiary Group'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setModalOpen(false); setEditingBeneficiary(null); setFormData({ name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: '' }); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Center / Group Name *</label>
                                <input
                                    type="text"
                                    placeholder="Sunshine Shelter, Orphanage center..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Category Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                    >
                                        <option>Orphanage</option>
                                        <option>Homeless Shelter</option>
                                        <option>Old Age Home</option>
                                        <option>School</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Size (Avg Capacity) *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 50"
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location / Address Map *</label>
                                <div className="border rounded-xl p-2 bg-gray-50/50">
                                    <LocationPicker
                                        onLocationChange={({ address, city }) => {
                                            setFormData(prev => ({ ...prev, location: address || city || '' }));
                                        }}
                                        placeholder="Search center location..."
                                    />
                                </div>
                                {formData.location && (
                                    <p className="text-[10px] text-[#059669] font-medium mt-1">
                                        Selected: {formData.location}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        placeholder="+91 99999 99999"
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Notes / Dietary Info</label>
                                <textarea
                                    placeholder="Special notes, allergies, veg only etc."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#059669] h-20"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl font-bold transition-colors active:scale-95"
                                >
                                    {editingBeneficiary ? 'Save Changes' : 'Register Group'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setModalOpen(false); setEditingBeneficiary(null); setFormData({ name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: '' }); }}
                                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
