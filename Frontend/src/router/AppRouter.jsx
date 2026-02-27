import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import ConsumerLayout from '../layouts/ConsumerLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import AboutPage from '../pages/public/AboutPage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import BrowsePage from '../pages/public/BrowsePage';
import RestaurantDetailPage from '../pages/public/RestaurantDetailPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

// Consumer Pages
import DashboardPage from '../pages/consumer/DashboardPage';
import ListingsPage from '../pages/consumer/ListingsPage';
import FoodDetailPage from '../pages/consumer/FoodDetailPage';
import CartPage from '../pages/consumer/CartPage';
import CheckoutPage from '../pages/consumer/CheckoutPage';
import OrdersPage from '../pages/consumer/OrdersPage';
import OrderDetailPage from '../pages/consumer/OrderDetailPage';
import ImpactPage from '../pages/consumer/ImpactPage';
import FavoritesPage from '../pages/consumer/FavoritesPage';
import NotificationsPage from '../pages/consumer/NotificationsPage';
import ProfilePage from '../pages/consumer/ProfilePage';

// Restaurant Pages
import RestaurantLayout from '../layouts/RestaurantLayout';
import RestaurantDashboardPage from '../pages/restaurant/DashboardPage';
import AddListingPage from '../pages/restaurant/AddListingPage';
import MyListingsPage from '../pages/restaurant/MyListingsPage';
import RestaurantOrdersPage from '../pages/restaurant/OrdersPage';
import AnalyticsPage from '../pages/restaurant/AnalyticsPage';
import RestaurantNotificationsPage from '../pages/restaurant/NotificationsPage';
import SettingsPage from '../pages/restaurant/SettingsPage';

function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#ECFDF5]">
            <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

export default function AppRouter() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            </Route>

            {/* Protected Consumer Routes */}
            <Route element={
                <ProtectedRoute>
                    <ConsumerLayout />
                </ProtectedRoute>
            }>
                <Route path="/consumer/dashboard" element={<DashboardPage />} />
                <Route path="/consumer/listings" element={<ListingsPage />} />
                <Route path="/consumer/food/:id" element={<FoodDetailPage />} />
                <Route path="/consumer/cart" element={<CartPage />} />
                <Route path="/consumer/checkout" element={<CheckoutPage />} />
                <Route path="/consumer/orders" element={<OrdersPage />} />
                <Route path="/consumer/order/:id" element={<OrderDetailPage />} />
                <Route path="/consumer/impact" element={<ImpactPage />} />
                <Route path="/consumer/favorites" element={<FavoritesPage />} />
                <Route path="/consumer/notifications" element={<NotificationsPage />} />
                <Route path="/consumer/profile" element={<ProfilePage />} />
            </Route>

            {/* Protected Restaurant Routes */}
            <Route element={
                <ProtectedRoute>
                    <RestaurantLayout />
                </ProtectedRoute>
            }>
                <Route path="/restaurant/dashboard" element={<RestaurantDashboardPage />} />
                <Route path="/restaurant/add-listing" element={<AddListingPage />} />
                <Route path="/restaurant/listings" element={<MyListingsPage />} />
                <Route path="/restaurant/orders" element={<RestaurantOrdersPage />} />
                <Route path="/restaurant/analytics" element={<AnalyticsPage />} />
                <Route path="/restaurant/notifications" element={<RestaurantNotificationsPage />} />
                <Route path="/restaurant/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
