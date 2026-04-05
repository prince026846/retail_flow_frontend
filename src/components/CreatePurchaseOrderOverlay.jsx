import React, { useState } from 'react';

const CreatePurchaseOrderOverlay = ({ isOpen, onClose, onCreateOrder }) => {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [products, setProducts] = useState([
    {
      id: 1,
      productName: 'Silicon Carbide Wafer',
      quantity: 500,
      unitCost: 240.00,
      status: 'PENDING',
      subtotal: 120000.00
    },
    {
      id: 2,
      productName: 'Gallium Nitride Core',
      quantity: 120,
      unitCost: 850.00,
      status: 'DELIVERED',
      subtotal: 102000.00
    }
  ]);

  const totalOrderValue = products.reduce((sum, product) => sum + product.subtotal, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl w-full max-w-4xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Purchase Order</h2>
            <p className="text-gray-400 text-sm">Initiate a new procurement request with status tracking</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Supplier Section */}
        <div className="px-8 pb-6">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            SUPPLIER
          </label>
          <div className="relative">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a verified vendor</option>
              <option value="global-tech">Global Tech Solutions</option>
              <option value="premium-materials">Premium Materials Inc</option>
              <option value="quickship">QuickShip Logistics</option>
              <option value="quality-parts">Quality Parts Co</option>
              <option value="smart-supply">Smart Supply Ltd</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              PRODUCT DETAILS
            </label>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PRODUCT NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">QUANTITY</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">UNIT COST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{product.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">₹ {product.unitCost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          product.status === 'PENDING' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <span className={`text-xs font-medium ${
                          product.status === 'PENDING' ? 'text-yellow-400' : 'text-green-400'
                        }`}>{product.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      ₹{product.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Order Value */}
        <div className="px-8 pb-6">
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              TOTAL ORDER VALUE
            </div>
            <div className="text-3xl font-bold text-white">
              ₹{totalOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-8 pt-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreateOrder({ supplier: selectedSupplier, products });
              onClose();
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderOverlay;
