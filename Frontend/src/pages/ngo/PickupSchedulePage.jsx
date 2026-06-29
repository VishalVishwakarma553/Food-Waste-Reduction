import { useState } from 'react';
import {
    FiCalendar, FiClock, FiMapPin, FiPhone, FiCheckCircle,
    FiPlus, FiChevronLeft, FiChevronRight, FiMap, FiTruck, FiList
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockPickupsList = [
    { id: 'P1', date: '28 Jun 2026', restaurant: 'Gourmet Kitchen', address: '12 Bakery Lane, City Center', time: '04:30 PM', items: 'Fresh Bread', qty: '15 kg', status: 'Upcoming' },
    { id: 'P2', date: '28 Jun 2026', restaurant: 'Pizza Palace', address: '45 High St, North End', time: '06:00 PM', items: 'Surplus Pizzas', qty: '10 kg', status: 'Upcoming' },
    { id: 'P3', date: '29 Jun 2026', restaurant: 'Downtown Cafe', address: '88 Commerce Boulevard', time: '11:00 AM', items: 'Sandwiches & Salads', qty: '5 kg', status: 'Upcoming' },
    { id: 'P4', date: '27 Jun 2026', restaurant: 'Green Salads Co', address: '7 Organic Plaza', time: '05:00 PM', items: 'Salads & Wraps', qty: '12 kg', status: 'Completed' },
];

export default function PickupSchedulePage() {
    const [viewMode, setViewMode] = useState('timeline'); // timeline | calendar | route
    const [selectedDate, setSelectedDate] = useState('28 Jun 2026');
    const [pickups, setPickups] = useState(mockPickupsList);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [newPickup, setNewPickup] = useState({ restaurant: '', time: '', date: '28 Jun 2026', items: '', qty: '' });

    const handleCompletePickup = (pickupId, restaurant) => {
        setPickups(prev => prev.map(p => p.id === pickupId ? { ...p, status: 'Completed' } : p));
        toast.success(`Pickup from ${restaurant} completed! Logged to beneficiary feed.`);
    };

    const handleAddPickupSubmit = (e) => {
        e.preventDefault();
        if (!newPickup.restaurant || !newPickup.time) {
            toast.error('Please enter restaurant and time');
            return;
        }
        const created = {
            id: `P${Math.floor(100 + Math.random() * 900)}`,
            ...newPickup,
            address: 'Stored Registered Address',
            status: 'Upcoming'
        };
        setPickups([...pickups, created]);
        setScheduleModalOpen(false);
        toast.success('Pickup scheduled successfully');
    };

    const upcomingPickups = pickups.filter(p => p.status === 'Upcoming');
    const completedPickups = pickups.filter(p => p.status === 'Completed');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">NGO Pickup Schedule</h1>
                    <p className="text-[#065F46] mt-1">Coordinate and optimize pickups of claimed food donations.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setScheduleModalOpen(true)}
                        className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start shadow-sm"
                    >
                        <FiPlus /> Add Pickup Manually
                    </button>
                </div>
            </div>

            {/* View selectors tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                        viewMode === 'timeline' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FiList /> Pickup Timeline
                </button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                        viewMode === 'calendar' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FiCalendar /> Monthly Calendar
                </button>
                <button
                    onClick={() => setViewMode('route')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                        viewMode === 'route' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FiTruck /> Route Optimization
                </button>
            </div>

            {/* Content Body */}
            {viewMode === 'timeline' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Upcoming Collections ({upcomingPickups.length})</h2>
                        {upcomingPickups.length > 0 ? (
                            upcomingPickups.map((p) => (
                                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-base">{p.restaurant}</h3>
                                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                                                {p.date}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-start gap-1">
                                            <FiMapPin className="text-[#059669] mt-0.5 shrink-0" /> {p.address}
                                        </p>
                                        <p className="text-xs text-gray-700 font-semibold">Items: {p.items} ({p.qty})</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <FiClock /> Scheduled Pickup: {p.time}
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col justify-end gap-2 self-end md:self-center">
                                        <button 
                                            onClick={() => handleCompletePickup(p.id, p.restaurant)}
                                            className="bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"
                                        >
                                            <FiCheckCircle /> Mark Complete
                                        </button>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border px-3.5 py-2 rounded-xl text-xs font-semibold text-center"
                                        >
                                            Directions
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No upcoming pickups scheduled.</p>
                        )}
                    </div>

                    {/* Past Pickups History */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 self-start space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Distribution History</h2>
                        <div className="divide-y divide-gray-100">
                            {completedPickups.map((p) => (
                                <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{p.restaurant}</h4>
                                        <p className="text-gray-500">{p.items} — {p.qty}</p>
                                    </div>
                                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">Completed</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar View Mock */}
            {viewMode === 'calendar' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#064E3B] flex items-center gap-1.5"><FiCalendar /> June 2026</h2>
                        <div className="flex items-center gap-2">
                            <button className="p-2 border rounded-lg hover:bg-gray-50"><FiChevronLeft /></button>
                            <button className="p-2 border rounded-lg hover:bg-gray-50"><FiChevronRight /></button>
                        </div>
                    </div>
                    {/* Calendar grid mock */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="font-semibold text-gray-500 py-2 border-b">{day}</div>
                        ))}
                        {Array.from({ length: 30 }).map((_, idx) => {
                            const dateNum = idx + 1;
                            const isSelected = dateNum === 28;
                            const count = dateNum === 28 ? 2 : dateNum === 29 ? 1 : 0;

                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedDate(`${dateNum} Jun 2026`)}
                                    className={`min-h-[70px] border border-gray-100 rounded-xl p-2 cursor-pointer transition-all hover:bg-emerald-50/50 flex flex-col justify-between ${
                                        isSelected ? 'bg-emerald-50 border-[#059669]' : ''
                                    }`}
                                >
                                    <span className={`font-bold self-start ${isSelected ? 'text-[#059669] text-sm' : 'text-gray-700'}`}>{dateNum}</span>
                                    {count > 0 && (
                                        <span className="bg-[#059669] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full self-end">
                                            {count} pickup{count > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Route Optimizer Mock */}
            {viewMode === 'route' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden bg-emerald-50/20">
                        <FiMap className="w-16 h-16 text-[#059669]/40 mb-3 animate-pulse" />
                        <h3 className="font-bold text-[#064E3B] text-lg">Optimized Collection Route Map</h3>
                        <p className="text-xs text-[#065F46] max-w-sm text-center mt-1">
                            Suggested navigation path sequencing pickups to minimize transit distance. (Google Directions API mock)
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <h3 className="font-bold text-gray-900 text-base">Route Sequence</h3>
                        <div className="space-y-4">
                            <RouteSequenceNode index="1" title="Start Location" desc="NGO Headquarters" />
                            <RouteSequenceNode index="2" title="Gourmet Kitchen" desc="12 Bakery Lane (Pickup @ 4:30 PM)" active={true} />
                            <RouteSequenceNode index="3" title="Pizza Palace" desc="45 High St (Pickup @ 6:00 PM)" active={true} />
                            <RouteSequenceNode index="4" title="End Location" desc="Distribution Shelter center" />
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 text-gray-600 border mt-4">
                            <p className="font-semibold text-gray-900">Route Metrics:</p>
                            <p>Total distance: 7.2 km</p>
                            <p>Estimated transit duration: 35 minutes</p>
                            <button 
                                onClick={() => toast.success('Route exported successfully to Google Maps!')}
                                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2 rounded-xl text-[10px] font-bold mt-2"
                            >
                                Export Route to Phone
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Pickup Modal */}
            {scheduleModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddPickupSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
                        <h3 className="text-lg font-bold text-[#064E3B]">Schedule New Pickup</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Restaurant Partner</label>
                            <input
                                type="text"
                                placeholder="Restaurant name"
                                value={newPickup.restaurant}
                                onChange={(e) => setNewPickup({ ...newPickup, restaurant: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Date</label>
                                <input
                                    type="text"
                                    placeholder="28 Jun 2026"
                                    value={newPickup.date}
                                    onChange={(e) => setNewPickup({ ...newPickup, date: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Time Slot</label>
                                <input
                                    type="text"
                                    placeholder="04:30 PM"
                                    value={newPickup.time}
                                    onChange={(e) => setNewPickup({ ...newPickup, time: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Food Items</label>
                            <input
                                type="text"
                                placeholder="Items list"
                                value={newPickup.items}
                                onChange={(e) => setNewPickup({ ...newPickup, items: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Quantity</label>
                            <input
                                type="text"
                                placeholder="e.g. 15 kg"
                                value={newPickup.qty}
                                onChange={(e) => setNewPickup({ ...newPickup, qty: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-xs font-bold"
                            >
                                Schedule Pickup
                            </button>
                            <button
                                type="button"
                                onClick={() => setScheduleModalOpen(false)}
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

function RouteSequenceNode({ index, title, desc, active }) {
    return (
        <div className="flex gap-3 items-start relative pl-6 pb-4 border-l border-dashed border-gray-200 last:border-none last:pb-0">
            <div className={`absolute left-[-11px] w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                active ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-gray-400 border-gray-200'
            }`}>
                {index}
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-800 leading-none mb-1">{title}</h4>
                <p className="text-[10px] text-gray-500 font-semibold">{desc}</p>
            </div>
        </div>
    );
}
