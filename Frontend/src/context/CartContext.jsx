import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [favoriteItems, setFavoriteItems] = useState([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('foodsave_cart');
        const storedFavRest = localStorage.getItem('foodsave_fav_restaurants');
        if (stored) setCartItems(JSON.parse(stored));
        if (storedFavRest) setFavoriteRestaurants(JSON.parse(storedFavRest));
    }, []);

    const persistCart = (items) => {
        setCartItems(items);
        localStorage.setItem('foodsave_cart', JSON.stringify(items));
    };

    // addToCart accepts full food object (real API or mock)
    const addToCart = (foodId, quantity = 1, pickupSlot = '', food = null) => {
        const existing = cartItems.find(i => i.foodId === foodId);
        if (existing) {
            persistCart(cartItems.map(i => i.foodId === foodId ? { ...i, quantity: i.quantity + quantity } : i));
        } else if (food) {
            persistCart([...cartItems, { foodId, quantity, pickupSlot, food }]);
        }
    };

    const removeFromCart = (foodId) => persistCart(cartItems.filter(i => i.foodId !== foodId));

    const updateQuantity = (foodId, qty) => {
        if (qty < 1) return removeFromCart(foodId);
        persistCart(cartItems.map(i => i.foodId === foodId ? { ...i, quantity: qty } : i));
    };

    const updatePickupSlot = (foodId, slot) => {
        persistCart(cartItems.map(i => i.foodId === foodId ? { ...i, pickupSlot: slot } : i));
    };

    const clearCart = () => persistCart([]);

    const cartTotal = cartItems.reduce((sum, i) => sum + i.food.discountedPrice * i.quantity, 0);
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    // --- Favorites (API-backed) --------------------------------
    const fetchFavorites = useCallback(async () => {
        const token = localStorage.getItem('foodsave_token');
        if (!token) return;
        setFavLoading(true);
        try {
            const { data } = await api.get('/consumer/favorites');
            setFavoriteItems(data.favorites);
            setFavorites(data.favorites.map(f => String(f.id)));
        } catch {
            // Silently fail
        } finally {
            setFavLoading(false);
        }
    }, []);

    // Auto-fetch favorites when user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('foodsave_token');
        if (token) fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (foodId) => {
        const idStr = String(foodId);
        const wasFav = favorites.includes(idStr);
        // Optimistic update
        if (wasFav) {
            setFavorites(prev => prev.filter(id => id !== idStr));
            setFavoriteItems(prev => prev.filter(f => String(f.id) !== idStr));
        }
        try {
            const { data } = await api.post(`/consumer/favorites/${foodId}`);
            if (data.favorited) {
                fetchFavorites();
            }
        } catch {
            if (!wasFav) {
                setFavorites(prev => prev.filter(id => id !== idStr));
                setFavoriteItems(prev => prev.filter(f => String(f.id) !== idStr));
            }
        }
    };

    const toggleFavoriteRestaurant = (restId) => {
        let updated;
        if (favoriteRestaurants.includes(restId)) {
            updated = favoriteRestaurants.filter(id => id !== restId);
        } else {
            updated = [...favoriteRestaurants, restId];
        }
        setFavoriteRestaurants(updated);
        localStorage.setItem('foodsave_fav_restaurants', JSON.stringify(updated));
    };

    return (
        <CartContext.Provider value={{
            cartItems, cartTotal, cartCount,
            favorites, favoriteItems, favoriteRestaurants, favLoading,
            addToCart, removeFromCart, updateQuantity, clearCart, updatePickupSlot,
            toggleFavorite, toggleFavoriteRestaurant, fetchFavorites,
            isFavorite: (id) => favorites.includes(String(id)),
            isFavoriteRestaurant: (id) => favoriteRestaurants.includes(id),
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
