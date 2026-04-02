import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import CreatePurchaseOrderModal from '../components/CreatePurchaseOrderModal';
import {
  getOrders,
  getPurchaseOrders,
  getSuppliers,
  updatePurchaseOrderStatus
} from '../services/api';

const SALES_PAGE_SIZE = 10;
const SALES_FETCH_LIMIT = 100;
const SALES_MAX_FETCH_PAGES = 10;
const PURCHASE_PAGE_SIZE = 10;
const PURCHASE_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrdersManagement = () => {
  const [activeView, setActiveView] = useState('sales');
  const [searchTerm, setSearchTerm] = useState('');

  const [salesOrders, setSalesOrders] = useState([]);
  const [salesPage, setSalesPage] = useState(1);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');
  const [purchasePagination, setPurchasePagination] = useState({
    page: 1,
    limit: PURCHASE_PAGE_SIZE,
    total_count: 0,
    total_pages: 1
  });

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showCreatePurchaseOrderModal, setShowCreatePurchaseOrderModal] = useState(false);

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

  const getPurchaseStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'processing':
        return 'text-blue-400 bg-blue-900/30';
      case 'shipped':
        return 'text-cyan-400 bg-cyan-900/30';
      case 'delivered':
        return 'text-green-400 bg-green-900/30';
      case 'cancelled':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const loadSuppliers = async () => {
    try {
      const result = await getSuppliers(1, 100);
      setSuppliers(Array.isArray(result?.suppliers) ? result.suppliers : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  const loadSalesOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedOrders = [];
      let page = 1;

      while (page <= SALES_MAX_FETCH_PAGES) {
        const chunk = await getOrders(page, SALES_FETCH_LIMIT);
        const chunkList = Array.isArray(chunk) ? chunk : [];
        loadedOrders.push(...chunkList);

        if (chunkList.length < SALES_FETCH_LIMIT) {
          break;
        }

        page += 1;
      }

      setSalesOrders(loadedOrders);
    } catch (err) {
      setError(normalizeError(err, 'Failed to load sales orders'));
      setSalesOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async (page = purchasePage, status = purchaseStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPurchaseOrders(page, PURCHASE_PAGE_SIZE, {
        status
      });

      setPurchaseOrders(Array.isArray(result?.purchase_orders) ? result.purchase_orders : []);
      setPurchasePagination({
        page: Number(result?.page || page),
        limit: Number(result?.limit || PURCHASE_PAGE_SIZE),
        total_count: Number(result?.total_count || 0),
        total_pages: Number(result?.total_pages || 1)
      });
    } catch (err) {
      setError(normalizeError(err, 'Failed to load purchase orders'));
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (activeView === 'sales') {
      loadSalesOrders();
    } else {
      loadPurchaseOrders(purchasePage, purchaseStatusFilter);
    }
  }, [activeView, purchasePage, purchaseStatusFilter]);

  const filteredSalesOrders = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return salesOrders;

    return salesOrders.filter((order) => {
      const idText = String(order.id || '').toLowerCase();
      const customerText = String(order.customer_id || '').toLowerCase();
      const userText = String(order.user_id || '').toLowerCase();
      const paymentText = String(order.payment_method || '').toLowerCase();
      return (
        idText.includes(needle) ||
        customerText.includes(needle) ||
        userText.includes(needle) ||
        paymentText.includes(needle)
      );
    });
  }, [salesOrders, searchTerm]);

  const salesTotalPages = Math.max(1, Math.ceil(filteredSalesOrders.length / SALES_PAGE_SIZE));
  const salesStartIndex = (salesPage - 1) * SALES_PAGE_SIZE;
  const salesCurrentOrders = filteredSalesOrders.slice(salesStartIndex, salesStartIndex + SALES_PAGE_SIZE);

  const filteredPurchaseOrders = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return purchaseOrders;

    return purchaseOrders.filter((order) => {
      const orderNumber = String(order.order_number || '').toLowerCase();
      const supplierName = String(order.supplier_name || '').toLowerCase();
      const status = String(order.status || '').toLowerCase();
      return orderNumber.includes(needle) || supplierName.includes(needle) || status.includes(needle);
    });
  }, [purchaseOrders, searchTerm]);

  useEffect(() => {
    if (salesPage > salesTotalPages) {
      setSalesPage(1);
    }
  }, [salesTotalPages, salesPage]);

  const salesTotalValue = salesOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
  const salesAvgValue = salesOrders.length ? salesTotalValue / salesOrders.length : 0;

  const purchaseTotalValue = purchaseOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const purchaseAvgValue = purchaseOrders.length ? purchaseTotalValue / purchaseOrders.length : 0;
  const purchaseActiveCount = purchaseOrders.filter((order) => {
    const status = String(order.status || '').toLowerCase();
    return status === 'pending' || status === 'processing' || status === 'shipped';
  }).length;
  const purchaseDelayedCount = purchaseOrders.filter((order) => {
    const status = String(order.status || '').toLowerCase();
    if (status === 'delivered' || status === 'cancelled') return false;
    if (!order.expected_delivery_date) return false;
    const expected = new Date(order.expected_delivery_date);
    return !Number.isNaN(expected.getTime()) && expected.getTime() < Date.now();
  }).length;

  const openCreatePurchaseOrder = () => {
    if (!suppliers.length) {
      alert('No suppliers found. Please add a supplier first.');
      return;
    }
    setSelectedSupplierId(suppliers[0].id);
    setShowSupplierPicker(true);
  };

  const confirmSupplierSelection = () => {
    const supplier = suppliers.find((item) => item.id === selectedSupplierId);
    if (!supplier) {
      alert('Please select a supplier');
      return;
    }

    setSelectedSupplier(supplier);
    setShowSupplierPicker(false);
    setShowCreatePurchaseOrderModal(true);
  };

  const handlePurchaseOrderCreated = async () => {
    setActiveView('purchase');
    setPurchasePage(1);
    await loadPurchaseOrders(1, purchaseStatusFilter);
  };

  const handleStatusUpdate = async (purchaseOrderId, nextStatus) => {
    if (!purchaseOrderId) return;

    setUpdatingStatusId(purchaseOrderId);
    try {
      const updated = await updatePurchaseOrderStatus(purchaseOrderId, nextStatus);

      setPurchaseOrders((prev) => prev.map((order) => (
        order.id === purchaseOrderId ? { ...order, ...updated } : order
      )));

      if (selectedOrderType === 'purchase' && selectedOrder?.id === purchaseOrderId) {
        setSelectedOrder((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      alert(normalizeError(err, 'Failed to update purchase-order status'));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const renderSalesTable = () => {
    if (loading) {
      return <div className="p-6 text-gray-400">Loading sales orders...</div>;
    }

    if (error) {
      return <div className="p-6 text-red-400">{error}</div>;
    }

    if (salesCurrentOrders.length === 0) {
      return <div className="p-6 text-gray-400">No sales orders found.</div>;
    }

    return (
      <>
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {salesCurrentOrders.map((order) => {
                const itemsCount = Array.isArray(order.items)
                  ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                  : 0;

                return (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setSelectedOrderType('sales');
                    }}
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-white font-medium">#{String(order.id).slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {order.customer_id ? `Customer ${String(order.customer_id).slice(-6)}` : 'Walk-in'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{String(order.user_id || 'N/A').slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 uppercase">{order.payment_method || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{formatCurrency(order.total_price)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{itemsCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {filteredSalesOrders.length === 0 ? 0 : salesStartIndex + 1}
            {' '}to {Math.min(salesStartIndex + SALES_PAGE_SIZE, filteredSalesOrders.length)}
            {' '}of {filteredSalesOrders.length} sales orders
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSalesPage((prev) => Math.max(1, prev - 1))}
              disabled={salesPage === 1}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(salesTotalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setSalesPage(page)}
                  className={`px-3 py-1 rounded ${
                    salesPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setSalesPage((prev) => Math.min(salesTotalPages, prev + 1))}
              disabled={salesPage === salesTotalPages}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderPurchaseTable = () => {
    if (loading) {
      return <div className="p-6 text-gray-400">Loading purchase orders...</div>;
    }

    if (error) {
      return <div className="p-6 text-red-400">{error}</div>;
    }

    if (filteredPurchaseOrders.length === 0) {
      return <div className="p-6 text-gray-400">No purchase orders found for this filter.</div>;
    }

    return (
      <>
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expected Delivery</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPurchaseOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setSelectedOrderType('purchase');
                  }}
                  className="hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-white font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{order.supplier_name || 'Unknown Supplier'}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatDate(order.order_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatDate(order.expected_delivery_date)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPurchaseStatusColor(order.status)}`}>
                      {(order.status || 'unknown').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(event) => handleStatusUpdate(order.id, event.target.value)}
                        disabled={updatingStatusId === order.id}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                      >
                        {PURCHASE_STATUSES.map((status) => (
                          <option key={status} value={status}>{status.toUpperCase()}</option>
                        ))}
                      </select>
                      {updatingStatusId === order.id && (
                        <span className="text-xs text-gray-400">Updating...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing page {purchasePagination.page} of {Math.max(1, purchasePagination.total_pages)}
            {' '}({purchasePagination.total_count} total purchase orders)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPurchasePage((prev) => Math.max(1, prev - 1))}
              disabled={purchasePagination.page <= 1}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(Math.max(1, purchasePagination.total_pages))].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setPurchasePage(page)}
                  className={`px-3 py-1 rounded ${
                    purchasePagination.page === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setPurchasePage((prev) => Math.min(Math.max(1, purchasePagination.total_pages), prev + 1))}
              disabled={purchasePagination.page >= Math.max(1, purchasePagination.total_pages)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout role="owner" pageTitle="Orders Management">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Orders Management</h1>
        <p className="text-gray-400">Track customer sales orders and supplier purchase-order lifecycle in one place</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                {activeView === 'sales' ? 'SALES ORDERS' : 'ACTIVE PURCHASE ORDERS'}
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {activeView === 'sales' ? salesOrders.length : purchaseActiveCount}
              </p>
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
              <p className="text-2xl font-bold text-gray-100">
                {activeView === 'sales' ? formatCurrency(salesTotalValue) : formatCurrency(purchaseTotalValue)}
              </p>
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
              <p className="text-2xl font-bold text-gray-100">
                {activeView === 'sales' ? formatCurrency(salesAvgValue) : formatCurrency(purchaseAvgValue)}
              </p>
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
              <p className="text-sm font-medium text-gray-400 mb-1">
                {activeView === 'sales' ? 'LINKED CUSTOMERS' : 'DELAYED PURCHASE ORDERS'}
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {activeView === 'sales'
                  ? salesOrders.filter((order) => Boolean(order.customer_id)).length
                  : purchaseDelayedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setActiveView('sales');
                    setSelectedOrder(null);
                    setSelectedOrderType(null);
                  }}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeView === 'sales'
                      ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Sales Orders
                </button>
                <button
                  onClick={() => {
                    setActiveView('purchase');
                    setSelectedOrder(null);
                    setSelectedOrderType(null);
                  }}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeView === 'purchase'
                      ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Purchase Orders
                </button>
              </div>

              {activeView === 'purchase' && (
                <button
                  onClick={openCreatePurchaseOrder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Purchase Order
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={`Search ${activeView === 'sales' ? 'sales' : 'purchase'} orders...`}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  if (activeView === 'sales') {
                    setSalesPage(1);
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />

              {activeView === 'purchase' && (
                <select
                  value={purchaseStatusFilter}
                  onChange={(event) => {
                    setPurchaseStatusFilter(event.target.value);
                    setPurchasePage(1);
                  }}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="all">All Statuses</option>
                  {PURCHASE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status.toUpperCase()}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {activeView === 'sales' ? renderSalesTable() : renderPurchaseTable()}
        </div>

        {selectedOrder && (
          <div className="w-full lg:w-96 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Order Details</h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedOrderType(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedOrderType === 'sales' ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Order ID</span>
                    <span className="text-white text-sm font-medium">#{String(selectedOrder.id).slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Date</span>
                    <span className="text-white text-sm">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Payment</span>
                    <span className="text-white text-sm uppercase">{selectedOrder.payment_method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Employee</span>
                    <span className="text-white text-sm">{String(selectedOrder.user_id || 'N/A').slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Customer</span>
                    <span className="text-white text-sm">
                      {selectedOrder.customer_id ? `Customer ${String(selectedOrder.customer_id).slice(-6)}` : 'Walk-in'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">TOTAL</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(selectedOrder.total_price)}</span>
                  </div>
                  {selectedOrder.discount ? (
                    <div className="text-xs text-green-400 mt-1">Discount: {selectedOrder.discount}%</div>
                  ) : null}
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-3">ORDER ITEMS</h5>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(selectedOrder.items || []).map((item, index) => (
                      <div key={`${item.product_id || index}-${index}`} className="bg-gray-700 rounded-lg p-3 flex justify-between">
                        <div>
                          <div className="text-sm text-white">{item.name || 'Product'}</div>
                          <div className="text-xs text-gray-400">Qty: {item.quantity || 0}</div>
                        </div>
                        <div className="text-sm text-white font-medium">{formatCurrency(item.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">PO Number</span>
                    <span className="text-white text-sm font-medium">{selectedOrder.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Supplier</span>
                    <span className="text-white text-sm">{selectedOrder.supplier_name || 'Unknown Supplier'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Order Date</span>
                    <span className="text-white text-sm">{formatDate(selectedOrder.order_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Expected Delivery</span>
                    <span className="text-white text-sm">{formatDate(selectedOrder.expected_delivery_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPurchaseStatusColor(selectedOrder.status)}`}>
                      {(selectedOrder.status || 'unknown').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">TOTAL</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-400 mb-3">ORDER ITEMS</h5>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(selectedOrder.items || []).map((item, index) => (
                      <div key={`${item.product_id || index}-${index}`} className="bg-gray-700 rounded-lg p-3 flex justify-between">
                        <div>
                          <div className="text-sm text-white">{item.product_name || 'Product'}</div>
                          <div className="text-xs text-gray-400">Qty: {item.quantity || 0}</div>
                        </div>
                        <div className="text-sm text-white font-medium">{formatCurrency(item.total_price)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">Update Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(event) => handleStatusUpdate(selectedOrder.id, event.target.value)}
                    disabled={updatingStatusId === selectedOrder.id}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    {PURCHASE_STATUSES.map((status) => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showSupplierPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Choose Supplier</h2>
            <p className="text-sm text-gray-400 mb-4">Select a supplier for the new purchase order.</p>

            <select
              value={selectedSupplierId}
              onChange={(event) => setSelectedSupplierId(event.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-6"
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSupplierPicker(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmSupplierSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <CreatePurchaseOrderModal
        isOpen={showCreatePurchaseOrderModal}
        onClose={() => setShowCreatePurchaseOrderModal(false)}
        supplierId={selectedSupplier?.id}
        supplierName={selectedSupplier?.name}
        onSuccess={handlePurchaseOrderCreated}
      />
    </DashboardLayout>
  );
};

export default OrdersManagement;
