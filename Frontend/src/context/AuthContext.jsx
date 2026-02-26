import { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking stored auth
        const stored = localStorage.getItem('foodsave_user');
        if (stored) setUser(JSON.parse(stored));
        setIsLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock login - In future, call API
        const loggedInUser = { ...mockUser, email };
        setUser(loggedInUser);
        localStorage.setItem('foodsave_user', JSON.stringify(loggedInUser));
        return Promise.resolve(loggedInUser);
    };

    const register = (data) => {
        const newUser = { ...mockUser, ...data, id: 'user-new' };
        setUser(newUser);
        localStorage.setItem('foodsave_user', JSON.stringify(newUser));
        return Promise.resolve(newUser);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('foodsave_user');
    };

    const updateProfile = (data) => {
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem('foodsave_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
