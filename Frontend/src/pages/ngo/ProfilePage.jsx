import { useState, useEffect, useRef } from 'react';
import {
    FiUpload, FiCheckCircle, FiFileText, FiPlus, FiTrash2,
    FiShield, FiMapPin, FiMail, FiPhone, FiLock, FiSliders, FiBell, FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api, { IMG_BASE_URL } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const mockTeamCoordinators = [
    { name: 'Amit Sharma', role: 'Administrator', email: 'amit@ngo.org', active: 'Just now' },
    { name: 'Pooja Patil', role: 'Field Coordinator', email: 'pooja@ngo.org', active: '2 hours ago' },
    { name: 'Rahul Roy', role: 'Volunteer Driver', email: 'rahul@ngo.org', active: 'Yesterday' },
];

export default function ProfilePage() {
    const { updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('Organization'); // Organization | Service Radius | Documents | Team | Settings
    const [team, setTeam] = useState(mockTeamCoordinators);
    const [coModalOpen, setCoModalOpen] = useState(false);
    const [newCo, setNewCo] = useState({ name: '', role: 'Volunteer Driver', email: '' });
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        bio: '',
        serviceRadius: 15,
        address: '',
        city: '',
        state: '',
        pincode: '',
        ngoRegNumber: '',
        avatar: '',
        documentReg: '',
        documentDeed: '',
        document12A: '',
        document80G: '',
        documentRegStatus: 'No Document',
        documentDeedStatus: 'No Document',
        document12AStatus: 'No Document',
        document80GStatus: 'No Document',
        notifNgoDonations: true,
        notifNgoStatus: true,
        notifNgoSms: false,
        notifNgoDigest: true
    });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ngo/profile');
            if (data.user) {
                setProfile({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    website: data.user.website || '',
                    bio: data.user.bio || '',
                    serviceRadius: data.user.serviceRadius || 15,
                    address: data.user.address || '',
                    city: data.user.city || '',
                    state: data.user.state || '',
                    pincode: data.user.pincode || '',
                    ngoRegNumber: data.user.ngoRegNumber || '',
                    avatar: data.user.avatar || '',
                    documentReg: data.user.documentReg || '',
                    documentDeed: data.user.documentDeed || '',
                    document12A: data.user.document12A || '',
                    document80G: data.user.document80G || '',
                    documentRegStatus: data.user.documentRegStatus || 'No Document',
                    documentDeedStatus: data.user.documentDeedStatus || 'No Document',
                    document12AStatus: data.user.document12AStatus || 'No Document',
                    document80GStatus: data.user.document80GStatus || 'No Document',
                    notifNgoDonations: data.user.notifNgoDonations ?? true,
                    notifNgoStatus: data.user.notifNgoStatus ?? true,
                    notifNgoSms: data.user.notifNgoSms ?? false,
                    notifNgoDigest: data.user.notifNgoDigest ?? true
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch('/ngo/profile', {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                website: profile.website,
                bio: profile.bio
            });
            toast.success('Organization settings saved successfully');
            if (data.user) {
                updateProfile(data.user);
                setProfile(prev => ({
                    ...prev,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    website: data.user.website,
                    bio: data.user.bio
                }));
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save settings');
        }
    };

    const handleSaveRadius = async () => {
        try {
            const { data } = await api.patch('/ngo/profile', {
                serviceRadius: profile.serviceRadius
            });
            toast.success('Service area radius updated');
            if (data.user) {
                updateProfile(data.user);
            }
        } catch (err) {
            toast.error('Failed to save service area radius');
        }
    };

    const handleDocUpload = async (docType, file) => {
        const formData = new FormData();
        formData.append('docType', docType);
        formData.append('file', file);

        try {
            toast.loading('Uploading document...', { id: 'doc-upload' });
            const { data } = await api.post('/ngo/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Document uploaded. Under admin review.', { id: 'doc-upload' });
            if (data.user) {
                updateProfile(data.user);
                setProfile(prev => ({
                    ...prev,
                    [`${docType}`]: data.user[docType],
                    [`${docType}Status`]: data.user[`${docType}Status`]
                }));
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload document', { id: 'doc-upload' });
        }
    };

    const handleLogoUpload = async (e) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('logo', file);

        try {
            toast.loading('Uploading logo...', { id: 'logo-upload' });
            const { data } = await api.patch('/ngo/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (data.user) {
                updateProfile(data.user);
                setProfile(prev => ({ ...prev, avatar: data.user.avatar }));
            }
            toast.success('Logo updated successfully!', { id: 'logo-upload' });
        } catch (err) {
            toast.error('Failed to upload logo', { id: 'logo-upload' });
        }
    };

    const handleTogglePreference = async (key, val) => {
        try {
            const { data } = await api.patch('/ngo/profile/notifications', {
                [key]: val
            });
            if (data.user) {
                updateProfile(data.user);
                setProfile(prev => ({
                    ...prev,
                    [key]: data.user[key]
                }));
            }
            toast.success('Notification preference updated');
        } catch (err) {
            toast.error('Failed to update notification preference');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error('All fields are required');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            toast.loading('Updating password...', { id: 'pwd-change' });
            await api.post('/ngo/profile/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password updated successfully!', { id: 'pwd-change' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update password', { id: 'pwd-change' });
        }
    };

    const handleAddCoordinator = (e) => {
        e.preventDefault();
        if (!newCo.name || !newCo.email) {
            toast.error('Coordinator details missing');
            return;
        }
        setTeam([...team, { ...newCo, active: 'Invited' }]);
        setCoModalOpen(false);
        setNewCo({ name: '', role: 'Volunteer Driver', email: '' });
        toast.success('Invitation sent to coordinator email');
    };

    const handleRemoveTeam = (email) => {
        setTeam(prev => prev.filter(t => t.email !== email));
        toast.error('Team member removed');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[50vh]">
                <FiLoader className="animate-spin text-[#059669] w-8 h-8 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Loading NGO Profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header profile details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    {profile.avatar ? (
                        <img
                            src={`${IMG_BASE_URL}${profile.avatar}`}
                            alt="NGO Logo"
                            className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#059669] to-[#064E3B] flex items-center justify-center text-white text-3xl font-bold select-none shadow-sm">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'H'}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name || 'NGO Partner'}</h1>
                            <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                                <FiCheckCircle className="w-3.5 h-3.5" /> Verified NGO
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Registration ID: {profile.ngoRegNumber || 'Verification In-progress'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        id="logo-input"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                    />
                    <label
                        htmlFor="logo-input"
                        className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                        <FiUpload /> Change Logo
                    </label>
                </div>
            </div>

            {/* Tab links */}
            <div className="flex border-b border-gray-200 overflow-x-auto w-full">
                {['Organization', 'Service Radius', 'Documents', 'Settings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 shrink-0 transition-all ${activeTab === tab ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Details */}
            {activeTab === 'Organization' && (
                <form onSubmit={handleSaveInfo} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-base font-bold text-[#064E3B] border-b pb-2">Organization Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Organization Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Official Website</label>
                            <input
                                type="text"
                                value={profile.website}
                                onChange={e => setProfile({ ...profile, website: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Primary Contact Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Primary Contact Phone</label>
                            <input
                                type="text"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mission Statement</label>
                        <textarea
                            rows="3"
                            value={profile.bio}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                            className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                        />
                    </div>
                    <button type="submit" className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors">
                        Save Profile Settings
                    </button>
                </form>
            )}

            {/* Service radius area settings */}
            {activeTab === 'Service Radius' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-base font-bold text-[#064E3B] border-b pb-2">Pickup Service Area</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1 uppercase">
                            <span>Service Area Radius</span>
                            <span className="text-[#059669] font-bold">{profile.serviceRadius} km</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={profile.serviceRadius}
                            onChange={(e) => setProfile({ ...profile, serviceRadius: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#059669]"
                        />
                        <p className="text-xs text-gray-500">Volunteer coordinators will receive alerts for food donations within this boundary of your registered address.</p>
                        <button
                            type="button"
                            onClick={handleSaveRadius}
                            className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                            Save Service Radius
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border flex items-center gap-3">
                        <FiMapPin className="text-[#059669] w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="font-bold text-xs text-gray-900">Registered Office Location</h4>
                            <p className="text-[10px] text-gray-500">
                                {profile.address ? `${profile.address}, ${profile.city || ''} ${profile.pincode || ''}` : 'No address registered.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Legal Documents */}
            {activeTab === 'Documents' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-base font-bold text-[#064E3B] border-b pb-2">Compliance & Legal Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocUploadCard docName="NGO Registration Certificate" required={true} status={profile.documentRegStatus} docUrl={profile.documentReg} onUpload={(file) => handleDocUpload('documentReg', file)} />
                        <DocUploadCard docName="Trust Deed / MOA" required={true} status={profile.documentDeedStatus} docUrl={profile.documentDeed} onUpload={(file) => handleDocUpload('documentDeed', file)} />
                        <DocUploadCard docName="12A Certificate" required={false} status={profile.document12AStatus} docUrl={profile.document12A} onUpload={(file) => handleDocUpload('document12A', file)} />
                        <DocUploadCard docName="80G Certificate (Tax Benefits)" required={false} status={profile.document80GStatus} docUrl={profile.document80G} onUpload={(file) => handleDocUpload('document80G', file)} />
                    </div>
                </div>
            )}

            {/* Team Members */}
            {activeTab === 'Team' && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Team Coordinators</h2>
                            <p className="text-xs text-gray-500">Coordinators with platform access to schedule and confirm pickups</p>
                        </div>
                        <button onClick={() => setCoModalOpen(true)} className="bg-[#059669] hover:bg-[#047857] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                            <FiPlus /> Invite Coordinator
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Last Active</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {team.map((t, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{t.name}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">{t.role}</td>
                                        <td className="px-6 py-4 text-gray-500">{t.email}</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{t.active}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveTeam(t.email)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Notification preferences and security settings */}
            {activeTab === 'Settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preferences */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                        <h2 className="text-base font-bold text-[#064E3B] border-b pb-2 flex items-center gap-1.5"><FiBell /> Notification Preferences</h2>
                        <div className="space-y-4">
                            <ToggleSwitch
                                label="New donations in service area"
                                desc="Get real-time emails when nearby food is posted"
                                checked={profile.notifNgoDonations}
                                onChange={(val) => handleTogglePreference('notifNgoDonations', val)}
                            />
                            <ToggleSwitch
                                label="Pickup status updates"
                                desc="Get notified when restaurant status moves to Confirmed/Ready"
                                checked={profile.notifNgoStatus}
                                onChange={(val) => handleTogglePreference('notifNgoStatus', val)}
                            />
                            <ToggleSwitch
                                label="SMS pickup reminders"
                                desc="Get mobile messages 1 hour before scheduled collections"
                                checked={profile.notifNgoSms}
                                onChange={(val) => handleTogglePreference('notifNgoSms', val)}
                            />
                            <ToggleSwitch
                                label="Monthly performance summaries"
                                desc="Receive newsletter with rescued food and carbon metrics"
                                checked={profile.notifNgoDigest}
                                onChange={(val) => handleTogglePreference('notifNgoDigest', val)}
                            />
                        </div>
                    </div>

                    {/* Account Security settings */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                        <h2 className="text-base font-bold text-[#064E3B] border-b pb-2 flex items-center gap-1.5"><FiShield /> Account Security</h2>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Current Password *</label>
                                <input
                                    type="password"
                                    placeholder="Enter Current Password"
                                    value={passwords.currentPassword}
                                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">New Password *</label>
                                <input
                                    type="password"
                                    placeholder="Enter New Password"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Confirm New Password *</label>
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                                    required
                                />
                            </div>
                            <button type="submit" className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer w-full md:w-auto animate-pulse-subtle">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite coordinator modal */}
            {coModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddCoordinator} className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border">
                        <h3 className="text-base font-bold text-[#064E3B] border-b pb-2">Invite Coordinator</h3>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Coordinator Name</label>
                            <input
                                type="text"
                                placeholder="Name"
                                value={newCo.name}
                                onChange={(e) => setNewCo({ ...newCo, name: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Coordinator Role</label>
                            <select
                                value={newCo.role}
                                onChange={(e) => setNewCo({ ...newCo, role: e.target.value })}
                                className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs focus:outline-none"
                            >
                                <option>Field Coordinator</option>
                                <option>Volunteer Driver</option>
                                <option>Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="email@ngo.org"
                                value={newCo.email}
                                onChange={(e) => setNewCo({ ...newCo, email: e.target.value })}
                                className="w-full border rounded-xl p-2.5 text-xs focus:outline-none"
                            />
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button type="submit" className="flex-1 bg-[#059669] text-white py-2.5 rounded-xl text-xs font-bold">Invite Coordinator</button>
                            <button type="button" onClick={() => setCoModalOpen(false)} className="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-semibold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}

function DocUploadCard({ docName, required, status, docUrl, onUpload }) {
    const fileInputRef = useRef(null);

    const statusClasses = {
        'Verified': 'bg-green-50 text-green-700 border-green-200',
        'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
        'No Document': 'bg-gray-50 text-gray-500 border-gray-200',
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="border rounded-xl p-4 flex flex-col justify-between bg-gray-50/50 hover:bg-white transition-all shadow-sm">
            <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">{docName}</h4>
                    {required && <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold shrink-0">Required</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold border ${statusClasses[status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {status}
                    </span>
                    {docUrl && (
                        <a
                            href={`${IMG_BASE_URL}${docUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#059669] hover:underline font-bold"
                        >
                            View Document
                        </a>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full bg-white border hover:bg-gray-50 text-gray-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
                <FiUpload /> Upload PDF
            </button>
        </div>
    );
}

function ToggleSwitch({ label, desc, checked, onChange }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900">{label}</p>
                <p className="text-[10px] text-gray-500 leading-snug">{desc}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`w-10 h-6 rounded-full p-1 transition-colors self-center shrink-0 cursor-pointer ${checked ? 'bg-[#059669]' : 'bg-gray-200'}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}
