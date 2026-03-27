import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

const ProductSelector = () => {
  const { products, addToCart } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});


// const formattedProducts = apiProducts.map(p => ({
//   ...p,
//   quantity: p.stock
// }));
  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value) || 1;
    setQuantities(prev => ({ ...prev, [productId]: numValue }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    try {
      addToCart(product.id, quantity);
      // Reset quantity for this product
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="card p-6 bg-gray-800 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Select Products</h3>
        <div className="text-sm text-gray-400">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none text-base"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none text-base"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No products available</p>
        ) : (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-md transition-all bg-gray-700"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-white mb-2 leading-tight">{product.name}</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-200">
                    {product.category || 'N/A'}
                  </span>
                  <span className="text-lg font-bold text-primary-400">
                    {formatCurrency(product.price)}
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    product.stock < 5 
                      ? 'bg-red-900 text-red-200' 
                      : 'bg-green-900 text-green-200'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                <div className="flex flex-col items-center">
                  <label htmlFor={`qty-${product.id}`} className="text-xs text-gray-400 mb-1">Qty</label>
                  <input
                    id={`qty-${product.id}`}
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-24 px-3 py-2 bg-gray-600 border-2 border-gray-500 rounded-lg text-center text-base font-medium text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-primary-600 text-white text-base px-6 py-2.5 font-medium rounded-lg shadow-sm hover:bg-primary-700 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
