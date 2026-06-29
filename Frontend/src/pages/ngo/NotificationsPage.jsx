import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiBell, FiCheckCircle, FiInfo, FiTrash2, FiClock,
    FiFileText, FiShoppingBag, FiTruck, FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockNotifications = [
    { id: 1, type: 'Donations', title: 'New Surplus Food nearby!', message: 'Gourmet Kitchen posted "Assorted Bakery Surplus" (15 kg) 1.2 km away.', time: '10 mins ago', read: false, link: '/ngo/donations' },
    { id: 2, type: 'Requests', title: 'Pickup Request Approved', message: 'Pizza Palace confirmed your collection request REQ-2044.', time: '1 hour ago', read: false, link: '/ngo/requests/2044' },
    { id: 3, type: 'Pickups', title: 'Pickup Reminder', message: 'Your pickup at Gourmet Kitchen is scheduled in 1 hour.', time: '2 hours ago', read: true, link: '/ngo/pickups' },
    { id: 4, type: 'Documents', title: 'Verification Document Expiring', message: 'Your 12A exemption certificate is expiring in 15 days.', time: '1 day ago', read: false, link: '/ngo/profile' },
    { id: 5, type: 'Announcements', title: 'Winter Drive Collaboration', message: 'Join the platform-wide winter food drive starting next Monday.', time: '3 days ago', read: true, link: '#' },
];

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState(mockNotifications);
    const [filterTab, setFilterTab] = useState('All');

    const handleMarkAsRead = (id) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        toast.success('Notification marked as read');
    };

    const handleDelete = (id) => {
        setNotifs(prev => prev.filter(n => n.id !== id));
        toast.error('Notification dismissed');
    };

    const handleMarkAllRead = () => {
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const handleClearAll = () => {
        setNotifs([]);
        toast.error('Notifications cleared');
    };

    const filteredNotifs = notifs.filter(n => {
        if (filterTab === 'All') return true;
        return n.type === filterTab;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'Donations': return <FiShoppingBag className="text-green-600" />;
            case 'Requests': return <FiCheckCircle className="text-blue-600" />;
            case 'Pickups': return <FiTruck className="text-indigo-600" />;
            case 'Documents': return <FiAlertTriangle className="text-amber-500" />;
            default: return <FiInfo className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">NGO Notification Center</h1>
                    <p className="text-[#065F46] mt-1">Stay updated with nearby postings, verification steps, and pickup alerts.</p>
                </div>
                {notifs.length > 0 && (
                    <div className="flex gap-2 self-start">
                        <button 
                            onClick={handleMarkAllRead}
                            className="bg-white border text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-gray-50 transition-colors"
                        >
                            Mark All Read
                        </button>
                        <button 
                            onClick={handleClearAll}
                            className="bg-red-50 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-red-100 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto w-full">
                {['All', 'Donations', 'Requests', 'Pickups', 'Documents', 'Announcements'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilterTab(tab)}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 shrink-0 transition-all ${
                            filterTab === tab ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {filteredNotifs.length > 0 ? (
                    filteredNotifs.map((n) => (
                        <div 
                            key={n.id} 
                            className={`p-4 flex gap-4 hover:bg-gray-50/50 transition-colors items-start ${
                                !n.read ? 'bg-[#ECFDF5]/20' : ''
                            }`}
                        >
                            {/* Category Icon */}
                            <div className="p-3 rounded-xl border bg-white shadow-sm shrink-0 mt-0.5">
                                {getIcon(n.type)}
                            </div>

                            {/* Message Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className={`text-sm text-gray-900 ${!n.read ? 'font-bold' : 'font-semibold'}`}>{n.title}</h3>
                                    <span className="text-[10px] text-gray-400 shrink-0 font-medium flex items-center gap-1">
                                        <FiClock /> {n.time}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">{n.message}</p>
                                
                                <div className="flex gap-4 mt-3">
                                    {n.link !== '#' && (
                                        <Link 
                                            to={n.link}
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-[10px] font-bold text-[#059669] bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    )}
                                    {!n.read && (
                                        <button 
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-[10px] font-bold text-gray-500 hover:text-gray-700"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button 
                                onClick={() => handleDelete(n.id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors shrink-0"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <FiBell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-semibold text-gray-900">You're all caught up!</p>
                        <p className="text-sm mt-1">No notifications found in this tab.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
