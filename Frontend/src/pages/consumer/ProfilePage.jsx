import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiCamera, FiSave, FiLock, FiBell, FiTrash2, FiCheckCircle, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const API_BASE = 'http://localhost:8080';
const tabs = ['Profile', 'Security', 'Notifications', 'Privacy'];

// Reusable toggle row
function Toggle({ label, sub, checked, onChange, disabled }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[#D1FAE5] last:border-0">
            <div>
                <p className="text-sm font-semibold text-[#064E3B]">{label}</p>
                <p className="text-xs text-[#065F46] mt-0.5">{sub}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#D1FAE5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]" />
            </label>
        </div>
    );
}

export default function ProfilePage() {
    const { user: authUser, updateProfile: updateAuthUser } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile tab state
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarRef = useRef();

    // Security tab state
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    // Notifications / Privacy saving state
    const [notifSaving, setNotifSaving] = useState(false);
    const [privacySaving, setPrivacySaving] = useState(false);

    // Load profile from DB on mount
    useEffect(() => {
        api.get('/consumer/profile')
            .then(r => {
                setProfile(r.data.user);
                setForm({
                    name: r.data.user.name || '',
                    phone: r.data.user.phone || '',
                    email: r.data.user.email || '',
                    bio: r.data.user.bio || '',
                    address: r.data.user.address || '',
                    city: r.data.user.city || '',
                    state: r.data.user.state || '',
                    pincode: r.data.user.pincode || '',
                });
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    // --- Avatar ---
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        if (!editing) setEditing(true);
    };

    // --- Profile save ---
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            ['name', 'phone', 'bio', 'address', 'city', 'state', 'pincode'].forEach(k => {
                if (form[k] !== undefined) fd.append(k, form[k]);
            });
            if (avatarFile) fd.append('avatar', avatarFile);

            const { data } = await api.patch('/consumer/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile(data.user);
            updateAuthUser(data.user); // keep AuthContext in sync
            setEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        // reset form to loaded profile
        if (profile) setForm({
            name: profile.name || '',
            phone: profile.phone || '',
            email: profile.email || '',
            bio: profile.bio || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
        });
    };

    // --- Notification toggle (auto-save on change) ---
    const handleNotifToggle = async (key) => {
        const updated = { ...profile, [key]: !profile[key] };
        setProfile(updated); // optimistic
        setNotifSaving(true);
        try {
            const { data } = await api.patch('/consumer/profile/notifications', {
                notifEmailOrders: updated.notifEmailOrders,
                notifEmailListings: updated.notifEmailListings,
                notifEmailDigest: updated.notifEmailDigest,
                notifSmsOrders: updated.notifSmsOrders,
                notifSmsListings: updated.notifSmsListings,
            });
            setProfile(data.user);
            toast.success('Saved');
        } catch {
            setProfile(p => ({ ...p, [key]: !p[key] })); // rollback
            toast.error('Failed to save');
        } finally {
            setNotifSaving(false);
        }
    };

    // --- Privacy toggle (auto-save on change) ---
    const handlePrivacyToggle = async (key) => {
        const updated = { ...profile, [key]: !profile[key] };
        setProfile(updated);
        setPrivacySaving(true);
        try {
            const { data } = await api.patch('/consumer/profile/privacy', {
                privacyShowLeaderboard: updated.privacyShowLeaderboard,
                privacyPublicProfile: updated.privacyPublicProfile,
            });
            setProfile(data.user);
            toast.success('Saved');
        } catch {
            setProfile(p => ({ ...p, [key]: !p[key] }));
            toast.error('Failed to save');
        } finally {
            setPrivacySaving(false);
        }
    };

    // --- Password change ---
    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error('Passwords do not match'); return;
        }
        if (pwForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters'); return;
        }
        setPwSaving(true);
        try {
            await api.post('/consumer/profile/change-password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password changed!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to change password');
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const avatarSrc = avatarPreview
        || (profile?.avatar ? `${API_BASE}${profile.avatar}` : null);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#064E3B]">My Profile</h1>

            {/* Avatar + name card */}
            <div className="card-flat p-6">
                <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                        {avatarSrc
                            ? <img src={avatarSrc} alt={profile?.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-[#D1FAE5]" />
                            : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#059669] to-[#0891B2] ring-4 ring-[#D1FAE5] flex items-center justify-center text-white text-3xl font-bold">
                                {profile?.name?.[0]?.toUpperCase() || '?'}
                              </div>
                        }
                        {/* Hidden file input */}
                        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <button
                            onClick={() => avatarRef.current.click()}
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#059669] text-white flex items-center justify-center cursor-pointer hover:bg-[#047857] transition-colors"
                            title="Upload photo"
                        >
                            <FiCamera className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-[#064E3B]">{profile?.name}</h2>
                        <p className="text-sm text-[#065F46]">{profile?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="badge badge-green text-xs">Consumer</span>
                            {profile?.privacyShowLeaderboard && (
                                <span className="badge bg-amber-100 text-amber-700 text-xs">Leaderboard Active</span>
                            )}
                        </div>
                        {profile?.bio && <p className="text-xs text-[#065F46] mt-1 italic">"{profile.bio}"</p>}
                    </div>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-2 px-4 shrink-0">
                            <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                    ) : (
                        <div className="flex gap-2 shrink-0">
                            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-60">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave className="w-4 h-4" /> Save</>}
                            </button>
                            <button onClick={handleCancelEdit} className="btn-secondary text-sm py-2 px-3">
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
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
                        { label: 'Phone Number', key: 'phone', type: 'tel' },
                    ].map(({ label, key, type }) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">{label}</label>
                            <input
                                type={type}
                                value={form[key] || ''}
                                disabled={!editing}
                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                className={`input-field text-sm ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Email Address</label>
                        <input type="email" value={form.email || ''} disabled className="input-field text-sm bg-[#F0FDF4] cursor-not-allowed opacity-70" />
                        <p className="text-xs text-[#065F46] mt-1">Email cannot be changed</p>
                    </div>
                    {[
                        { label: 'City', key: 'city' },
                        { label: 'State', key: 'state' },
                        { label: 'Pincode', key: 'pincode' },
                    ].map(({ label, key }) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">{label}</label>
                            <input
                                type="text"
                                value={form[key] || ''}
                                disabled={!editing}
                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                className={`input-field text-sm ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                            />
                        </div>
                    ))}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Address</label>
                        <textarea
                            value={form.address || ''}
                            disabled={!editing}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            rows={2}
                            className={`input-field text-sm resize-none ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">Short Bio</label>
                        <textarea
                            value={form.bio || ''}
                            disabled={!editing}
                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            rows={2}
                            maxLength={200}
                            placeholder="Tell others about yourself..."
                            className={`input-field text-sm resize-none ${!editing ? 'bg-[#F0FDF4] cursor-not-allowed opacity-70' : ''}`}
                        />
                        {editing && <p className="text-xs text-[#065F46] mt-1">{(form.bio || '').length}/200</p>}
                    </div>
                    {editing && (
                        <div className="md:col-span-2 flex gap-3">
                            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={handleCancelEdit} className="btn-secondary text-sm">Cancel</button>
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
                            {[
                                { label: 'Current Password', key: 'currentPassword', vis: 'current' },
                                { label: 'New Password', key: 'newPassword', vis: 'new' },
                                { label: 'Confirm New Password', key: 'confirmPassword', vis: 'confirm' },
                            ].map(({ label, key, vis }) => (
                                <div key={key}>
                                    <label className="block text-sm font-semibold text-[#064E3B] mb-1.5">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPw[vis] ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={pwForm[key]}
                                            onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                            className="input-field text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(s => ({ ...s, [vis]: !s[vis] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#065F46] hover:text-[#059669] cursor-pointer"
                                        >
                                            {showPw[vis] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={handleChangePassword}
                                disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                                className="btn-primary text-sm disabled:opacity-60"
                            >
                                {pwSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>

                    <div className="card-flat p-6">
                        <h3 className="font-bold text-[#064E3B] mb-3">Account Info</h3>
                        <div className="space-y-2 text-sm text-[#065F46]">
                            <p>Joined: <strong className="text-[#064E3B]">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—'}</strong></p>
                            <p>Role: <strong className="text-[#064E3B]">Consumer</strong></p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'Notifications' && (
                <div className="card-flat p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-[#064E3B] flex items-center gap-2"><FiBell className="w-4 h-4 text-[#059669]" /> Notification Preferences</h3>
                        {notifSaving && <div className="w-4 h-4 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <div className="space-y-0">
                        {[
                            { key: 'notifEmailOrders', label: 'Order Updates', sub: 'Emails for order confirmations and status changes' },
                            { key: 'notifEmailListings', label: 'New Listings', sub: 'Know when favourited restaurants post new food' },
                            { key: 'notifEmailDigest', label: 'Weekly Impact Digest', sub: 'Summary of your food saving impact each week' },
                            { key: 'notifSmsOrders', label: 'SMS Order Alerts', sub: 'Receive SMS for pickup reminders' },
                            { key: 'notifSmsListings', label: 'SMS New Listings', sub: 'SMS alerts for nearby food listings' },
                        ].map(({ key, label, sub }) => (
                            <Toggle
                                key={key}
                                label={label}
                                sub={sub}
                                checked={!!profile?.[key]}
                                onChange={() => handleNotifToggle(key)}
                                disabled={notifSaving}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'Privacy' && (
                <div className="space-y-5">
                    <div className="card-flat p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#064E3B]">Privacy Settings</h3>
                            {privacySaving && <div className="w-4 h-4 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />}
                        </div>
                        <div className="space-y-0">
                            {[
                                { key: 'privacyShowLeaderboard', label: 'Show on leaderboard', sub: 'Let others see your rank and food saved amount' },
                                { key: 'privacyPublicProfile', label: 'Public profile', sub: 'Allow others to view your badges and impact stats' },
                            ].map(({ key, label, sub }) => (
                                <Toggle
                                    key={key}
                                    label={label}
                                    sub={sub}
                                    checked={!!profile?.[key]}
                                    onChange={() => handlePrivacyToggle(key)}
                                    disabled={privacySaving}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="card-flat p-6 border-red-200 bg-red-50/30">
                        <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><FiTrash2 className="w-4 h-4" /> Danger Zone</h3>
                        <p className="text-sm text-[#065F46] mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                        <button className="text-sm text-red-600 border-2 border-red-300 px-4 py-2 rounded-xl hover:bg-red-100 cursor-pointer transition-colors font-semibold">
                            Delete My Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
