import React, { useState, useEffect } from 'react';
import { getLowStockSuppliers } from '../services/api';

const LowStockSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchLowStockSuppliers();
  }, []);

  const fetchLowStockSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLowStockSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError('Failed to fetch low stock suppliers');
      console.error('Low stock fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (supplierId) => {
    setExpanded(prev => ({
      ...prev,
      [supplierId]: !prev[supplierId]
    }));
  };

  const getStockLevelColor = (current, reorder) => {
    const ratio = current / reorder;
    if (ratio <= 0.5) return 'text-red-400 bg-red-900/30';
    if (ratio <= 0.8) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-orange-400 bg-orange-900/30';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>All suppliers have adequate stock levels. No restocking needed.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-100">
          Suppliers Requiring Restock ({suppliers.length})
        </h3>
        <button
          onClick={fetchLowStockSuppliers}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {suppliers.map((supplier) => (
        <div key={supplier.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
            onClick={() => toggleExpand(supplier.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-100">{supplier.name}</h4>
                  <p className="text-sm text-gray-400">{supplier.email}</p>
                  {supplier.phone && (
                    <p className="text-sm text-gray-400">{supplier.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Low Stock Items</div>
                  <div className="text-2xl font-bold text-red-400">
                    {supplier.low_stock_products.length}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${expanded[supplier.id] ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {expanded[supplier.id] && (
            <div className="border-t border-gray-700 p-4 bg-gray-700/30">
              <h5 className="text-md font-semibold text-gray-100 mb-3">Products Needing Restock</h5>
              <div className="space-y-2">
                {supplier.low_stock_products.map((product, index) => (
                  <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-100">{product.product_name}</h6>
                        <p className="text-sm text-gray-400">Product ID: {product.product_id}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Current Stock</div>
                          <div className="text-lg font-semibold text-gray-100">{product.current_stock}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Reorder Level</div>
                          <div className="text-lg font-semibold text-yellow-400">{product.reorder_level}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Unit Price</div>
                          <div className="text-lg font-semibold text-green-400">₹{product.unit_price.toFixed(2)}</div>
                        </div>
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${getStockLevelColor(product.current_stock, product.reorder_level)}`}>
                          {((product.current_stock / product.reorder_level) * 100).toFixed(0)}% stocked
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            product.current_stock === 0 ? 'bg-red-500' :
                            (product.current_stock / product.reorder_level) <= 0.5 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min((product.current_stock / product.reorder_level) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-4 flex space-x-3">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Purchase Order</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>View Catalog</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LowStockSuppliers;
