import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiClock, FiMapPin, FiPhone, FiMail, FiMessageSquare,
    FiDownload, FiAlertOctagon, FiCheckCircle, FiChevronLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RequestDetailPage() {
    const { id } = useParams();
    const requestId = id || '2045';

    const [status, setStatus] = useState('Confirmed'); // Pending | Confirmed | Ready | Completed | Cancelled
    const [messages, setMessages] = useState([
        { sender: 'restaurant', text: 'Hi, the fresh breads are packed in brown paper bags. Ready for collection.', time: '11:15 AM' },
        { sender: 'ngo', text: 'Thank you! Our volunteer Rahul is on his way with our pickup van.', time: '11:20 AM' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, { sender: 'ngo', text: newMessage, time: 'Just now' }]);
        setNewMessage('');
        toast.success('Message sent');
    };

    const handleStatusTransition = (nextStatus, message) => {
        setStatus(nextStatus);
        toast.success(message);
    };

    const handleDownloadPDF = () => {
        toast.success('Downloading pickup gate pass PDF...');
    };

    return (
        <div className="space-y-6">
            {/* Header / Back navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/ngo/dashboard" className="p-2 rounded-lg hover:bg-gray-100 border transition-colors bg-white">
                        <FiChevronLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold text-[#064E3B]">Request ID: REQ-{requestId}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                status === 'Ready' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Submitted on 28th June 2026 at 10:30 AM</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={handleDownloadPDF}
                        className="bg-white border text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
                    >
                        <FiDownload /> Gate Pass PDF
                    </button>
                    {status === 'Confirmed' && (
                        <button 
                            onClick={() => handleStatusTransition('Ready', 'Food marked as ready for pickup')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                            Mark Ready
                        </button>
                    )}
                    {status === 'Ready' && (
                        <button 
                            onClick={() => handleStatusTransition('Completed', 'Pickup marked as complete! Impact added.')}
                            className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                            Confirm Pickup
                        </button>
                    )}
                </div>
            </div>

            {/* Stepper Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Request Status Timeline</h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                    <TimelineStep index="1" label="Submitted" desc="10:30 AM" active={true} />
                    <TimelineStep index="2" label="Confirmed" desc="11:00 AM" active={status !== 'Pending' && status !== 'Cancelled'} />
                    <TimelineStep index="3" label="Ready for Pickup" desc="11:15 AM" active={status === 'Ready' || status === 'Completed'} />
                    <TimelineStep index="4" label="Completed" desc="Waiting" active={status === 'Completed'} />
                </div>
            </div>

            {/* Content Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Columns - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Food Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#064E3B] border-b pb-2">Food Listing Details</h2>
                        <div className="flex gap-4 items-start flex-col sm:flex-row">
                            <img 
                                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80" 
                                alt="Bakery Surplus" 
                                className="w-24 h-24 rounded-xl object-cover border bg-gray-50 shrink-0" 
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Assorted Bakery Surplus</h3>
                                <p className="text-xs text-gray-500 font-semibold mb-2">Category: Bakery</p>
                                <p className="text-sm text-gray-700">Freshly baked croissants, baguettes, and sweet buns from today's batch. Individually wrapped for easy distribution.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl text-center">
                            <div>
                                <p className="text-xs text-gray-500">Requested</p>
                                <p className="font-bold text-gray-800 text-lg">15 kg</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Approved Qty</p>
                                <p className="font-bold text-[#059669] text-lg">15 kg</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Dietary</p>
                                <p className="font-bold text-gray-800 text-base">Vegetarian</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Packaging</p>
                                <p className="font-bold text-gray-800 text-base">Paper Bags</p>
                            </div>
                        </div>
                    </div>

                    {/* Restaurant Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-[#064E3B] border-b pb-2">Restaurant & Logistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Gourmet Kitchen</h3>
                                    <p className="text-xs text-gray-500">Verified FoodSave Provider</p>
                                </div>
                                <p className="text-sm text-gray-600 flex items-start gap-2">
                                    <FiMapPin className="text-[#059669] mt-1 shrink-0" />
                                    12 Bakery Lane, City Center, Main Market Road
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <FiPhone className="text-[#059669] shrink-0" />
                                    +91 98765 43210
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <FiMail className="text-[#059669] shrink-0" />
                                    coordination@gourmetkitchen.com
                                </p>
                                <a 
                                    href="https://maps.google.com" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-block text-xs font-bold text-white bg-[#059669] px-4 py-2 rounded-xl"
                                >
                                    Get Maps Directions
                                </a>
                            </div>

                            {/* Verification Gate QR */}
                            <div className="border rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Gate Verification Pass</h4>
                                <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center font-mono text-[10px] text-gray-400 select-none">
                                    [MOCK QR CODE]
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Scan at store gates for verified collection.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Communication */}
                <div className="space-y-6">
                    {/* Chat Simulator */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-[#064E3B] text-white p-4 flex items-center gap-2 shrink-0">
                            <FiMessageSquare />
                            <div>
                                <h3 className="font-bold text-sm">Store Chat Coordinator</h3>
                                <p className="text-[10px] text-emerald-300">Active online</p>
                            </div>
                        </div>

                        {/* Message body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                            {messages.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                                        m.sender === 'ngo' 
                                            ? 'ml-auto bg-[#059669] text-white rounded-tr-none' 
                                            : 'bg-white text-gray-800 border rounded-tl-none'
                                    }`}
                                >
                                    <p>{m.text}</p>
                                    <span className="block text-[8px] text-right mt-1 opacity-70">{m.time}</span>
                                </div>
                            ))}
                        </div>

                        {/* Send message input */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2 shrink-0">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#059669]"
                            />
                            <button 
                                type="submit"
                                className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                            >
                                Send
                            </button>
                        </form>
                    </div>

                    {/* Impact Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 text-center">
                        <h3 className="text-sm font-bold text-gray-900 uppercase">Estimated Impact</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 border rounded-xl bg-green-50/50">
                                <p className="text-lg font-bold text-[#059669]">15 kg</p>
                                <p className="text-[9px] text-gray-500 font-semibold uppercase mt-0.5">Saved</p>
                            </div>
                            <div className="p-2 border rounded-xl bg-green-50/50">
                                <p className="text-lg font-bold text-[#059669]">38</p>
                                <p className="text-[9px] text-gray-500 font-semibold uppercase mt-0.5">Meals</p>
                            </div>
                            <div className="p-2 border rounded-xl bg-green-50/50">
                                <p className="text-lg font-bold text-[#059669]">6.0kg</p>
                                <p className="text-[9px] text-gray-500 font-semibold uppercase mt-0.5">CO2 saved</p>
                            </div>
                        </div>
                    </div>

                    {/* Danger action */}
                    {status !== 'Completed' && status !== 'Cancelled' && (
                        <button 
                            onClick={() => handleStatusTransition('Cancelled', 'Pickup request cancelled')}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <FiAlertOctagon /> Cancel Pickup Request
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

function TimelineStep({ index, label, desc, active }) {
    return (
        <div className="flex-1 flex flex-col md:flex-row items-center gap-2 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                active ? 'bg-[#059669] text-white shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}>
                {active ? <FiCheckCircle className="w-4 h-4" /> : index}
            </div>
            <div className="text-center md:text-left">
                <p className={`text-xs font-bold ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                <p className="text-[10px] text-gray-400 font-semibold">{desc}</p>
            </div>
        </div>
    );
}
