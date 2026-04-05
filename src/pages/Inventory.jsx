import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import DataTable from "../components/DataTable";
import ProductModal from "../components/ProductModal";
import RealTimeNotification from "../components/RealTimeNotification";
import WebSocketStatus from "../components/WebSocketStatus";
import { useAppContext } from "../context/AppContext";
import { formatCurrency, isLowStock } from "../utils/helpers";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, wsConnected, user } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const handleAddProduct = () => {
    setModalMode("add");
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (modalMode === "add") {
        await addProduct(formData);
        setNotification({
          message: "Product created successfully",
          type: "success"
        });
      } else {
        await updateProduct(editingProduct._id || editingProduct.id, formData);
        setNotification({
          message: "Product updated successfully",
          type: "success"
        });
      }

      setIsModalOpen(false);

    } catch (err) {
      console.error("Save product error:", err);
      setNotification({
        message: "Failed to save product",
        type: "error"
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      setNotification({
        message: "Product deleted successfully",
        type: "success"
      });
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({
        message: "Failed to delete product",
        type: "error"
      });
    }
  };

  const inventoryColumns = [
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price", render: (v) => formatCurrency(v ?? 0) },
    {
      label: "Stock",
      key: "stock",
      render: (v, row) => {
        const stockLevel = v || 0;
        const isLow = isLowStock(row);
        const isOut = stockLevel === 0;
        
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${
              isOut ? 'text-red-400' : 
              isLow ? 'text-orange-400' : 
              'text-green-400'
            }`}>
              {stockLevel}
            </span>
            {isOut && (
              <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-medium rounded-full border border-red-700/50">
                Out of Stock
              </span>
            )}
            {isLow && !isOut && (
              <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs font-medium rounded-full border border-orange-700/50">
                Low Stock
              </span>
            )}
            {!isLow && !isOut && (
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded-full border border-green-700/50">
                In Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      label: "Actions",
      key: "id",
      render: (id, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEditProduct(row)} 
            className="inline-flex items-center px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-medium text-sm rounded-lg transition-all duration-200 border border-blue-600/30 hover:border-blue-600/50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button 
            onClick={() => handleDeleteProduct(id)} 
            className="inline-flex items-center px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium text-sm rounded-lg transition-all duration-200 border border-red-600/30 hover:border-red-600/50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="owner" pageTitle="Inventory Management">
      
      {/* Real-time Notification */}
      <RealTimeNotification 
        message={notification.message} 
        type={notification.type} 
      />

      {/* Header with Add Product Button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Product Inventory</h2>
          <p className="text-gray-400">Manage your product catalog and stock levels</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="btn btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="metric-card group hover:shadow-xl hover:border-blue-600/50 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Total Products</span>
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📦</div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{products.length}</p>
          <div className="mt-2 text-xs text-gray-500">Active items in catalog</div>
        </div>
        
        <div className="metric-card group hover:shadow-xl hover:border-orange-600/50 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Low Stock Items</span>
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">⚠️</div>
          </div>
          <p className="text-3xl font-bold text-orange-400">
            {products.filter(p => isLowStock(p)).length}
          </p>
          <div className="mt-2 text-xs text-gray-500">Needs restocking soon</div>
        </div>
        
        <div className="metric-card group hover:shadow-xl hover:border-green-600/50 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Total Stock Value</span>
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">💰</div>
          </div>
          <p className="text-3xl font-bold text-gray-100">
            {formatCurrency(products.reduce((total, p) => total + (p.price * p.stock), 0))}
          </p>
          <div className="mt-2 text-xs text-gray-500">Current inventory value</div>
        </div>
        
        <div className="metric-card group hover:shadow-xl hover:border-purple-600/50 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Categories</span>
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🏷️</div>
          </div>
          <p className="text-3xl font-bold text-gray-100">
            {[...new Set(products.map(p => p.category))].length}
          </p>
          <div className="mt-2 text-xs text-gray-500">Product categories</div>
        </div>
      </div>

      {/* Products Table */}
      <DataTable 
        columns={inventoryColumns} 
        data={products}
        className="data-table"
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={modalMode}
      />

      {/* WebSocket Status Indicator */}
      <WebSocketStatus connected={wsConnected} userRole={user?.role || "Owner"} />

    </DashboardLayout>
  );
};

export default Inventory;
