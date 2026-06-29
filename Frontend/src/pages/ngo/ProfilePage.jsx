import { useState } from 'react';
import {
    FiUpload, FiCheckCircle, FiFileText, FiPlus, FiTrash2,
    FiShield, FiMapPin, FiMail, FiPhone, FiLock, FiSliders, FiBell
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockTeamCoordinators = [
    { name: 'Amit Sharma', role: 'Administrator', email: 'amit@ngo.org', active: 'Just now' },
    { name: 'Pooja Patil', role: 'Field Coordinator', email: 'pooja@ngo.org', active: '2 hours ago' },
    { name: 'Rahul Roy', role: 'Volunteer Driver', email: 'rahul@ngo.org', active: 'Yesterday' },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('Organization'); // Organization | Service | Documents | Team | Settings
    const [team, setTeam] = useState(mockTeamCoordinators);
    const [serviceRadius, setServiceRadius] = useState(15);
    const [coModalOpen, setCoModalOpen] = useState(false);
    const [newCo, setNewCo] = useState({ name: '', role: 'Volunteer Driver', email: '' });

    const handleSaveInfo = (e) => {
        e.preventDefault();
        toast.success('Organization settings saved successfully');
    };

    const handleDocUpload = (docName) => {
        toast.success(`${docName} uploaded. Under admin review.`);
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

    return (
        <div className="space-y-6">
            {/* Header profile details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#059669] to-[#064E3B] flex items-center justify-center text-white text-3xl font-bold select-none">
                        H
                    </div>
                    <div>
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Helping Hands Foundation</h1>
                            <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                                <FiCheckCircle className="w-3.5 h-3.5" /> Verified NGO
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Registration ID: Trust/F-4820/95 | Member since 2026</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => toast.success('Uploading logo...')} className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm">
                        <FiUpload /> Change Logo
                    </button>
                </div>
            </div>

            {/* Tab links */}
            <div className="flex border-b border-gray-200 overflow-x-auto w-full">
                {['Organization', 'Service Radius', 'Documents', 'Team', 'Settings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 shrink-0 transition-all ${
                            activeTab === tab ? 'border-[#059669] text-[#059669]' : 'border-transparent text-gray-500 hover:text-gray-700'
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
                            <input type="text" defaultValue="Helping Hands Foundation" className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Official Website</label>
                            <input type="text" defaultValue="https://www.helpinghands.org" className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Primary Contact Email</label>
                            <input type="email" defaultValue="contact@helpinghands.org" className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Primary Contact Phone</label>
                            <input type="text" defaultValue="+91 99887 76655" className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mission Statement</label>
                        <textarea rows="3" defaultValue="Rescuing excess food from local events, restaurants, and supermarkets to feed underserved communities in City Center districts." className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]" />
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
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                            <span>Service Area Radius</span>
                            <span className="text-[#059669] font-bold">{serviceRadius} km</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={serviceRadius}
                            onChange={(e) => setServiceRadius(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#059669]"
                        />
                        <p className="text-xs text-gray-500 mt-2">Volunteer coordinators will receive alerts for food donations within this boundary of your registered address.</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border flex items-center gap-3">
                        <FiMapPin className="text-[#059669] w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="font-bold text-xs text-gray-900">Registered Office Location</h4>
                            <p className="text-[10px] text-gray-500">14 Charity Road, Central City District - 400001</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Legal Documents */}
            {activeTab === 'Documents' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-base font-bold text-[#064E3B] border-b pb-2">Compliance & Legal Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocUploadCard docName="NGO Registration Certificate" required={true} status="Verified" onUpload={() => handleDocUpload('Registration Certificate')} />
                        <DocUploadCard docName="Trust Deed / MOA" required={true} status="Verified" onUpload={() => handleDocUpload('Trust Deed')} />
                        <DocUploadCard docName="12A Certificate" required={false} status="Pending Review" onUpload={() => handleDocUpload('12A Certificate')} />
                        <DocUploadCard docName="80G Certificate (Tax Benefits)" required={false} status="No Document" onUpload={() => handleDocUpload('80G Certificate')} />
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
                            <ToggleSwitch label="New donations in service area" desc="Get real-time emails when nearby food is posted" defaultChecked={true} />
                            <ToggleSwitch label="Pickup status updates" desc="Get notified when restaurant status moves to Confirmed/Ready" defaultChecked={true} />
                            <ToggleSwitch label="SMS pickup reminders" desc="Get mobile messages 1 hour before scheduled collections" defaultChecked={false} />
                            <ToggleSwitch label="Monthly performance summaries" desc="Receive newsletter with rescued food and carbon metrics" defaultChecked={true} />
                        </div>
                    </div>

                    {/* Account Security settings */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                        <h2 className="text-base font-bold text-[#064E3B] border-b pb-2 flex items-center gap-1.5"><FiShield /> Account Security</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Update Password</label>
                                <input type="password" placeholder="New Password" className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]" />
                            </div>
                            <div>
                                <input type="password" placeholder="Confirm New Password" className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669] mt-2" />
                            </div>
                            <button onClick={() => toast.success('Password updated successfully')} className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors">
                                Update Password
                            </button>
                        </div>
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

function DocUploadCard({ docName, required, status, onUpload }) {
    const statusClasses = {
        'Verified': 'bg-green-50 text-green-700 border-green-200',
        'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
        'No Document': 'bg-gray-50 text-gray-500 border-gray-200',
    };

    return (
        <div className="border rounded-xl p-4 flex flex-col justify-between bg-gray-50/50 hover:bg-white transition-all">
            <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">{docName}</h4>
                    {required && <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold shrink-0">Required</span>}
                </div>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold border ${statusClasses[status]}`}>
                    {status}
                </span>
            </div>

            <button onClick={onUpload} className="mt-4 w-full bg-white border hover:bg-gray-50 text-gray-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                <FiUpload /> Upload PDF
            </button>
        </div>
    );
}

function ToggleSwitch({ label, desc, defaultChecked }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900">{label}</p>
                <p className="text-[10px] text-gray-500 leading-snug">{desc}</p>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={`w-10 h-6 rounded-full p-1 transition-colors self-center shrink-0 ${checked ? 'bg-[#059669]' : 'bg-gray-200'}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}
