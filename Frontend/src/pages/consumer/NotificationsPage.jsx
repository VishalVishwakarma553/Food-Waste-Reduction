import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiShoppingBag, FiAward, FiTag, FiPackage, FiX, FiCheck } from 'react-icons/fi';
import { mockNotifications } from '../../data/mockData';

const typeConfig = {
    order: { icon: FiPackage, color: 'bg-blue-100 text-blue-600' },
    listing: { icon: FiShoppingBag, color: 'bg-[#D1FAE5] text-[#059669]' },
    achievement: { icon: FiAward, color: 'bg-amber-100 text-amber-600' },
    offer: { icon: FiTag, color: 'bg-purple-100 text-purple-600' },
};

const tabs = ['All', 'Unread', 'Orders', 'Listings', 'Achievements'];

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState(mockNotifications);
    const [activeTab, setActiveTab] = useState('All');

    const markRead = (id) =>
        setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () =>
        setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    const deleteNotif = (id) =>
        setNotifs(ns => ns.filter(n => n.id !== id));

    const filtered = notifs.filter(n => {
        if (activeTab === 'Unread') return !n.read;
        if (activeTab === 'Orders') return n.type === 'order';
        if (activeTab === 'Listings') return n.type === 'listing';
        if (activeTab === 'Achievements') return n.type === 'achievement';
        return true;
    });

    const unreadCount = notifs.filter(n => !n.read).length;

    const handleClick = (notif) => {
        markRead(notif.id);
        navigate(notif.link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#064E3B]">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-[#059669] text-white text-xs px-2.5 py-1 rounded-full font-bold">{unreadCount}</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-sm text-[#059669] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                        <FiCheck className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`tab-btn text-sm ${activeTab === t ? 'active' : ''}`}>
                        {t}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <FiBell className="w-16 h-16 text-[#D1FAE5] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#064E3B] mb-2">You're all caught up!</h3>
                    <p className="text-[#065F46]">No new notifications at the moment.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(notif => {
                        const cfg = typeConfig[notif.type] || typeConfig.offer;
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={notif.id}
                                className={`card-flat p-4 flex items-start gap-4 cursor-pointer hover:border-[#10B981] transition-all ${!notif.read ? 'bg-[#F0FDF4] border-[#10B981]/30' : ''
                                    }`}
                                onClick={() => handleClick(notif)}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-semibold text-[#064E3B] ${!notif.read ? 'font-bold' : ''}`}>{notif.title}</p>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!notif.read && <div className="w-2 h-2 bg-[#059669] rounded-full" />}
                                            <button
                                                onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                                                className="p-1 rounded-lg hover:bg-[#D1FAE5] text-[#065F46] cursor-pointer transition-colors"
                                            >
                                                <FiX className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#065F46] mt-0.5 leading-relaxed">{notif.message}</p>
                                    <p className="text-xs text-[#065F46]/60 mt-1.5">{notif.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
