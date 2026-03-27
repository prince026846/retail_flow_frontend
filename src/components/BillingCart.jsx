import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, calculateCartTotal } from '../utils/helpers';
import { createOrder, getProducts } from "../services/api"; // 1. Import the API service
import { makeAuthenticatedRequest } from "../services/api"; // Import for KPI refresh

const BillingCart = ({ onSaleComplete }) => {
  // Added 'cart' and 'clearCart' from context
  const { cart, updateCartItem, removeFromCart, clearCart } = useAppContext();
  const { isDark, colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState(0); // Discount percentage
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Payment method: cash, card, upi

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      updateCartItem(productId, newQuantity);
    } catch (error) {
      alert(error.message);
    }
  };

  // 2. Updated to use the new Async Backend logic
  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!window.confirm('Confirm this sale?')) {
      return;
    }

    setIsProcessing(true);
    try {
      // 3. Map local cart items to the format the backend expects (productId + quantity)
      const order = {
        items: cart.map(item => ({
          productId: item.productId, // Use productId instead of barcode
          quantity: item.quantity
        })),
        discount: discount > 0 ? discount : null, // Only send discount if > 0
        payment_method: paymentMethod
      };

      const result = await createOrder(order);

      if (result) {
        alert(`Sale completed successfully!`);
        clearCart(); // Clear local UI cart after successful DB entry
        
        await getProducts() 

        // Force immediate refresh of KPI data
        try {
          const kpiResponse = await makeAuthenticatedRequest("/analytics/sales-summary");
          const kpiData = await kpiResponse.json();
          console.log('KPI data refreshed:', kpiData);
          // Emit a custom event to notify the dashboard
          window.dispatchEvent(new CustomEvent('kpiUpdate', { 
            detail: {
              soldToday: kpiData.items_sold_today,
              soldWeek: kpiData.items_sold_week
            }
          }));
        } catch (err) {
          console.error('Failed to refresh KPI data:', err);
        }

        if (onSaleComplete) {
          onSaleComplete(result);
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(`Sale failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      clearCart();
    }
  };

  const total = calculateCartTotal(cart);
  const discountAmount = total * (discount / 100);
  const finalTotal = total - discountAmount;

  return (
    <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden h-full`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.primary} px-4 py-3`}>
        <h3 className="text-lg font-bold text-white flex items-center">
          <span className="mr-2">💳</span>
          Quick Billing
        </h3>
      </div>

      <div className="p-4">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🛒</div>
            <h4 className={`text-lg font-semibold ${colors.text} mb-2`}>Your cart is empty</h4>
            <p className={colors.textSecondary}>Add products to start billing</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-base font-semibold ${colors.text}`}>
                  Cart Items ({cart.length})
                </h4>
                <span className={`text-xs ${colors.textSecondary}`}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {cart.map((item, index) => (
                  <div
                    key={item.productId}
                    className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 hover:${isDark ? 'bg-gray-600' : 'bg-gray-100'} transition-colors duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className={`font-semibold ${colors.text} text-sm`}>{item.productName}</h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-bold text-purple-500">
                            {formatCurrency(item.price)}
                          </span>
                          <span className={`text-xs ${colors.textSecondary}`}>× {item.quantity}</span>
                          <span className={`text-sm font-semibold ${colors.text}`}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <div className={`flex items-center ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-md border ${colors.border} shadow-sm`}>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className={`w-6 h-6 flex items-center justify-center hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-l-md transition-colors text-xs`}
                            disabled={item.quantity <= 1 || isProcessing}
                          >
                            <span className={colors.textSecondary}>−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className={`w-6 h-6 flex items-center justify-center hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-r-md transition-colors text-xs`}
                            disabled={item.quantity >= item.availableStock || isProcessing}
                          >
                            <span className={colors.textSecondary}>+</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-md transition-colors text-sm"
                          disabled={isProcessing}
                        >
                          <span>🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount & Payment Section */}
            <div className={`border-t ${colors.border} pt-4 space-y-4`}>
              {/* Discount */}
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-emerald-50'} rounded-lg p-3`}>
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">🎯</span>
                  <h5 className={`font-semibold ${colors.text} text-sm`}>Apply Discount</h5>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value >= 0 && value <= 100) {
                          setDiscount(value);
                        }
                      }}
                      className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:border-green-500 text-sm font-semibold ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
                      placeholder="0"
                      disabled={isProcessing}
                    />
                    <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} text-sm font-semibold`}>
                      %
                    </span>
                  </div>
                  <button
                    onClick={() => setDiscount(0)}
                    className={`px-3 py-2 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${colors.border} rounded-lg hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} font-semibold transition-colors text-sm`}
                    disabled={isProcessing}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-lg p-3`}>
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">💳</span>
                  <h5 className={`font-semibold ${colors.text} text-sm`}>Payment Method</h5>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { method: 'cash', icon: '💵', label: 'Cash' },
                    { method: 'card', icon: '💳', label: 'Card' },
                    { method: 'upi', icon: '📱', label: 'UPI' }
                  ].map(({ method, icon, label }) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-lg font-semibold transition-all duration-200 text-xs ${
                        paymentMethod === method
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                          : `${isDark ? 'bg-gray-800' : 'bg-white'} border ${colors.border} hover:${colors.border}`
                      }`}
                      disabled={isProcessing}
                    >
                      <div className="text-lg mb-1">{icon}</div>
                      <div>{label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className={`border-t ${colors.border} pt-4 mt-4`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={colors.textSecondary}>Subtotal:</span>
                  <span className={`text-base font-semibold ${colors.text}`}>{formatCurrency(total)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium text-sm">Discount ({discount}%):</span>
                    <span className="text-base font-bold text-green-600">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                <div className={`flex justify-between items-center pt-2 border-t ${colors.border}`}>
                  <span className={`text-lg font-bold ${colors.text}`}>Total:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClearCart}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${colors.text} rounded-lg font-semibold transition-colors text-sm`}
                disabled={isProcessing}
              >
                <span className="mr-1">🗑️</span>
                Clear
              </button>
              <button
                onClick={handleConfirmSale}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md disabled:opacity-50 text-sm"
                disabled={isProcessing || !paymentMethod}
              >
                {isProcessing ? (
                  <>
                    <span className="inline-block animate-spin mr-1">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-1">✅</span>
                    Confirm • {formatCurrency(finalTotal)}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingCart;
