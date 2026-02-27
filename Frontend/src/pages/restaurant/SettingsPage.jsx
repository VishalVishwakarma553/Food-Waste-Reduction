import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSave, FiMapPin, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();

    // Setting up form states seeded with user context. 
    // Usually, you would have dedicated endpoints for saving business/notification settings
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '12 Bakery Lane, Indiranagar, Bengaluru',
        description: 'The Green Oven is a heritage bakery committed to zero food waste. Every batch of unsold goods finds a loving home through FoodSave.',
    });

    const [hours, setHours] = useState('Mon–Sat: 7:00 AM – 8:00 PM | Sun: 8:00 AM – 6:00 PM');
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        dailyReport: true
    });

    const [loading, setLoading] = useState(false);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            updateProfile(profile);
            toast.success('Profile settings updated successfully!');
            setLoading(false);
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-[#064E3B]">Settings</h1>
                <p className="text-[#065F46] mt-1">Manage your business profile, operating hours, and preferences.</p>
            </div>

            {/* Profile Section */}
            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#111827]">Business Profile</h2>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary py-2 px-4 shadow-sm h-10 min-w-[120px] flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <><FiSave /> Save Changes</>}
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <FiMapPin className="text-gray-400" /> Business Address
                        </label>
                        <input
                            type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">About the Business</label>
                        <textarea
                            value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })}
                            className="input-field resize-none h-24"
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be shown on your public restaurant page.</p>
                    </div>
                </div>
            </form>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[#111827]">Operating Hours</h2>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <FiClock className="text-gray-400" /> Standard Pickup Hours
                    </label>
                    <input
                        type="text" value={hours} onChange={e => setHours(e.target.value)}
                        className="input-field max-w-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">These are the default hours shown to consumers. You can override pickup times on individual food listings.</p>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[#111827]">Notification Preferences</h2>
                </div>
                <div className="p-6 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications.emailAlerts}
                            onChange={e => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                            className="custom-checkbox w-5 h-5 rounded"
                        />
                        <div>
                            <p className="font-semibold text-sm text-gray-900">Email Alerts</p>
                            <p className="text-xs text-gray-500">Receive an email when you get a new order or cancellation.</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications.smsAlerts}
                            onChange={e => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                            className="custom-checkbox w-5 h-5 rounded"
                        />
                        <div>
                            <p className="font-semibold text-sm text-gray-900">SMS Alerts</p>
                            <p className="text-xs text-gray-500">Receive a text message for urgent updates.</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications.dailyReport}
                            onChange={e => setNotifications({ ...notifications, dailyReport: e.target.checked })}
                            className="custom-checkbox w-5 h-5 rounded"
                        />
                        <div>
                            <p className="font-semibold text-sm text-gray-900">Daily Impact Report</p>
                            <p className="text-xs text-gray-500">Get an end-of-day summary of food saved and revenue generated.</p>
                        </div>
                    </label>
                </div>
            </div>

        </div>
    );
}
