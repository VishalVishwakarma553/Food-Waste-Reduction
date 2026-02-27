import { useState } from 'react';
import { FiSearch, FiFilter, FiClock, FiCheckCircle, FiMoreVertical, FiShoppingBag, FiMapPin, FiPhone } from 'react-icons/fi';

const mockOrders = [
    {
        id: 'ORD-1042',
        customer: 'Rahul Kumar',
        phone: '+91 98765 43210',
        items: [
            { id: 1, name: 'Assorted Pastries (Box of 4)', qty: 1, price: 150 },
            { id: 2, name: 'Whole Wheat Loaf', qty: 2, price: 60 }
        ],
        amount: '2.5 kg',
        status: 'Pending',
        orderTime: '10:45 AM, Today',
        pickupTime: '11:30 AM - 12:30 PM',
        paymentMethod: 'Free'
    },
    {
        id: 'ORD-1041',
        customer: 'Sneha Patel',
        phone: '+91 98765 11223',
        items: [
            { id: 3, name: 'Vegetable Sandwich', qty: 3, price: 120 }
        ],
        amount: '0.8 kg',
        status: 'Ready',
        orderTime: '10:15 AM, Today',
        pickupTime: '11:00 AM - 12:00 PM',
        paymentMethod: 'Free'
    },
    {
        id: 'ORD-1040',
        customer: 'Amit Tripathi',
        phone: '+91 98765 44556',
        items: [
            { id: 4, name: 'Sourdough Bread', qty: 1, price: 80 }
        ],
        amount: '0.6 kg',
        status: 'Completed',
        orderTime: '09:30 AM, Today',
        pickupTime: '10:15 AM - 11:15 AM',
        paymentMethod: 'Free'
    },
    {
        id: 'ORD-1039',
        customer: 'Priya Raj',
        phone: '+91 98765 99887',
        items: [
            { id: 5, name: 'Chocolate Croissant', qty: 2, price: 90 },
            { id: 6, name: 'Blueberry Muffin', qty: 1, price: 60 }
        ],
        amount: '1.2 kg',
        status: 'Completed',
        orderTime: '09:00 AM, Today',
        pickupTime: '09:45 AM - 10:45 AM',
        paymentMethod: 'Free'
    },
    {
        id: 'ORD-1038',
        customer: 'Vikram Singh',
        phone: '+91 98765 55443',
        items: [
            { id: 1, name: 'Assorted Pastries (Box of 4)', qty: 2, price: 150 }
        ],
        amount: '1.5 kg',
        status: 'Cancelled',
        orderTime: '08:30 AM, Today',
        pickupTime: '09:00 AM - 10:00 AM',
        paymentMethod: 'Cancelled'
    }
];

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Ready': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#064E3B]">Order Management</h1>
                    <p className="text-[#065F46] mt-1">Track and update food pickups.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gray-50/50">
                    <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-full md:w-auto">
                        {['All', 'Pending', 'Ready', 'Completed', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-[#059669] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders or customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="divide-y divide-gray-100">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div
                                    className="flex flex-col lg:flex-row xl:items-center gap-4 lg:gap-6 cursor-pointer"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    {/* Order ID & Status */}
                                    <div className="flex-1 min-w-0 flex items-start justify-between lg:justify-start lg:block">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900">{order.id}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <FiClock className="w-3.5 h-3.5" /> Ordered at {order.orderTime}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex-1 lg:border-l lg:border-gray-200 lg:pl-6">
                                        <p className="font-medium text-gray-900">{order.customer}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                            <FiPhone className="w-3.5 h-3.5" /> {order.phone}
                                        </p>
                                    </div>

                                    {/* Pickup Time & Amount */}
                                    <div className="flex-1 lg:border-l lg:border-gray-200 lg:pl-6">
                                        <p className="font-medium text-[#059669] flex items-center gap-1">
                                            <FiMapPin className="w-3.5 h-3.5" /> Pickup: {order.pickupTime}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5">Rescued: <span className="font-bold text-gray-900">{order.amount}</span></p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-2 lg:mt-0 xl:justify-end">
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); /* logic */ }}
                                                className="btn-primary py-1.5 px-4 text-xs shrink-0"
                                            >
                                                Mark Ready
                                            </button>
                                        )}
                                        {order.status === 'Ready' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); /* logic */ }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-xl font-semibold text-xs transition-transform transform active:scale-95 shrink-0"
                                            >
                                                Confirm Pickup
                                            </button>
                                        )}
                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                            <FiMoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 pl-2 pr-2 lg:pr-12">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <FiShoppingBag className="w-4 h-4 text-gray-500" /> Order Items ({order.items.reduce((acc, item) => acc + item.qty, 0)})
                                        </h4>
                                        <div className="bg-white border text-sm border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between p-3 items-center">
                                                    <div className="flex gap-3 items-center">
                                                        <span className="font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{item.qty}x</span>
                                                        <span className="text-gray-800">{item.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <FiShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900">No orders found</p>
                            <p className="text-sm">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
