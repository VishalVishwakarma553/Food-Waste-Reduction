import { useState } from 'react';
import { FiEdit2, FiCamera, FiSave, FiLock, FiBell, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const tabs = ['Profile', 'Security', 'Notifications', 'Privacy'];

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        bio: 'Food enthusiast committed to sustainable living and reducing waste.',
        address: user?.address || '14, 2nd Cross, Indiranagar, Bengaluru, Karnataka',
    });

    const [notifPrefs, setNotifPrefs] = useState({
        emailOrders: true,
        emailListings: true,
        emailWeeklyDigest: false,
        smsOrders: true,
        smsListings: false,
    });

    const handleSave = () => {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#064E3B]">My Profile</h1>
                {saved && (
                    <div className="flex items-center gap-2 bg-[#D1FAE5] text-[#059669] text-sm font-semibold px-4 py-2 rounded-full animate-fade-in">
                        <FiCheckCircle className="w-4 h-4" /> Profile Updated!
                    </div>
                )}
            </div>

            {/* Avatar */}
            <div className="card-flat p-6">
                <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                        <img src={user?.avatar} alt={user?.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-[#D1FAE5]" />
                        <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#059669] text-white flex items-center justify-center cursor-pointer hover:bg-[#047857] transition-colors">
                            <FiCamera className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-[#064E3B]">{user?.name}</h2>
                        <p className="text-sm text-[#065F46]">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="badge badge-green text-xs">Consumer</span>
                            <span className="badge bg-amber-100 text-amber-700 text-xs">Rank #{user?.leaderboardRank}</span>
                        </div>
                    </div>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-2 px-4 shrink-0">
                            <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                    ) : (
                        <button onClick={handleSave} className="btn-primary text-sm py-2 px-4 shrink-0">
                            <FiSave className="w-4 h-4" /> Save
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`}>{t}</button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'Profile' && (
                <div className="grid md:grid-cols-2 gap-5">
                    {[
                        { label: 'Full Name', key: 'name', type: 'text' },
                        { label: 'Email Address', key: 'email', type: 'email' },
                        { label: 'Phone Number', key: 'phone', type: 'tel' },
                    ].map(({ label, key, type }) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">{label}</label>
                            <input
                                type={type}
                                value={form[key]}
                                disabled={!editing}
                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                className={`input-field text-sm ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                            />
                        </div>
                    ))}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Delivery Address</label>
                        <textarea
                            value={form.address}
                            disabled={!editing}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            rows={2}
                            className={`input-field text-sm resize-none ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Short Bio</label>
                        <textarea
                            value={form.bio}
                            disabled={!editing}
                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            rows={2}
                            className={`input-field text-sm resize-none ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                        />
                    </div>
                    {editing && (
                        <div className="md:col-span-2 flex gap-3">
                            <button onClick={handleSave} className="btn-primary text-sm">Save Changes</button>
                            <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                        </div>
                    )}
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'Security' && (
                <div className="space-y-5">
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2">
                            <FiLock className="text-[#059669] w-4 h-4" /> Change Password
                        </h3>
                        <div className="space-y-4 max-w-md">
                            {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                                <div key={label}>
                                    <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">{label}</label>
                                    <input type="password" placeholder="••••••••" className="input-field text-sm" />
                                </div>
                            ))}
                            <button className="btn-primary text-sm">Update Password</button>
                        </div>
                    </div>

                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-3">Two-Factor Authentication</h3>
                        <p className="text-sm text-[#065F46] mb-4">Add an extra layer of security to your account.</p>
                        <div className="flex items-center justify-between p-3 bg-[#F0FDF4] rounded-xl">
                            <div>
                                <p className="text-sm font-semibold text-[#064E3B]">SMS Authentication</p>
                                <p className="text-xs text-[#065F46]">Ends in ••••3456</p>
                            </div>
                            <span className="badge badge-green text-xs">Enabled</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'Notifications' && (
                <div className="card-flat p-6">
                    <h3 className="font-bold text-[#064E3B] mb-5">Notification Preferences</h3>
                    <div className="space-y-4">
                        {[
                            { key: 'emailOrders', label: 'Order Updates', sub: 'Get emails for order confirmations and status changes' },
                            { key: 'emailListings', label: 'New Listings', sub: 'Know when favourited restaurants post new food' },
                            { key: 'emailWeeklyDigest', label: 'Weekly Impact Digest', sub: 'Summary of your food saving impact each week' },
                            { key: 'smsOrders', label: 'SMS Order Alerts', sub: 'Receive SMS for pickup reminders' },
                            { key: 'smsListings', label: 'SMS New Listings', sub: 'SMS alerts for nearby food listings' },
                        ].map(({ key, label, sub }) => (
                            <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-[#D1FAE5] last:border-0">
                                <div>
                                    <p className="text-sm font-semibold text-[#064E3B]">{label}</p>
                                    <p className="text-xs text-[#065F46] mt-0.5">{sub}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" checked={notifPrefs[key]} onChange={e => setNotifPrefs(p => ({ ...p, [key]: e.target.checked }))} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-[#D1FAE5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]" />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'Privacy' && (
                <div className="space-y-5">
                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-4">Privacy Settings</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Show on leaderboard', sub: 'Let others see your rank and food saved amount' },
                                { label: 'Public profile', sub: 'Allow others to view your badges and impact stats' },
                            ].map(({ label, sub }) => (
                                <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-[#D1FAE5] last:border-0">
                                    <div>
                                        <p className="text-sm font-semibold text-[#064E3B]">{label}</p>
                                        <p className="text-xs text-[#065F46]">{sub}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-[#D1FAE5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card-flat p-6 border-red-200 bg-red-50/30">
                        <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><FiTrash2 className="w-4 h-4" /> Danger Zone</h3>
                        <p className="text-sm text-[#065F46] mb-4">Permanently delete your account and all associated data.</p>
                        <button className="text-sm text-red-600 border-2 border-red-300 px-4 py-2 rounded-xl hover:bg-red-100 cursor-pointer transition-colors font-semibold">
                            Delete My Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
