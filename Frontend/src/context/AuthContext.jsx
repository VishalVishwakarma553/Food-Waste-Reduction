import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('foodsave_user');
        if (stored) setUser(JSON.parse(stored));
        setIsLoading(false);
    }, []);

    const persist = (user, token) => {
        setUser(user);
        localStorage.setItem('foodsave_user', JSON.stringify(user));
        if (token) localStorage.setItem('foodsave_token', token);
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        persist(data.user, data.token);
        toast.success(`Welcome back, ${data.user.businessName || data.user.name}!`);
        return data.user;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        persist(data.user, data.token);
        toast.success('Account created! Welcome to FoodSave 🎉');
        return data.user;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('foodsave_user');
        localStorage.removeItem('foodsave_token');
        toast.success('Logged out successfully');
    };

    // Local-only profile update (for optimistic UI)
    const updateProfile = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('foodsave_user', JSON.stringify(updated));
    };

    // API-backed settings update (restaurant settings + image)
    const saveSettings = async (formData) => {
        const { data } = await api.patch('/restaurant/settings', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        persist(data.user, null);
        return data.user;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, saveSettings, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
