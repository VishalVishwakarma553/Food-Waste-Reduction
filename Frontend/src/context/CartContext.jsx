import { createContext, useContext, useState, useEffect } from 'react';
import { mockFoodItems } from '../data/mockData';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('foodsave_cart');
        const storedFav = localStorage.getItem('foodsave_favorites');
        const storedFavRest = localStorage.getItem('foodsave_fav_restaurants');
        if (stored) setCartItems(JSON.parse(stored));
        if (storedFav) setFavorites(JSON.parse(storedFav));
        if (storedFavRest) setFavoriteRestaurants(JSON.parse(storedFavRest));
    }, []);

    const persistCart = (items) => {
        setCartItems(items);
        localStorage.setItem('foodsave_cart', JSON.stringify(items));
    };

    const addToCart = (foodId, quantity = 1, pickupSlot = '') => {
        const food = mockFoodItems.find(f => f.id === foodId);
        if (!food) return;
        const existing = cartItems.find(i => i.foodId === foodId);
        if (existing) {
            persistCart(cartItems.map(i => i.foodId === foodId ? { ...i, quantity: i.quantity + quantity } : i));
        } else {
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

    const toggleFavorite = (foodId) => {
        let updated;
        if (favorites.includes(foodId)) {
            updated = favorites.filter(id => id !== foodId);
        } else {
            updated = [...favorites, foodId];
        }
        setFavorites(updated);
        localStorage.setItem('foodsave_favorites', JSON.stringify(updated));
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
            favorites, favoriteRestaurants,
            addToCart, removeFromCart, updateQuantity, clearCart, updatePickupSlot,
            toggleFavorite, toggleFavoriteRestaurant,
            isFavorite: (id) => favorites.includes(id),
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
