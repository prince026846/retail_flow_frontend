import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import CreatePurchaseOrderOverlay from '../components/CreatePurchaseOrderOverlay';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      supplierName: 'Global Tech Solutions',
      orderDate: '2024-03-22',
      expectedDelivery: '2024-03-26',
      status: 'Processing',
      items: 15,
      totalAmount: '$12,450.00',
      priority: 'High',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-123456789',
      orderItems: [
        { name: 'Laptop Components', quantity: 10, price: '$850.00' },
        { name: 'Smartphone Parts', quantity: 5, price: '$450.00' }
      ]
    },
    {
      id: 'ORD-002',
      supplierName: 'Premium Materials Inc',
      orderDate: '2024-03-21',
      expectedDelivery: '2024-03-25',
      status: 'Shipped',
      items: 8,
      totalAmount: '$8,320.00',
      priority: 'Medium',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-987654321',
      orderItems: [
        { name: 'Raw Materials A', quantity: 4, price: '$1,200.00' },
        { name: 'Raw Materials B', quantity: 4, price: '$880.00' }
      ]
    },
    {
      id: 'ORD-003',
      supplierName: 'QuickShip Logistics',
      orderDate: '2024-03-20',
      expectedDelivery: '2024-03-24',
      status: 'Delivered',
      items: 25,
      totalAmount: '$15,750.00',
      priority: 'Low',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-456789123',
      orderItems: [
        { name: 'Packaging Boxes', quantity: 20, price: '$50.00' },
        { name: 'Shipping Labels', quantity: 5, price: '$150.00' }
      ]
    },
    {
      id: 'ORD-004',
      supplierName: 'Quality Parts Co',
      orderDate: '2024-03-19',
      expectedDelivery: '2024-03-23',
      status: 'Delayed',
      items: 12,
      totalAmount: '$9,600.00',
      priority: 'High',
      paymentStatus: 'Pending',
      trackingNumber: 'TRK-789123456',
      orderItems: [
        { name: 'Manufacturing Parts', quantity: 12, price: '$800.00' }
      ]
    },
    {
      id: 'ORD-005',
      supplierName: 'Smart Supply Ltd',
      orderDate: '2024-03-18',
      expectedDelivery: '2024-03-22',
      status: 'Processing',
      items: 18,
      totalAmount: '$11,340.00',
      priority: 'Medium',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-321654987',
      orderItems: [
        { name: 'Electronic Components', quantity: 10, price: '$650.00' },
        { name: 'Circuit Boards', quantity: 8, price: '$680.00' }
      ]
    },
    {
      id: 'ORD-006',
      supplierName: 'Industrial Supplies',
      orderDate: '2024-03-17',
      expectedDelivery: '2024-03-21',
      status: 'Processing',
      items: 6,
      totalAmount: '$7,200.00',
      priority: 'Low',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-654987321',
      orderItems: [
        { name: 'Industrial Tools', quantity: 6, price: '$1,200.00' }
      ]
    },
    {
      id: 'ORD-007',
      supplierName: 'Tech Components',
      orderDate: '2024-03-16',
      expectedDelivery: '2024-03-20',
      status: 'Shipped',
      items: 14,
      totalAmount: '$10,500.00',
      priority: 'Medium',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-147258369',
      orderItems: [
        { name: 'Tech Accessories', quantity: 14, price: '$750.00' }
      ]
    },
    {
      id: 'ORD-008',
      supplierName: 'Global Packaging',
      orderDate: '2024-03-15',
      expectedDelivery: '2024-03-19',
      status: 'Delivered',
      items: 30,
      totalAmount: '$18,900.00',
      priority: 'High',
      paymentStatus: 'Paid',
      trackingNumber: 'TRK-963852741',
      orderItems: [
        { name: 'Custom Packaging', quantity: 15, price: '$800.00' },
        { name: 'Standard Boxes', quantity: 15, price: '$460.00' }
      ]
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateOrderOverlay, setShowCreateOrderOverlay] = useState(false);
  const itemsPerPage = 10;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing':
        return 'text-blue-400 bg-blue-900/30';
      case 'Shipped':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'Delivered':
        return 'text-green-400 bg-green-900/30';
      case 'Delayed':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return 'text-red-400 bg-red-900/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'Low':
        return 'text-green-400 bg-green-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'Paid':
        return 'text-green-400 bg-green-900/30';
      case 'Pending':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'Overdue':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'processing') return order.status === 'Processing' && matchesSearch;
    if (activeTab === 'shipped') return order.status === 'Shipped' && matchesSearch;
    if (activeTab === 'delivered') return order.status === 'Delivered' && matchesSearch;
    if (activeTab === 'delayed') return order.status === 'Delayed' && matchesSearch;
    if (activeTab === 'high-priority') return order.priority === 'High' && matchesSearch;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const totalValue = orders.reduce((sum, order) => {
    return sum + parseFloat(order.totalAmount.replace(/[$,]/g, ''));
  }, 0);

  const avgOrderValue = totalValue / orders.length;

  const handleCreateOrder = (newOrder) => {
    const orderId = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
    const order = {
      id: orderId,
      supplierName: newOrder.supplier === 'global-tech' ? 'Global Tech Solutions' : 
                   newOrder.supplier === 'premium-materials' ? 'Premium Materials Inc' :
                   newOrder.supplier === 'quickship' ? 'QuickShip Logistics' :
                   newOrder.supplier === 'quality-parts' ? 'Quality Parts Co' :
                   newOrder.supplier === 'smart-supply' ? 'Smart Supply Ltd' : 'Unknown Supplier',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Processing',
      items: newOrder.products.reduce((sum, product) => sum + product.quantity, 0),
      totalAmount: `$${newOrder.products.reduce((sum, product) => sum + product.subtotal, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      priority: 'Medium',
      paymentStatus: 'Pending',
      trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderItems: newOrder.products.map(product => ({
        name: product.productName,
        quantity: product.quantity,
        price: `$${product.unitCost.toFixed(2)}`
      }))
    };
    setOrders([order, ...orders]);
  };

  return (
    <DashboardLayout role="owner" pageTitle="Orders Management">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Supply Chain Orders</h1>
        <p className="text-gray-400">Track and manage supplier orders and procurement activities</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">ACTIVE ORDERS</p>
              <p className="text-2xl font-bold text-gray-100">{orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}</p>
              <p className="text-xs text-blue-400 mt-1">3 shipments today</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">TOTAL VALUE</p>
              <p className="text-2xl font-bold text-gray-100">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-green-400 mt-1">↑ 8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">AVG ORDER VALUE</p>
              <p className="text-2xl font-bold text-gray-100">${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-yellow-400 mt-1">→ Same as last week</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">DELAYED ORDERS</p>
              <p className="text-2xl font-bold text-gray-100">{orders.filter(o => o.status === 'Delayed').length}</p>
              <p className="text-xs text-red-400 mt-1">Requires attention</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs and Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveTab('processing')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'processing'
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => setActiveTab('shipped')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'shipped'
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Shipped
              </button>
              <button
                onClick={() => setActiveTab('delivered')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'delivered'
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Delivered
              </button>
              <button
                onClick={() => setActiveTab('delayed')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'delayed'
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Delayed
              </button>
              <button
                onClick={() => setActiveTab('high-priority')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'high-priority'
                    ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                High Priority
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" onClick={() => setShowCreateOrderOverlay(true)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Order
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ORDER ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SUPPLIER</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PRIORITY</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TOTAL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{order.id}</div>
                      <div className="text-xs text-gray-400">{order.items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{order.orderDate}</div>
                      <div className="text-xs text-gray-400">Due: {order.expectedDelivery}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.totalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Order Details */}
        {selectedOrder && (
          <div className="w-96 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Order Details</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{selectedOrder.id}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Supplier:</span>
                  <span className="text-white text-sm">{selectedOrder.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Order Date:</span>
                  <span className="text-white text-sm">{selectedOrder.orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Expected Delivery:</span>
                  <span className="text-white text-sm">{selectedOrder.expectedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">PRIORITY</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                  {selectedOrder.priority}
                </span>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">PAYMENT</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Order Value */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">TOTAL ORDER VALUE</span>
                <span className="text-green-400 text-xs font-medium flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Confirmed
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{selectedOrder.totalAmount}</div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-400 mb-4">ORDER ITEMS</h5>
              <div className="space-y-3">
                {selectedOrder.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <div>
                      <div className="text-sm text-white">{item.name}</div>
                      <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-medium text-white">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-400 mb-2">TRACKING</h5>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{selectedOrder.trackingNumber}</span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Track</button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Contact Supplier
              </button>
              <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors">
                Download Invoice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Purchase Order Overlay */}
      <CreatePurchaseOrderOverlay
        isOpen={showCreateOrderOverlay}
        onClose={() => setShowCreateOrderOverlay(false)}
        onCreateOrder={handleCreateOrder}
      />
    </DashboardLayout>
  );
};

export default OrdersManagement;
