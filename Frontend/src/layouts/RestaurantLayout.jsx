import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import RestaurantSidebar from '../components/layout/RestaurantSidebar';
import { FiMenu } from 'react-icons/fi';

export default function RestaurantLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F0FDF4]">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <RestaurantSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Mobile Topbar */}
                <div className="lg:hidden bg-white border-b border-[#D1FAE5] px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                    >
                        <FiMenu className="w-5 h-5 text-[#064E3B]" />
                    </button>
                    <span className="font-semibold text-[#064E3B]" style={{ fontFamily: "'Playfair Display SC', serif" }}>FoodSave Partner</span>
                </div>

                <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
