import { FiShoppingBag, FiStar, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const notifications = [
    {
        id: 1,
        type: 'order',
        title: 'New Order Received',
        message: 'Order ORD-1043 placed by Sneha P. Pickup expected between 1:00 PM - 2:00 PM.',
        time: '10 Mins Ago',
        read: false,
    },
    {
        id: 2,
        type: 'warning',
        title: 'Listing Expiring Soon',
        message: 'Your listing "Dal Chawal" is expiring in 1 hour. Consider boosting or reducing price.',
        time: '1 Hour Ago',
        read: false,
    },
    {
        id: 3,
        type: 'review',
        title: 'New 5-Star Review',
        message: 'Ramesh left a 5-star review: "Excellent quality as always. Great initiative!"',
        time: 'Yesterday',
        read: true,
    },
    {
        id: 4,
        type: 'success',
        title: 'Weekly Report Ready',
        message: 'You saved 45kg of food this week! Click to view your full analytics report.',
        time: '2 Days Ago',
        read: true,
    }
];

export default function NotificationsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Notifications</h1>
                    <p className="text-[#065F46] mt-1">Stay updated with your latest alerts and order activities.</p>
                </div>
                <button className="text-sm font-medium text-[#059669] hover:underline bg-green-50 px-4 py-2 rounded-xl">
                    Mark all as read
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-5 flex gap-4 transition-colors ${notif.read ? 'bg-white' : 'bg-green-50/30'}`}>
                            <div className="shrink-0 mt-1">
                                {notif.type === 'order' && <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FiShoppingBag className="w-5 h-5" /></div>}
                                {notif.type === 'warning' && <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><FiAlertTriangle className="w-5 h-5" /></div>}
                                {notif.type === 'review' && <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><FiStar className="w-5 h-5" /></div>}
                                {notif.type === 'success' && <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FiCheckCircle className="w-5 h-5" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className={`text-base font-semibold ${notif.read ? 'text-gray-900' : 'text-[#064E3B]'}`}>{notif.title}</h3>
                                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{notif.time}</span>
                                </div>
                                <p className={`mt-1 text-sm ${notif.read ? 'text-gray-600' : 'text-[#065F46] font-medium'}`}>{notif.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
