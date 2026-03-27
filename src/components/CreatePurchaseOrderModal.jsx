import React, { useState } from 'react';
import { createPurchaseOrder } from '../services/api';

const CreatePurchaseOrderModal = ({ isOpen, onClose, supplierId, supplierName }) => {
  const [items, setItems] = useState([
    { product_id: '', product_name: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = () => {
    setItems([...items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'unit_price' ? Number(value) : value;
    
    // Calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate items
      const validItems = items.filter(item => item.product_id && item.product_name && item.quantity > 0 && item.unit_price > 0);
      
      if (validItems.length === 0) {
        setError('Please add at least one valid item to the purchase order');
        setLoading(false);
        return;
      }

      const orderData = {
        items: validItems,
        expected_delivery_date: expectedDeliveryDate || null,
        notes: notes || null
      };

      await createPurchaseOrder(supplierId, orderData);
      
      // Reset form
      setItems([{ product_id: '', product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
      setExpectedDeliveryDate('');
      setNotes('');
      onClose();
      
      // Show success message (you might want to use a toast notification)
      alert('Purchase order created successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">
            Create Purchase Order - {supplierName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                      type="text"
                      placeholder="Product ID"
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className="input px-3 py-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                      className="input px-3 py-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="input px-3 py-2"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className="input px-3 py-2"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.total_price.toFixed(2)}
                        readOnly
                        className="input px-3 py-2 bg-gray-600"
                        placeholder="Total"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addItem}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              + Add Item
            </button>
          </div>

          {/* Order Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="input px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for this purchase order..."
                  className="input px-3 py-2 w-full h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-100">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-100">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {items.filter(item => item.product_id && item.product_name).length} items included
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;
