import { useState } from 'react';
import {
    FiUsers, FiPlus, FiSearch, FiSliders, FiEdit, FiTrash2,
    FiCheckCircle, FiChevronRight, FiList, FiClock, FiPlusCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockBeneficiaries = [
    { id: 1, name: 'Sunshine Orphanage', type: 'Orphanage', location: 'Downtown Area', size: 45, mealsReceived: 380, lastServed: '27 Jun 2026' },
    { id: 2, name: 'St. Jude Homeless Shelter', type: 'Homeless Shelter', location: 'West End', size: 120, mealsReceived: 1100, lastServed: '28 Jun 2026' },
    { id: 3, name: 'Grace Old Age Home', type: 'Old Age Home', location: 'Suburbs North', size: 30, mealsReceived: 210, lastServed: '25 Jun 2026' },
    { id: 4, name: 'Hope Primary School (Midday)', type: 'School', location: 'East District', size: 150, mealsReceived: 750, lastServed: '24 Jun 2026' },
];

export default function BeneficiaryManagementPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [beneficiaries, setBeneficiaries] = useState(mockBeneficiaries);
    const [modalOpen, setModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: ''
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.location || !formData.size) {
            toast.error('Please fill in required fields');
            return;
        }

        const created = {
            id: beneficiaries.length + 1,
            name: formData.name,
            type: formData.type,
            location: formData.location,
            size: parseInt(formData.size) || 1,
            mealsReceived: 0,
            lastServed: 'Never'
        };

        setBeneficiaries([...beneficiaries, created]);
        setModalOpen(false);
        setFormData({ name: '', type: 'Orphanage', location: '', size: '', contactPhone: '', notes: '' });
        toast.success(`Registered "${created.name}" successfully`);
    };

    const handleDelete = (id, name) => {
        setBeneficiaries(prev => prev.filter(b => b.id !== id));
        toast.error(`Removed beneficiary: ${name}`);
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
                        onClick={() => setModalOpen(true)}
                        className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start shadow-sm"
                    >
                        <FiPlus /> Add Beneficiary Group
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-50 border border-green-100 text-[#059669] rounded-xl">
                        <FiUsers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Total Beneficiaries</p>
                        <h3 className="text-xl font-bold text-gray-900">{beneficiaries.length} Groups</h3>
                        <p className="text-[10px] text-gray-400">Registered on platform</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                        <FiCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Total Estimated Reach</p>
                        <h3 className="text-xl font-bold text-gray-900">
                            {beneficiaries.reduce((sum, b) => sum + b.size, 0)} Individuals
                        </h3>
                        <p className="text-[10px] text-gray-400">Regular daily capacity</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
                    <div className="p-3 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl">
                        <FiPlusCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Lifetime Meals Distributed</p>
                        <h3 className="text-xl font-bold text-gray-900">
                            {beneficiaries.reduce((sum, b) => sum + b.mealsReceived, 0)} meals
                        </h3>
                        <p className="text-[10px] text-gray-400">Rescued food conversions</p>
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
                                <th className="px-6 py-4 font-semibold text-center">Total Meals Received</th>
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
                                        <td className="px-6 py-4 text-gray-500">{b.location}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">{b.size} people</td>
                                        <td className="px-6 py-4 text-center font-bold text-[#059669]">{b.mealsReceived} meals</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{b.lastServed}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3 text-sm">
                                                <button 
                                                    onClick={() => toast.success(`Editing details for ${b.name}...`)}
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

            {/* Add Beneficiary Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
                        <h3 className="text-lg font-bold text-[#064E3B] border-b pb-2">Add New Beneficiary Group</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Center / Group Name *</label>
                            <input
                                type="text"
                                placeholder="Sunshine Shelter, Orphanage center..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Category Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
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
                                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location / District *</label>
                            <input
                                type="text"
                                placeholder="e.g. East District, West End"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Contact Phone</label>
                            <input
                                type="text"
                                placeholder="+91 99999 99999"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Notes / Dietary Info</label>
                            <textarea
                                placeholder="Special notes, allergies, veg only etc."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669] h-20"
                            />
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-xs font-bold"
                            >
                                Register Group
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
