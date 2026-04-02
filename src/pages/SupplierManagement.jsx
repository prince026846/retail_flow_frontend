import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import AddSupplierModal from '../components/AddSupplierModal';
import SupplierPerformanceModal from '../components/SupplierPerformanceModal';
import CreatePurchaseOrderModal from '../components/CreatePurchaseOrderModal';
import LowStockSuppliers from '../components/LowStockSuppliers';
import { 
  getSuppliers, 
  createSupplier, 
  deleteSupplier,
  getLowStockSuppliers 
} from '../services/api';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [purchaseOrderModalOpen, setPurchaseOrderModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const itemsPerPage = 5;
  const [pagination, setPagination] = useState({
    page: 1,
    limit: itemsPerPage,
    totalCount: 0,
    totalPages: 1
  });

  const categories = ['All Categories', 'Electronics', 'Raw Materials', 'Logistics', 'Manufacturing', 'Industrial', 'Packaging'];

  // Fetch suppliers from backend
  useEffect(() => {
    fetchSuppliers();
    fetchLowStockCount();
  }, [currentPage]);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuppliers(currentPage, itemsPerPage);
      setSuppliers(data.suppliers);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to fetch suppliers');
      console.error('Suppliers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockCount = async () => {
    try {
      const data = await getLowStockSuppliers();
      setLowStockCount(data.length);
    } catch (err) {
      console.error('Low stock count error:', err);
    }
  };

  const filteredSuppliers = selectedCategory === 'All Categories' 
    ? suppliers 
    : suppliers.filter(supplier => supplier.category === selectedCategory);

  // Backend already applies pagination; avoid slicing again on frontend.
  const currentSuppliers = filteredSuppliers;
  const totalPages = selectedCategory === 'All Categories'
    ? Math.max(1, pagination.totalPages)
    : 1;
  const startIndex = filteredSuppliers.length > 0
    ? (selectedCategory === 'All Categories' ? (currentPage - 1) * itemsPerPage + 1 : 1)
    : 0;
  const endIndex = selectedCategory === 'All Categories'
    ? (startIndex === 0 ? 0 : startIndex + filteredSuppliers.length - 1)
    : filteredSuppliers.length;
  const totalResults = selectedCategory === 'All Categories'
    ? pagination.totalCount
    : filteredSuppliers.length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'On Time':
        return 'text-green-400 bg-green-900/30';
      case 'Delayed':
        return 'text-red-400 bg-red-900/30';
      case 'Processing':
        return 'text-yellow-400 bg-yellow-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSupplier = async (newSupplierData) => {
    try {
      const supplierData = {
        name: newSupplierData.supplierName,
        email: newSupplierData.emailAddress,
        phone: newSupplierData.phoneNumber,
        address: newSupplierData.address
      };
      
      await createSupplier(supplierData);
      await fetchSuppliers(); // Refresh the list
      handleCloseModal();
    } catch (err) {
      setError('Failed to create supplier');
      console.error('Create supplier error:', err);
    }
  };

  const handleViewPerformance = (supplier) => {
    setSelectedSupplier(supplier);
    setPerformanceModalOpen(true);
  };

  const handleCreatePurchaseOrder = (supplier) => {
    setSelectedSupplier(supplier);
    setPurchaseOrderModalOpen(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(supplierId);
        await fetchSuppliers(); // Refresh the list
      } catch (err) {
        setError('Failed to delete supplier');
        console.error('Delete supplier error:', err);
      }
    }
  };

  return (
    <DashboardLayout role="owner" pageTitle="Supplier Management">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Supplier Intelligence</h1>
        <p className="text-gray-400">Comprehensive overview of supplier performance and procurement metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">TOTAL SUPPLIERS</p>
              <p className="text-2xl font-bold text-gray-100">{suppliers.length}</p>
              <p className="text-xs text-green-400 mt-1">Active partnerships</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">LOW STOCK ALERTS</p>
              <p className="text-2xl font-bold text-gray-100">{lowStockCount}</p>
              <p className="text-xs text-red-400 mt-1">Need attention</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">AVG LEAD TIME</p>
              <p className="text-2xl font-bold text-gray-100">4.2 days</p>
              <p className="text-xs text-green-400 mt-1">↓ 12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">QUALITY RATING</p>
              <p className="text-2xl font-bold text-gray-100">4.7/5.0</p>
              <p className="text-xs text-green-400 mt-1">↑ 0.2 from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>{lowStockCount}</strong> suppliers have products that need restocking
              </span>
            </div>
            <button
              onClick={() => setShowLowStock(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Toggle View */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setShowLowStock(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !showLowStock 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Suppliers
          </button>
          <button
            onClick={() => setShowLowStock(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              showLowStock 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Low Stock Alert ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showLowStock ? (
        <LowStockSuppliers />
      ) : (
        <div className="data-table">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-100">Active Procurement Directory</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input px-4 py-2 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button className="btn btn-primary text-sm px-4 py-2">
                  Download Report
                </button>
                <button className="btn btn-primary text-sm px-4 py-2 bg-green-600 hover:bg-green-700" onClick={handleOpenModal}>
                  Add New Supplier
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supplier Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-red-400">
                      {error}
                    </td>
                  </tr>
                ) : currentSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  currentSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {supplier.address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {supplier.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {supplier.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewPerformance(supplier)}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Performance
                          </button>
                          <button 
                            onClick={() => handleCreatePurchaseOrder(supplier)}
                            className="text-green-400 hover:text-green-300 font-medium"
                          >
                            Order
                          </button>
                          <button 
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="text-red-400 hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {startIndex} to {endIndex} of {totalResults} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-600 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSupplier}
      />

      {selectedSupplier && (
        <SupplierPerformanceModal
          isOpen={performanceModalOpen}
          onClose={() => setPerformanceModalOpen(false)}
          supplierId={selectedSupplier.id}
          supplierName={selectedSupplier.name}
        />
      )}

      {selectedSupplier && (
        <CreatePurchaseOrderModal
          isOpen={purchaseOrderModalOpen}
          onClose={() => setPurchaseOrderModalOpen(false)}
          supplierId={selectedSupplier.id}
          supplierName={selectedSupplier.name}
        />
      )}
    </DashboardLayout>
  );
};

export default SupplierManagement;
