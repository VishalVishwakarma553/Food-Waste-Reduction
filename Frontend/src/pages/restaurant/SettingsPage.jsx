import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSave, FiMapPin, FiClock, FiCamera, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8080';

// Default fallback image — a restaurant/building icon placeholder
function BusinessImageFallback({ name }) {
    const initial = (name || 'B').charAt(0).toUpperCase();
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#059669] to-[#064E3B] text-white text-5xl font-bold select-none">
            {initial}
        </div>
    );
}

export default function SettingsPage() {
    const { user, saveSettings, updateProfile } = useAuth();
    const fileInputRef = useRef(null);

    // Preview state: either a new File object or null
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const currentImageUrl = user?.businessImage ? `${API_BASE}${user.businessImage}` : null;

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
        businessName: user?.businessName || '',
        cuisineType: user?.cuisineType || '',
        description: '',
    });

    const [hours, setHours] = useState('Mon–Sat: 7:00 AM – 8:00 PM | Sun: 8:00 AM – 6:00 PM');
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        dailyReport: true
    });

    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', profile.name);
            fd.append('phone', profile.phone);
            fd.append('address', profile.address);
            fd.append('city', profile.city);
            fd.append('state', profile.state);
            fd.append('pincode', profile.pincode);
            fd.append('businessName', profile.businessName);
            fd.append('cuisineType', profile.cuisineType);
            if (imageFile) fd.append('businessImage', imageFile);

            await saveSettings(fd);
            toast.success('Settings saved successfully!');
            clearImage();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const displayPreview = imagePreview || currentImageUrl;

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
                    {/* Business Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Business Logo / Cover Image</label>
                        <div className="flex items-center gap-6">
                            {/* Image Preview */}
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0 bg-gray-100">
                                {displayPreview ? (
                                    <img
                                        src={displayPreview}
                                        alt="Business"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <BusinessImageFallback name={profile.businessName || profile.name} />
                                )}

                                {/* Overlay clear button (only when there's a new preview) */}
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                                    >
                                        <FiX className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Upload area */}
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-3">
                                    Upload a logo or cover photo for your business. This appears on your dashboard and public profile.
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="businessImageInput"
                                />
                                <label
                                    htmlFor="businessImageInput"
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <FiCamera className="w-4 h-4 text-[#059669]" />
                                    {displayPreview ? 'Change Image' : 'Upload Image'}
                                </label>
                                <p className="text-xs text-gray-400 mt-2">JPEG, PNG or WEBP · Max 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text" value={profile.businessName} onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                                className="input-field"
                                placeholder="e.g. The Green Oven"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine / Business Type</label>
                            <input
                                type="text" value={profile.cuisineType} onChange={e => setProfile({ ...profile, cuisineType: e.target.value })}
                                className="input-field"
                                placeholder="e.g. Bakery, South Indian, Café"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Name</label>
                            <input
                                type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email" value={profile.email} readOnly
                                className="input-field opacity-60 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                            <input
                                type="text" value={profile.pincode} onChange={e => setProfile({ ...profile, pincode: e.target.value })}
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
                            placeholder="Street address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                            <input
                                type="text" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                            <input
                                type="text" value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">About the Business</label>
                        <textarea
                            value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })}
                            className="input-field resize-none h-24"
                            placeholder="Tell customers about your business and commitment to reducing food waste..."
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
