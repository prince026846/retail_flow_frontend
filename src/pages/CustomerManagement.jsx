import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { createCustomer } from '../services/api';

const CustomerManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  
  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle customer creation
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreatingCustomer(true);
    
    try {
      const createdCustomer = await createCustomer(newCustomer);
      console.log('Customer created successfully:', createdCustomer);
      
      // Reset form and close modal
      setNewCustomer({ name: '', email: '', phone: '' });
      setShowAddCustomerModal(false);
      
      // Show success message
      alert('Customer created successfully!');
      
      // Optionally refresh customer list or update state
    } catch (error) {
      console.error('Error creating customer:', error);
      if (error.message === "Authentication required") {
        alert('Please login first');
      } else {
        alert('Failed to create customer. Please try again.');
      }
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const customers = [
    {
      id: 1,
      name: 'Julianne Devis',
      phone: '+1 234-567-8900',
      totalPurchases: 42,
      lastPurchase: '2024-03-20',
      status: 'VIP',
      email: 'julianne.devis@email.com',
      memberSince: '2020',
      totalSpend: '$8,450.00',
      avgOrder: '$201.19',
      frequency: '3.5 / mo',
      recentPurchases: [
        { name: 'Premium Headphones X', price: '$299.99', date: '2024-03-20' },
        { name: 'Smart Watch Pro', price: '$449.99', date: '2024-03-15' },
        { name: 'Wireless Charger', price: '$39.99', date: '2024-03-10' }
      ]
    },
    {
      id: 2,
      name: 'Marcus Kinsley',
      phone: '+1 234-567-8901',
      totalPurchases: 18,
      lastPurchase: '2024-03-18',
      status: 'Regular',
      email: 'marcus.kinsley@email.com',
      memberSince: '2021',
      totalSpend: '$3,240.00',
      avgOrder: '$180.00',
      frequency: '1.2 / mo',
      recentPurchases: [
        { name: 'Laptop Stand', price: '$79.99', date: '2024-03-18' },
        { name: 'USB-C Hub', price: '$59.99', date: '2024-03-12' },
        { name: 'Mouse Pad', price: '$24.99', date: '2024-03-05' }
      ]
    },
    {
      id: 3,
      name: 'Eleanor Hyland',
      phone: '+1 234-567-8902',
      totalPurchases: 124,
      lastPurchase: '2024-03-22',
      status: 'Platinum',
      email: 'eleanor.hyland@email.com',
      memberSince: '2021',
      totalSpend: '$14,290.45',
      avgOrder: '$342.00',
      frequency: '2.4 / mo',
      recentPurchases: [
        { name: 'Lumina OLED Tablet', price: '$899.99', date: '2024-03-22' },
        { name: 'Precision Chrono X', price: '$1,299.99', date: '2024-03-20' },
        { name: 'Aura Buds Pro', price: '$249.99', date: '2024-03-18' }
      ]
    },
    {
      id: 4,
      name: 'Tobias Rohn',
      phone: '+1 234-567-8903',
      totalPurchases: 4,
      lastPurchase: '2024-03-10',
      status: 'New',
      email: 'tobias.rohn@email.com',
      memberSince: '2024',
      totalSpend: '$456.00',
      avgOrder: '$114.00',
      frequency: '0.8 / mo',
      recentPurchases: [
        { name: 'Phone Case', price: '$29.99', date: '2024-03-10' },
        { name: 'Screen Protector', price: '$19.99', date: '2024-03-08' }
      ]
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    if (activeTab === 'all') return true;
    if (activeTab === 'premium') return customer.status === 'VIP' || customer.status === 'Platinum';
    if (activeTab === 'new') return customer.status === 'New';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Platinum': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout role="owner" pageTitle="Customer Management">
      <div className="space-y-6">
        {/* Page Description */}
        <div className="mb-6">
          <p className="text-gray-400">Manage and analyze your customer base efficiently</p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Customers
                </button>
                <button
                  onClick={() => setActiveTab('premium')}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'premium'
                      ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Premium
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'new'
                      ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  New
                </button>
              </div>
              
              <div className="flex gap-2">
                <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Customer
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="data-table overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NAME</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PHONE</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TOTAL PURCHASES</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LAST PURCHASE</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold mr-2 lg:mr-3 text-xs lg:text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{customer.name}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                              {customer.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-300">{customer.phone}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-300">{customer.totalPurchases}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-300">{customer.lastPurchase}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-400">
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
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-400">
                Page 1 of 142
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">2</button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">3</button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">Next</button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Customer Details */}
          {selectedCustomer && (
            <div className="w-full lg:w-96 bg-gray-800 rounded-lg p-4 lg:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Customer Details</h3>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Customer Profile */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xl lg:text-2xl mx-auto mb-4">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="text-base lg:text-lg font-semibold text-white mb-1">{selectedCustomer.name}</h4>
                <p className="text-sm text-gray-400">{selectedCustomer.status} Member since {selectedCustomer.memberSince}</p>
              </div>

              {/* Contact Actions */}
              <div className="flex justify-center space-x-4 mb-8">
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-8">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">TOTAL LIFETIME SPEND</span>
                    <span className="text-green-400 text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      12%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedCustomer.totalSpend}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-xs mb-1">AVG. ORDER</div>
                    <div className="text-lg font-semibold text-white">{selectedCustomer.avgOrder}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-xs mb-1">FREQUENCY</div>
                    <div className="text-lg font-semibold text-white">{selectedCustomer.frequency}</div>
                  </div>
                </div>
              </div>

              {/* Recent Purchases */}
              <div className="mb-8">
                <h5 className="text-sm font-medium text-gray-400 mb-4">RECENT PURCHASES</h5>
                <div className="space-y-3">
                  {selectedCustomer.recentPurchases.map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">{purchase.name}</div>
                        <div className="text-xs text-gray-400">{purchase.date}</div>
                      </div>
                      <div className="text-sm font-medium text-white">{purchase.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Report Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Generate AI Engagement Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Overlay */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Add New Customer</h2>
              <button 
                onClick={() => setShowAddCustomerModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                {/* Assign Portfolio Tier Link */}
                <div className="pt-2">
                  <button 
                    type="button"
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Assign Portfolio Tier
                  </button>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(false)}
                    className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCustomer}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCustomer ? 'Creating...' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerManagement;
