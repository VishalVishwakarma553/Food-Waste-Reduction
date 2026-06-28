import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        if (user?.role === 'restaurant') {
            return <Navigate to="/restaurant/dashboard" replace />;
        }
        if (user?.role === 'ngo') {
            return <Navigate to="/ngo/dashboard" replace />;
        }
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
