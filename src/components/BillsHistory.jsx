import React, { useState, useEffect } from 'react';
import { getOrders, downloadBill } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const BillsHistory = () => {
    const { colors } = useTheme();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedBill, setSelectedBill] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadBills();
    }, [filter]);

    const loadBills = async () => {
        try {
            setLoading(true);
            const days = filter === '7' ? 7 : filter === '30' ? 30 : null;
            const data = await getOrders(1, 100, days);
            setBills(data);
        } catch (error) {
            console.error("Error loading bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewBill = (bill) => {
        setSelectedBill(bill);
        setShowModal(true);
    };

    const handleDownload = async (billId) => {
        try {
            await downloadBill(billId);
        } catch (error) {
            alert("Failed to download bill. Please try again later.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">Bills History</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 mr-2">Filter:</span>
                    <div className={`p-1 rounded-lg flex ${colors.bg}`}>
                        <button
                            onClick={() => setFilter('7')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === '7' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => setFilter('30')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === '30' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Last 30 Days
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            All Time
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${colors.card} rounded-xl overflow-hidden border ${colors.border}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b ${colors.border} bg-gray-800/30`}>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Bill ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className="h-4 bg-gray-700 rounded w-full opacity-20"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                                        No bills found for the selected period
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs text-blue-400">#{bill.id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-white font-medium">{bill.customer_name || 'Guest'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(bill.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {bill.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                                            ₹{bill.total_price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewBill(bill)}
                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(bill.id)}
                                                    className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bill Details Modal */}
            {showModal && selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className={`${colors.card} border ${colors.border} rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300`}>
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Bill Details</h3>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">Invoice: #{selectedBill.id.toUpperCase()}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-700/30">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Billing Details</p>
                                    <p className="text-sm text-gray-300"><span className="text-gray-500">Date:</span> {new Date(selectedBill.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Payment:</span> {selectedBill.payment_method?.toUpperCase() || 'CASH'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Customer</p>
                                    <p className="text-sm text-white font-medium">{selectedBill.customer_name || 'Guest Customer'}</p>
                                    {selectedBill.customer_phone && <p className="text-xs text-gray-400 mt-1">{selectedBill.customer_phone}</p>}
                                </div>
                            </div>

                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase">
                                        <th className="text-left font-semibold pb-3">Item</th>
                                        <th className="text-center font-semibold pb-3">Qty</th>
                                        <th className="text-right font-semibold pb-3">Price</th>
                                        <th className="text-right font-semibold pb-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/30">
                                    {selectedBill.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="py-3 text-sm text-gray-300">{item.name}</td>
                                            <td className="py-3 text-sm text-gray-300 text-center">{item.quantity}</td>
                                            <td className="py-3 text-sm text-gray-300 text-right">₹{item.price}</td>
                                            <td className="py-3 text-sm text-white text-right font-medium">₹{item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex flex-col items-end pt-6 border-t border-gray-700">
                                <div className="space-y-2 w-48">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-300 font-medium">₹{(selectedBill.total_price / (1 - (selectedBill.discount || 0)/100)).toFixed(0)}</span>
                                    </div>
                                    {selectedBill.discount > 0 && (
                                        <div className="flex justify-between text-sm text-red-400">
                                            <span>Discount ({selectedBill.discount}%)</span>
                                            <span>-₹{((selectedBill.total_price / (1 - (selectedBill.discount || 0)/100)) * (selectedBill.discount / 100)).toFixed(0)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-800">
                                        <span className="text-white">Total</span>
                                        <span className="text-blue-500">₹{selectedBill.total_price?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-800/40 border-t border-gray-700 flex gap-3">
                            <button 
                                onClick={() => handleDownload(selectedBill.id)}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </button>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all border border-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillsHistory;
