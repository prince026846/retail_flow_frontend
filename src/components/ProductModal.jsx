import React, { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSave, product = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost_price: '',
    stock: '',
    category: 'Electronics',
    barcode: '',
    low_stock_threshold: '10',
    supplier: 'Nexus Global Logistics',
    image: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price ?? '',
        cost_price: product.cost_price ?? '',
        stock: product.stock ?? '',
        category: product.category || 'Electronics',
        barcode: product.barcode || '',
        low_stock_threshold: product.low_stock_threshold ?? '10',
        supplier: product.supplier || 'Nexus Global Logistics',
        image: product.image || null
      });
    } else {
      setFormData({ 
        name: '', 
        price: '', 
        cost_price: '',
        stock: '', 
        category: 'Electronics', 
        barcode: '', 
        low_stock_threshold: '10',
        supplier: 'Nexus Global Logistics',
        image: null
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File size must be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      if (errors.image) setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = 'Product name is required';

    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0)
      newErrors.price = 'Price must be 0 or greater';

    if (formData.cost_price === '' || isNaN(formData.cost_price) || Number(formData.cost_price) < 0)
      newErrors.cost_price = 'Cost price must be 0 or greater';

    if (formData.stock === '' || isNaN(formData.stock) || Number(formData.stock) < 0)
      newErrors.stock = 'Stock must be 0 or greater';

    if (formData.stock !== '' && !Number.isInteger(Number(formData.stock)))
      newErrors.stock = 'Stock must be a whole number';

    if (
      formData.low_stock_threshold !== '' &&
      (!Number.isInteger(Number(formData.low_stock_threshold)) || Number(formData.low_stock_threshold) < 0)
    )
      newErrors.low_stock_threshold = 'Must be a whole number >= 0';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedStock = parseInt(formData.stock, 10);
    const parsedPrice = parseFloat(String(formData.price).replace(/[^\d.-]/g, ''));
    const parsedCostPrice = parseFloat(String(formData.cost_price).replace(/[^\d.-]/g, ''));

    console.log('Submitting Product Data:', { 
        name: formData.name, 
        price: parsedPrice, 
        stock: parsedStock,
        original_price: formData.price
    });

    // Hard guard — never let NaN reach the server
    if (isNaN(parsedStock) || isNaN(parsedPrice)) {
      setErrors(prev => ({
        ...prev,
        ...(isNaN(parsedStock) && { stock: 'Stock is required and must be a number' }),
        ...(isNaN(parsedPrice) && { price: 'Selling Price is required and must be a number' }),
      }));
      alert("Please fix the errors: Stock and Selling Price are required.");
      return;
    }

    // Exact shape of ProductCreate Pydantic schema
    const payload = {
      name: formData.name.trim(),                   // str  (required)
      price: parsedPrice,                           // float (required)
      cost_price: isNaN(parsedCostPrice) ? 0 : parsedCostPrice, 
      stock: parsedStock,                           // int  (required)
      category: formData.category ? formData.category.trim() : "General",
      barcode: formData.barcode ? formData.barcode.trim() : null,
      low_stock_threshold: formData.low_stock_threshold !== ''
        ? parseInt(formData.low_stock_threshold, 10)
        : 10,
      supplier: formData.supplier ? formData.supplier.trim() : "N/A",
      // Remove File object before sending as JSON (JSON cannot send files)
      image: (formData.image instanceof File) ? null : formData.image
    };

    onSave(payload);
    onClose();

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                {mode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">Register a new item to the Ethereal Ledger ecosystem.</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Image Upload */}
            <div>
              <label htmlFor="productImage" className="block text-sm font-medium text-gray-300 mb-2">PRODUCT IMAGE</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Drop image here or browse</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Supports JPG, PNG up to 5MB</p>
                  {formData.image && (
                    <div className="mt-2 text-sm text-green-400">
                      {formData.image.name}
                    </div>
                  )}
                  {errors.image && <p className="text-red-400 text-sm mt-1">{errors.image}</p>}
                </div>
              </div>
            </div>

            {/* Product Name and Category - Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">PRODUCT NAME</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g. Luminary Smart Watch" 
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">CATEGORY</label>
                <input 
                  type="text"
                  list="categories-list"
                  id="category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  placeholder="Type or select category"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <datalist id="categories-list">
                  <option value="Electronics" />
                  <option value="Clothing" />
                  <option value="Food" />
                  <option value="Books" />
                  <option value="Furniture" />
                  <option value="Home Decor" />
                  <option value="Office Supplies" />
                  <option value="Stationery" />
                  <option value="Appliances" />
                </datalist>
              </div>
            </div>

            {/* Barcode and Supplier - Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-300 mb-2">BARCODE ID</label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="barcode" 
                    name="barcode" 
                    value={formData.barcode} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                    placeholder="UPC-A / EAN-13" 
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-300 mb-2">SUPPLIER</label>
                <input 
                  type="text"
                  list="suppliers-list"
                  id="supplier" 
                  name="supplier" 
                  value={formData.supplier} 
                  onChange={handleChange}
                  placeholder="Type or select supplier"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <datalist id="suppliers-list">
                  <option value="Nexus Global Logistics" />
                  <option value="TechSupply Co" />
                  <option value="Global Distributors" />
                  <option value="Local Suppliers" />
                  <option value="Standard Manufacturing" />
                  <option value="Prime Solutions" />
                </datalist>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">COST PRICE (₹)</label>
                <input 
                  type="number" 
                  name="cost_price" 
                  value={formData.cost_price} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SELLING PRICE (₹) *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 border ${errors.price ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white`}
                  placeholder="0.00" 
                  required
                />
              </div>
            </div>

            {/* Inventory Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">STOCK QUANTITY *</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 border ${errors.stock ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white`}
                  placeholder="0" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">REORDER LEVEL</label>
                <input 
                  type="number" 
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="10" 
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-gray-100 font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;