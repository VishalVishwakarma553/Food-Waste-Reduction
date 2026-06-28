import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiShare2, FiAward } from 'react-icons/fi';
import { Leaf, DollarSign, Recycle, Utensils, Sprout, Star, Sunrise, Trophy, Crown, Award } from 'lucide-react';

const COLORS = ['#059669', '#0891B2', '#F59E0B', '#8B5CF6', '#EF4444'];

const BadgeIconMap = {
    '🌱': Sprout,
    '⭐': Star,
    '🌿': Leaf,
    '🌅': Sunrise,
    '🏆': Trophy,
    '♻️': Recycle,
    '🍽️': Utensils,
    '🍽': Utensils,
    '👑': Crown
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#D1FAE5] rounded-xl p-3 shadow-lg text-xs">
            <p className="font-bold text-[#064E3B] mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name === 'foodSaved' ? 'Food Saved' : p.name === 'moneySaved' ? 'Money Saved' : p.name}: {p.value}{p.name === 'foodSaved' ? 'kg' : p.name === 'moneySaved' ? ' ₹' : ''}</p>
            ))}
        </div>
    );
};

export default function ImpactPage() {
    const { user } = useAuth();
    const [period, setPeriod] = useState('monthly');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        api.get('/consumer/impact')
            .then(({ data }) => {
                if (active) setData(data);
            })
            .catch(err => {
                if (active) toast.error(err.response?.data?.error || 'Failed to load impact metrics');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#065F46] text-sm">Loading impact metrics...</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const chartData = data?.chartData?.[period] || [];
    const leaderboard = data?.leaderboard || [];
    const badges = data?.badges || [];
    const categoryData = data?.categoryData || [];
    const earnedBadges = badges.filter(b => b.earned);
    const unearned = badges.filter(b => !b.earned);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-[#064E3B]">My Impact Dashboard</h1>

            {/* Hero Impact */}
            <div className="rounded-[1.5rem] border border-[#D1FAE5] shadow-lg bg-gradient-to-br from-[#059669] to-[#0891B2] p-8 text-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { value: `${stats.foodSaved ?? 0}kg`, label: 'Food Saved', icon: Leaf },
                        { value: `₹${(stats.moneySaved ?? 0).toLocaleString('en-IN')}`, label: 'Money Saved', icon: DollarSign },
                        { value: `${stats.co2Reduced ?? 0}kg`, label: 'CO₂ Reduced', icon: Recycle },
                        { value: stats.mealsProvided ?? 0, label: 'Meals Provided', icon: Utensils },
                    ].map(
                        // eslint-disable-next-line no-unused-vars
                        ({ value, label, icon: Icon }) => (
                            <div key={label} className="text-center">
                                <div className="flex justify-center mb-3 text-white"><Icon className="w-8 h-8" strokeWidth={1.5} /></div>
                                <p className="text-3xl font-bold">{value}</p>
                                <p className="text-white/80 text-sm mt-1">{label}</p>
                            </div>
                        ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-white/80 text-sm">Community Rank: <strong className="text-white text-lg">#{stats.leaderboardRank ?? '—'}</strong></p>
                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all cursor-pointer">
                        <FiShare2 className="w-4 h-4" /> Share My Impact
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="card-flat p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#064E3B]">Impact Over Time</h2>
                    <div className="flex gap-2">
                        {['weekly', 'monthly'].map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${period === p ? 'bg-[#059669] text-white' : 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]'
                                    }`}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} barSize={14} barGap={3}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#065F46' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#065F46' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="foodSaved" name="foodSaved" fill="#059669" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="orders" name="orders" fill="#0891B2" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-6 justify-center mt-2">
                    <div className="flex items-center gap-2 text-xs text-[#065F46]"><div className="w-3 h-3 rounded bg-[#059669]" /> Food saved (kg)</div>
                    <div className="flex items-center gap-2 text-xs text-[#065F46]"><div className="w-3 h-3 rounded bg-[#0891B2]" /> Orders</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Category Pie */}
                <div className="card-flat p-6">
                    <h2 className="text-xl font-bold text-[#064E3B] mb-4">Food Saved by Category</h2>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => `${v} kg`} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-xs text-[#065F46] opacity-70">
                            No food saved yet. Rescued food stats will appear here.
                        </div>
                    )}
                </div>

                {/* Leaderboard */}
                <div className="card-flat p-6">
                    <h2 className="text-xl font-bold text-[#064E3B] mb-4">Community Leaderboard</h2>
                    <div className="space-y-3">
                        {leaderboard.map(({ rank, name, city, foodSaved, avatar }) => (
                            <div key={name} className={`flex items-center gap-3 p-3 rounded-xl ${rank <= 3 ? 'bg-[#F0FDF4]' : ''}`}>
                                <span className={`w-6 text-center font-bold text-sm ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-700' : 'text-[#065F46]'
                                    }`}>
                                    {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                                </span>
                                <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#064E3B] truncate">{name}</p>
                                    <p className="text-xs text-[#065F46]">{city}</p>
                                </div>
                                <p className="text-sm font-bold text-[#059669] shrink-0">{foodSaved}kg</p>
                            </div>
                        ))}
                        <div className="border-t border-[#D1FAE5] pt-3 flex items-center gap-3 p-3 bg-[#D1FAE5] rounded-xl">
                            <span className="w-6 text-center font-bold text-sm text-[#059669]">#{stats.leaderboardRank ?? '—'}</span>
                            <img src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name}`} alt="You" className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <p className="text-sm font-semibold text-[#059669] flex-1">You</p>
                            <p className="text-sm font-bold text-[#059669]">{stats.foodSaved ?? 0}kg</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div>
                <h2 className="text-xl font-bold text-[#064E3B] mb-5 flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-[#059669]" /> Badges & Achievements
                </h2>
                <div className="mb-4">
                    <p className="text-sm font-semibold text-[#065F46] mb-3">Earned ({earnedBadges.length})</p>
                    {earnedBadges.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                            {earnedBadges.map(badge => {
                                const BadgeIcon = BadgeIconMap[badge.icon] || Award;
                                return (
                                    <div key={badge.id} className="card p-3 text-center group relative cursor-pointer hover:bg-[#F0FDF4] transition-colors">
                                        <div className="flex justify-center mb-2 mt-1 text-[#059669]"><BadgeIcon className="w-8 h-8" strokeWidth={1.5} /></div>
                                        <p className="text-xs font-semibold text-[#064E3B] leading-tight">{badge.name}</p>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-[#064E3B] text-white text-xs rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center">
                                            {badge.description}
                                            {badge.earnedDate && <div className="text-[#D1FAE5] text-xs mt-1">{badge.earnedDate}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-[#065F46] opacity-70">Rescue meals to earn badges!</p>
                    )}
                </div>

                <div>
                    <p className="text-sm font-semibold text-[#065F46] mb-3">In Progress ({unearned.length})</p>
                    {unearned.length > 0 ? (
                        <div className="space-y-3">
                            {unearned.map(badge => {
                                const BadgeIcon = BadgeIconMap[badge.icon] || Award;
                                return (
                                    <div key={badge.id} className="card-flat p-4 flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                        <div className="text-[#065F46] opacity-50"><BadgeIcon className="w-8 h-8" strokeWidth={1.5} /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#064E3B]">{badge.name}</p>
                                            <p className="text-xs text-[#065F46] mb-2">{badge.description}</p>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }} />
                                            </div>
                                            <p className="text-xs text-[#065F46] mt-1">{badge.progress} / {badge.target}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-[#065F46] opacity-70">You've unlocked all badges! Incredible job! 🏆</p>
                    )}
                </div>
            </div>
        </div>
    );
}
