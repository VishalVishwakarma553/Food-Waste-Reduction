import { useState, useEffect } from 'react';
import {
    FiCalendar, FiClock, FiMapPin, FiPhone, FiCheckCircle,
    FiChevronLeft, FiChevronRight, FiMap, FiTruck, FiList, FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function PickupSchedulePage() {
    const [viewMode, setViewMode] = useState('timeline'); // timeline | calendar | route
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const fetchPickups = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ngo/pickups');
            setPickups(data.pickups || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load pickups schedule');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();
    }, []);

    const handleCompletePickup = async (pickupId, restaurant) => {
        try {
            await api.patch(`/ngo/pickups/${pickupId}/complete`);
            toast.success(`Pickup from ${restaurant} completed! Logged to beneficiary feed.`);
            fetchPickups();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to complete pickup');
        }
    };

    const handleCancelPickup = async (pickupId, restaurant) => {
        if (!confirm('Cancel this pickup?')) return;
        try {
            await api.patch(`/ngo/pickups/${pickupId}/cancel`);
            toast.success(`Pickup from ${restaurant} cancelled.`);
            fetchPickups();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel pickup');
        }
    };

    const upcomingPickups = pickups.filter(p => p.status === 'Upcoming');
    const completedPickups = pickups.filter(p => p.status === 'Completed');

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getPickupsForDate = (dateNum) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
        return pickups.filter(p => p.date === dateStr);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#064E3B]">NGO Pickup Schedule</h1>
                    <p className="text-[#065F46] mt-1 text-sm">Coordinate and optimize pickups of claimed food donations.</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <FiLoader className="animate-spin text-[#059669] w-8 h-8 mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Loading pickups schedule...</p>
                </div>
            ) : (
                <>
                    {/* View selectors tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${viewMode === 'timeline' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FiList /> Pickup Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${viewMode === 'calendar' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FiCalendar /> Monthly Calendar
                        </button>
                        <button
                            onClick={() => setViewMode('route')}
                            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${viewMode === 'route' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
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
                                                <div className="flex items-center gap-2 flex-wrap">
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
                                                {p.dbStatus === 'approved' && (
                                                    <button 
                                                        onClick={() => handleCompletePickup(p.id, p.restaurant)}
                                                        className="bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                                                    >
                                                        <FiCheckCircle /> Mark Complete
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleCancelPickup(p.id, p.restaurant)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                                                >
                                                    Cancel Pickup
                                                </button>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border px-3.5 py-2 rounded-xl text-xs font-semibold text-center active:scale-95 transition-all"
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
                                    {completedPickups.length > 0 ? (
                                        completedPickups.map((p) => (
                                            <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{p.restaurant}</h4>
                                                    <p className="text-gray-500">{p.items} — {p.qty}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Picked up: {p.date}</p>
                                                </div>
                                                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">Completed</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 py-2">No completed pickups found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-[#064E3B] flex items-center gap-1.5"><FiCalendar /> {monthName}</h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={handlePrevMonth} className="p-2 border rounded-lg hover:bg-gray-50"><FiChevronLeft /></button>
                                    <button onClick={handleNextMonth} className="p-2 border rounded-lg hover:bg-gray-50"><FiChevronRight /></button>
                                </div>
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-2 text-center text-xs">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="font-semibold text-gray-500 py-2 border-b">{day}</div>
                                ))}
                                {/* Offset days */}
                                {Array.from({ length: startOffset }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="min-h-[70px] border border-transparent" />
                                ))}
                                {/* Month days */}
                                {Array.from({ length: daysInMonth }).map((_, idx) => {
                                    const dateNum = idx + 1;
                                    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                                    const dayPickups = getPickupsForDate(dateNum);
                                    const count = dayPickups.length;
                                    const isSelected = selectedDate === formattedDate;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedDate(formattedDate)}
                                            className={`min-h-[70px] border border-gray-100 rounded-xl p-2 cursor-pointer transition-all hover:bg-emerald-50/50 flex flex-col justify-between ${isSelected ? 'bg-emerald-50 border-[#059669]' : ''
                                                }`}
                                        >
                                            <span className={`font-bold self-start ${isSelected ? 'text-[#059669] text-sm' : 'text-gray-700'}`}>{dateNum}</span>
                                            {count > 0 && (
                                                <span className="bg-[#059669] text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center self-end shrink-0" title={`${count} pickup(s)`}>
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Selected Date Pickups Details */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="font-bold text-gray-900 text-sm mb-3">
                                    Pickups for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Selected Date'}
                                </h3>
                                {pickups.filter(p => p.date === selectedDate).length > 0 ? (
                                    <div className="space-y-3">
                                        {pickups.filter(p => p.date === selectedDate).map(p => (
                                            <div key={p.id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center text-xs">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{p.restaurant}</h4>
                                                    <p className="text-gray-500">{p.items} ({p.qty})</p>
                                                    <p className="text-gray-400 mt-0.5">{p.time}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    }`}>{p.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">No pickups scheduled for this date.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Route Optimizer View */}
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
                                    {upcomingPickups.slice(0, 3).map((p, idx) => (
                                        <RouteSequenceNode
                                            key={p.id}
                                            index={String(idx + 2)}
                                            title={p.restaurant}
                                            desc={`${p.address.split(',')[0]} (Pickup @ ${p.time})`}
                                            active={true}
                                        />
                                    ))}
                                    <RouteSequenceNode index={String(upcomingPickups.slice(0, 3).length + 2)} title="End Location" desc="Distribution Shelter center" />
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 text-gray-600 border mt-4">
                                    <p className="font-semibold text-gray-900">Route Metrics:</p>
                                    <p>Total distance: 7.2 km</p>
                                    <p>Estimated transit duration: 35 minutes</p>
                                    <button
                                        onClick={() => toast.success('Route exported successfully to Google Maps!')}
                                        className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-[10px] font-bold mt-2 active:scale-95 transition-all"
                                    >
                                        Export Route to Phone
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function RouteSequenceNode({ index, title, desc, active }) {
    return (
        <div className="flex gap-3 items-start relative pl-6 pb-4 border-l border-dashed border-gray-200 last:border-none last:pb-0">
            <div className={`absolute left-[-11px] w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${active ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-gray-400 border-gray-200'
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
