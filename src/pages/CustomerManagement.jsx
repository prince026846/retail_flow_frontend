import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomerOrders,
  getCustomers,
  searchCustomers,
  updateCustomer
} from '../services/api';

const PAGE_SIZE = 10;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total_count: 0,
    total_pages: 1
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [editCustomer, setEditCustomer] = useState({
    id: '',
    name: '',
    email: '',
    phone: ''
  });

  const normalizeError = (err, fallback) => {
    if (err && typeof err.message === 'string' && err.message.trim()) {
      return err.message;
    }
    return fallback;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(amount || 0));
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCustomerTier = (customer) => {
    const totalSpent = Number(customer?.total_spent || 0);
    const totalOrders = Number(customer?.total_orders || 0);

    if (totalSpent >= 50000 || totalOrders >= 100) return 'Platinum';
    if (totalSpent >= 10000 || totalOrders >= 25) return 'VIP';
    if (totalOrders <= 3) return 'New';
    return 'Regular';
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-blue-100 text-blue-800';
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'New':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isNewCustomer = (customer) => {
    const created = new Date(customer?.created_at || 0);
    if (Number.isNaN(created.getTime())) return false;
    const now = Date.now();
    return now - created.getTime() <= 30 * 24 * 60 * 60 * 1000;
  };

  const applyTabFilter = (customerList) => {
    switch (activeTab) {
      case 'premium':
        return customerList.filter((customer) => {
          const tier = getCustomerTier(customer);
          return tier === 'VIP' || tier === 'Platinum';
        });
      case 'new':
        return customerList.filter((customer) => isNewCustomer(customer));
      case 'inactive':
        return customerList.filter((customer) => customer.is_active === false);
      case 'all':
      default:
        return customerList.filter((customer) => customer.is_active !== false);
    }
  };

  const filteredCustomers = useMemo(() => applyTabFilter(customers), [customers, activeTab]);

  const totalPages = Math.max(1, Number(pagination.total_pages || 1));

  const fetchCustomersData = async (page = currentPage, query = searchQuery) => {
    setLoading(true);
    setError(null);

    try {
      if (query.trim()) {
        const result = await searchCustomers(query.trim(), page, PAGE_SIZE);
        const list = Array.isArray(result?.customers) ? result.customers : [];
        const totalCount = Number(result?.total_count || list.length);
        const derivedTotalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

        setCustomers(list);
        setPagination({
          page: Number(page || 1),
          limit: PAGE_SIZE,
          total_count: totalCount,
          total_pages: derivedTotalPages
        });
      } else {
        const result = await getCustomers(page, PAGE_SIZE);
        setCustomers(Array.isArray(result?.customers) ? result.customers : []);
        setPagination({
          page: Number(result?.page || page),
          limit: Number(result?.limit || PAGE_SIZE),
          total_count: Number(result?.total_count || 0),
          total_pages: Number(result?.total_pages || 1)
        });
      }
    } catch (err) {
      setError(normalizeError(err, 'Failed to load customers'));
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersData(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const fetchCustomerHistory = async (customerId) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const [detail, history] = await Promise.all([
        getCustomerById(customerId),
        getCustomerOrders(customerId)
      ]);

      setSelectedCustomer(detail);
      setCustomerHistory(history);
    } catch (err) {
      setHistoryError(normalizeError(err, 'Failed to load customer details'));
      setCustomerHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectCustomer = async (customer) => {
    if (!customer?.id) return;
    setSelectedCustomer(customer);
    await fetchCustomerHistory(customer.id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCustomerInputChange = (event, type = 'new') => {
    const { name, value } = event.target;
    if (type === 'new') {
      setNewCustomer((prev) => ({ ...prev, [name]: value }));
    } else {
      setEditCustomer((prev) => ({ ...prev, [name]: value }));
    }
  };

  const closeAddModal = () => {
    setShowAddCustomerModal(false);
    setNewCustomer({ name: '', email: '', phone: '' });
  };

  const closeEditModal = () => {
    setShowEditCustomerModal(false);
    setEditCustomer({ id: '', name: '', email: '', phone: '' });
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();

    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreatingCustomer(true);

    try {
      await createCustomer({
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim()
      });

      closeAddModal();
      setCurrentPage(1);
      if (searchQuery) {
        setSearchQuery('');
        setSearchInput('');
      } else {
        await fetchCustomersData(1, '');
      }
      alert('Customer created successfully');
    } catch (err) {
      alert(normalizeError(err, 'Failed to create customer'));
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!selectedCustomer) return;

    setEditCustomer({
      id: selectedCustomer.id,
      name: selectedCustomer.name || '',
      email: selectedCustomer.email || '',
      phone: selectedCustomer.phone || ''
    });
    setShowEditCustomerModal(true);
  };

  const handleUpdateCustomer = async (event) => {
    event.preventDefault();

    if (!editCustomer.id) {
      alert('No customer selected for update');
      return;
    }

    setIsUpdatingCustomer(true);

    try {
      await updateCustomer(editCustomer.id, {
        name: editCustomer.name.trim(),
        email: editCustomer.email.trim(),
        phone: editCustomer.phone.trim()
      });

      closeEditModal();
      await fetchCustomersData(currentPage, searchQuery);

      if (selectedCustomer?.id === editCustomer.id) {
        await fetchCustomerHistory(editCustomer.id);
      }

      alert('Customer updated successfully');
    } catch (err) {
      alert(normalizeError(err, 'Failed to update customer'));
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!customer?.id) return;

    const confirmed = window.confirm(`Delete customer "${customer.name}"? This will mark them inactive.`);
    if (!confirmed) return;

    setDeletingCustomerId(customer.id);

    try {
      await deleteCustomer(customer.id);

      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
        setCustomerHistory(null);
      }

      await fetchCustomersData(currentPage, searchQuery);
      alert('Customer deleted successfully');
    } catch (err) {
      alert(normalizeError(err, 'Failed to delete customer'));
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-400">
          Page {Math.min(currentPage, totalPages)} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-3 py-1 rounded ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="owner" pageTitle="Customer Management">
      <div className="space-y-6">
        <div className="mb-6">
          <p className="text-gray-400">Manage and analyze your customer base efficiently</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Customers' },
                  { key: 'premium', label: 'Premium' },
                  { key: 'new', label: 'New' },
                  { key: 'inactive', label: 'Inactive' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by name, email, or phone"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Search
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </form>

                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span>
                  <span>Add New Customer</span>
                </button>
              </div>
            </div>

            <div className="data-table overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-400">Loading customers...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-red-400">{error}</td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-400">No customers found</td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const tier = getCustomerTier(customer);
                      return (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm">
                                {(customer.name || '?').split(' ').map((item) => item[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{customer.name}</div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(tier)}`}>
                                  {tier}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.total_orders || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(customer.total_spent)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(customer.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedCustomer(customer);
                                  setEditCustomer({
                                    id: customer.id,
                                    name: customer.name || '',
                                    email: customer.email || '',
                                    phone: customer.phone || ''
                                  });
                                  setShowEditCustomerModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteCustomer(customer);
                                }}
                                disabled={deletingCustomerId === customer.id}
                                className="text-red-400 hover:text-red-300 disabled:opacity-50"
                              >
                                {deletingCustomerId === customer.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {renderPagination()}
          </div>

          {selectedCustomer && (
            <div className="w-full lg:w-96 bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Customer Details</h3>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerHistory(null);
                    setHistoryError(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {(selectedCustomer.name || '?').split(' ').map((item) => item[0]).join('').slice(0, 2)}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{selectedCustomer.name}</h4>
                <p className="text-sm text-gray-400">{selectedCustomer.email}</p>
                <p className="text-sm text-gray-400">{selectedCustomer.phone}</p>
                <span className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(getCustomerTier(selectedCustomer))}`}>
                  {getCustomerTier(selectedCustomer)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Orders</span>
                  <span className="text-white font-semibold">{customerHistory?.total_orders ?? selectedCustomer.total_orders ?? 0}</span>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Spent</span>
                  <span className="text-white font-semibold">{formatCurrency(customerHistory?.total_spent ?? selectedCustomer.total_spent)}</span>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Member Since</span>
                  <span className="text-white font-semibold">{formatDate(selectedCustomer.created_at)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-400 mb-3">ORDER HISTORY</h5>

                {historyLoading ? (
                  <div className="text-sm text-gray-400">Loading order history...</div>
                ) : historyError ? (
                  <div className="text-sm text-red-400">{historyError}</div>
                ) : !customerHistory?.orders?.length ? (
                  <div className="text-sm text-gray-400">No orders found for this customer.</div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {customerHistory.orders.map((order) => (
                      <div key={order.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium">#{String(order.id).slice(-8)}</span>
                          <span className="text-xs text-gray-300">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          {Array.isArray(order.items) && order.items.length > 0
                            ? `${order.items.length} item(s)`
                            : 'No items'}
                        </div>
                        <div className="text-sm font-semibold text-white">{formatCurrency(order.total_price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleOpenEditModal}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Edit Customer
                </button>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  disabled={deletingCustomerId === selectedCustomer.id}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletingCustomerId === selectedCustomer.id ? 'Deleting...' : 'Delete Customer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddCustomerModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Add New Customer</h2>
              <button onClick={closeAddModal} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newCustomer.name}
                    onChange={(event) => handleCustomerInputChange(event, 'new')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={(event) => handleCustomerInputChange(event, 'new')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newCustomer.email}
                    onChange={(event) => handleCustomerInputChange(event, 'new')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCustomer}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isCreatingCustomer ? 'Creating...' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditCustomerModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Edit Customer</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdateCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editCustomer.name}
                    onChange={(event) => handleCustomerInputChange(event, 'edit')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editCustomer.phone}
                    onChange={(event) => handleCustomerInputChange(event, 'edit')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editCustomer.email}
                    onChange={(event) => handleCustomerInputChange(event, 'edit')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCustomer}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdatingCustomer ? 'Saving...' : 'Save Changes'}
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
