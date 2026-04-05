import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, calculateCartTotal } from '../utils/helpers';
import { createOrder, getProducts, getCustomers, makeAuthenticatedRequest, createCustomer, searchCustomers } from "../services/api";

const BillingCart = ({ onSaleComplete, onOpenAddCustomer }) => {
  // Added 'cart' and 'clearCart' from context
  const { cart, updateCartItem, removeFromCart, clearCart } = useAppContext();
  const { isDark, colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  
  // Phone search states
  const [phoneSearch, setPhoneSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Add customer modal states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '', email: null, phone: '', address: '', city: '', state: '', postal_code: '', country: ''
  });
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState(null);
  const [customerSuccess, setCustomerSuccess] = useState(null);
  
  // Bill/ WhatsApp status states
  const [lastOrderResult, setLastOrderResult] = useState(null);
  const [showBillStatus, setShowBillStatus] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const customerResponse = await getCustomers(1, 1000);
        const customerList = Array.isArray(customerResponse?.customers)
          ? customerResponse.customers.filter((customer) => customer.is_active !== false)
          : [];

        if (mounted) {
          setCustomers(customerList);
        }
      } catch (error) {
        console.warn('Failed to load customers for billing:', error);
      } finally {
        if (mounted) {
          setIsLoadingCustomers(false);
        }
      }
    };

    loadCustomers();

    return () => {
      mounted = false;
    };
  }, []);

  // Backend search for customers based on phone
  useEffect(() => {
    if (phoneSearch.length >= 3) {
      setIsSearching(true);
      
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await searchCustomers(phoneSearch, 1, 20);
          const customersList = result?.customers || [];
          setFilteredCustomers(customersList.filter(c => c.is_active !== false));
          setShowDropdown(true);
        } catch (error) {
          console.error('Search failed:', error);
          setFilteredCustomers([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setFilteredCustomers([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [phoneSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.name);
    setPhoneSearch(customer.phone || '');
    setShowDropdown(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId('');
    setSelectedCustomerName('');
    setPhoneSearch('');
    setShowDropdown(false);
  };

  const handleOpenAddCustomer = () => {
    setCustomerForm({
      name: '', email: null, phone: phoneSearch, address: '', city: '', state: '', postal_code: '', country: ''
    });
    setShowAddCustomerModal(true);
    setCustomerError(null);
    setCustomerSuccess(null);
  };

  const handleCloseAddCustomer = () => {
    setShowAddCustomerModal(false);
    setCustomerError(null);
    setCustomerSuccess(null);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const dataToSubmit = { ...customerForm };
      if (!dataToSubmit.email) {
        dataToSubmit.email = null;
      }
      const newCustomer = await createCustomer(dataToSubmit);
      setCustomerSuccess('Customer added successfully!');
      
      // Add new customer to list and select it
      if (newCustomer && newCustomer.id) {
        setCustomers(prev => [...prev, newCustomer]);
        handleSelectCustomer(newCustomer);
      }
      
      setTimeout(() => {
        handleCloseAddCustomer();
      }, 1500);
    } catch (err) {
      setCustomerError(err.message || 'Failed to add customer');
    } finally {
      setCustomerLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        payment_method: paymentMethod,
        ...(selectedCustomerId ? { customer_id: selectedCustomerId } : {})
      };

      const result = await createOrder(order);

      if (result) {
        setLastOrderResult(result);
        setShowBillStatus(true);
        
        // Auto-download bill PDF with authentication
        if (result.id) {
          const downloadBill = async () => {
            try {
              const token = sessionStorage.getItem('retailflow_token');
              console.log('Token retrieved:', token ? 'Yes (length: ' + token.length + ')' : 'No');
              
              if (!token) {
                console.error('No token found in sessionStorage');
                alert('Please login again - session expired');
                return;
              }
              
              const response = await fetch(
                `${import.meta.env.VITE_API_URL || ''}/orders/${result.id}/bill`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  credentials: 'include'
                }
              );
              
              console.log('Download response status:', response.status);
              
              if (!response.ok) {
                if (response.status === 401) {
                  console.error('Authentication failed - token may be expired');
                  alert('Session expired. Please login again.');
                } else {
                  console.error('Failed to download bill:', response.statusText);
                }
                return;
              }
              
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `bill_${result.id.slice(-8)}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error('Auto-download error:', err);
            }
          };
          
          // Small delay to ensure order processing is complete
          setTimeout(downloadBill, 1500);
        }
        
        // Show success message with WhatsApp status
        let successMsg = 'Sale completed successfully!';
        if (result.bill_sent) {
          successMsg += '\n\n📱 Bill sent via WhatsApp!';
        } else if (result.whatsapp_status) {
          successMsg += `\n\n⚠️ Bill status: ${result.whatsapp_status}`;
        }
        alert(successMsg);
        clearCart(); // Clear local UI cart after successful DB entry
        setSelectedCustomerId('');
        
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
      setLastOrderResult(null);
      setShowBillStatus(false);
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
            
            {/* Bill Status Section */}
            {showBillStatus && lastOrderResult && (
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                <h5 className={`font-semibold ${colors.text} mb-3 flex items-center justify-center`}>
                  <span className="mr-2">📄</span>
                  Last Order Status
                </h5>
                
                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between ${colors.text}`}>
                    <span>Order ID:</span>
                    <span className="font-mono">{lastOrderResult.id?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className={`flex justify-between ${colors.text}`}>
                    <span>Total:</span>
                    <span className="font-semibold">₹{lastOrderResult.total_price?.toFixed(2)}</span>
                  </div>
                  
                  {/* WhatsApp Status */}
                  <div className={`mt-3 p-2 rounded ${lastOrderResult.bill_sent ? (isDark ? 'bg-green-900/30' : 'bg-green-100') : (isDark ? 'bg-yellow-900/30' : 'bg-yellow-100')}`}>
                    <div className="flex items-center justify-center">
                      <span className="mr-2">
                        {lastOrderResult.bill_sent ? '✅' : '⏳'}
                      </span>
                      <span className={lastOrderResult.bill_sent ? 'text-green-600' : 'text-yellow-600'}>
                        {lastOrderResult.bill_sent 
                          ? 'Bill sent via WhatsApp!' 
                          : (lastOrderResult.whatsapp_status || 'Bill being processed...')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Download Bill Button */}
                  {lastOrderResult.id && (
                    <button
                      onClick={async () => {
                        try {
                          const token = sessionStorage.getItem('retailflow_token');
                          const response = await fetch(
                            `${import.meta.env.VITE_API_URL || ''}/orders/${lastOrderResult.id}/bill`,
                            {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            }
                          );
                          
                          if (!response.ok) {
                            throw new Error('Failed to download bill');
                          }
                          
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `bill_${lastOrderResult.id.slice(-8)}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          alert('Failed to download bill: ' + err.message);
                        }
                      }}
                      className="mt-3 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      <span className="mr-2">📥</span>
                      Download Bill PDF
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowBillStatus(false)}
                  className={`mt-3 text-xs ${colors.textSecondary} hover:text-blue-500 underline`}
                >
                  Dismiss
                </button>
              </div>
            )}
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
              {/* Customer Selection - Phone Search */}
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50'} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👤</span>
                    <h5 className={`font-semibold ${colors.text} text-sm`}>Customer</h5>
                  </div>
                  {isLoadingCustomers && (
                    <span className={`text-xs ${colors.textSecondary}`}>Loading...</span>
                  )}
                  {selectedCustomerId && (
                    <button
                      onClick={handleClearCustomer}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {selectedCustomerId ? (
                  <div className={`w-full px-3 py-2 border ${colors.border} rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`font-semibold ${colors.text} text-sm`}>{selectedCustomerName}</span>
                        <span className={`${colors.textSecondary} text-xs ml-2`}>{phoneSearch}</span>
                      </div>
                      <span className="text-green-500 text-sm">✓</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <input
                      ref={searchInputRef}
                      type="tel"
                      placeholder={isLoadingCustomers ? "Loading customers..." : "Search by phone (min 3 digits)..."}
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value.replace(/\D/g, ''))}
                      onFocus={() => phoneSearch.length >= 3 && setShowDropdown(true)}
                      disabled={isProcessing || isLoadingCustomers}
                      className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:border-amber-500 text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
                    />
                    
                    {/* Dropdown with matching customers */}
                    {showDropdown && (
                      <div className={`absolute z-10 w-full mt-1 border ${colors.border} rounded-lg shadow-lg max-h-48 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {isSearching ? (
                          <div className={`px-3 py-2 ${colors.textSecondary} text-sm text-center`}>
                            <span className="inline-block animate-spin mr-2">⏳</span>Searching...
                          </div>
                        ) : filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => handleSelectCustomer(customer)}
                              className={`w-full px-3 py-2 text-left hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-colors ${colors.text} text-sm`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{customer.name}</span>
                                <span className={`${colors.textSecondary} text-xs`}>{customer.phone}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className={`px-3 py-2 ${colors.textSecondary} text-sm text-center`}>
                            No matching customers
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Add Customer Button - Only show when 10 digits typed and no exact match */}
                {phoneSearch.length >= 10 && !selectedCustomerId && (
                  <button
                    onClick={handleOpenAddCustomer}
                    className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                  >
                    <span className="mr-1">+</span> Add New Customer with {phoneSearch}
                  </button>
                )}
                
                <p className={`text-xs mt-2 ${colors.textSecondary}`}>
                  {selectedCustomerId 
                    ? 'Customer selected. Order will be attached to their history.'
                    : 'Type phone number to search (3+ digits) or enter 10 digits to add new.'}
                </p>
              </div>

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
                    Complete Sale • {formatCurrency(finalTotal)}
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${colors.card} rounded-xl p-6 w-full max-w-md`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${colors.text}`}>Add New Customer</h3>
                <button onClick={handleCloseAddCustomer} className="text-2xl">×</button>
              </div>
              {customerSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{customerSuccess}</div>}
              {customerError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{customerError}</div>}
              <form onSubmit={handleCustomerSubmit} className="space-y-3">
                <input type="text" placeholder="Name *" required value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                <input type="email" placeholder="Email (optional)" value={customerForm.email || ''} onChange={e => setCustomerForm({...customerForm, email: e.target.value || null})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                <input type="tel" placeholder="Phone *" required value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                <input type="text" placeholder="Address" value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" value={customerForm.city} onChange={e => setCustomerForm({...customerForm, city: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                  <input type="text" placeholder="State" value={customerForm.state} onChange={e => setCustomerForm({...customerForm, state: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Postal Code" value={customerForm.postal_code} onChange={e => setCustomerForm({...customerForm, postal_code: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                  <input type="text" placeholder="Country" value={customerForm.country} onChange={e => setCustomerForm({...customerForm, country: e.target.value})} className={`w-full p-2 border ${colors.border} rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} />
                </div>
                <button type="submit" disabled={customerLoading} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium">
                  {customerLoading ? 'Adding...' : 'Add Customer'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingCart;
