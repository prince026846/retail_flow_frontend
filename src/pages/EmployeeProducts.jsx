import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getProducts, getLowStockProducts } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';

const EmployeeProducts = () => {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Fetch real products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        console.log('Raw products data from API:', productsData);
        
        // Ensure we have an array
        if (!Array.isArray(productsData)) {
          console.error('Products data is not an array:', productsData);
          setProducts([]);
          return;
        }
        
        // Transform API data to match component structure
        const transformedProducts = productsData.map(product => {
          console.log('Processing product:', product);
          return {
            id: product.id,
            name: product.name || 'Unknown Product',
            category: product.category || 'Uncategorized',
            price: product.price || 0,
            stock: product.stock || 0,
            sku: product.sku || (product.id && product.id.slice(-8).toUpperCase()) || 'UNKNOWN', // Generate SKU if not present
            barcode: product.barcode || (product.id && product.id.slice(-12)) || 'UNKNOWN' // Generate barcode if not present
          };
        });
        console.log('Transformed products:', transformedProducts);
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to empty array
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch low stock products
  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const lowStockData = await getLowStockProducts();
        setLowStockProducts(lowStockData);
      } catch (error) {
        console.error('Error fetching low stock products:', error);
        setLowStockProducts([]);
      }
    };

    fetchLowStockProducts();
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock) => {
    if (stock <= 10) return { status: 'Low', color: 'text-red-400 bg-red-500/20' };
    if (stock <= 25) return { status: 'Medium', color: 'text-yellow-400 bg-yellow-500/20' };
    return { status: 'Good', color: 'text-green-400 bg-green-500/20' };
  };

  // Calculate KPI metrics
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = lowStockProducts.length;
  const categoriesCount = [...new Set(products.map(p => p.category))].length;

  const productColumns = [
    { label: "Product Name", key: "name" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price", render: (v) => formatCurrency(v ?? 0) },
    { label: "Stock", key: "stock" },
    { 
      label: "Status", 
      key: "stock",
      render: (stock) => {
        const status = getStockStatus(stock);
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.status}
          </span>
        );
      }
    }
  ];

  return (
    <DashboardLayout role="employee" pageTitle="Product Inventory">
      <div className={`${colors.background} min-h-screen rounded-xl`}>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Products"
            value={totalProducts}
            icon="📦"
            color="primary"
            subtitle="Active items in catalog"
          />
          <KPICard
            title="Low Stock Items"
            value={lowStockCount}
            icon="⚠️"
            color="warning"
            subtitle={lowStockCount > 0 ? "Needs restocking" : "All good"}
          />
          <KPICard
            title="Total Stock Value"
            value={formatCurrency(totalStockValue)}
            icon="💰"
            color="secondary"
            subtitle="Current inventory value"
          />
          <KPICard
            title="Categories"
            value={categoriesCount}
            icon="🏷️"
            color="accent"
            subtitle="Product categories"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => navigate('/employee')}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-md text-sm font-medium"
          >
            <span className="mr-2">←</span>
            Back to Dashboard
          </button>
        </div>

        {/* Search and Filter */}
        <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block ${colors.text} mb-2 text-sm font-medium`}>Search Products</label>
              <input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 ${colors.background} border ${colors.border} rounded-xl ${colors.text} placeholder-${colors.textSecondary}/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block ${colors.text} mb-2 text-sm font-medium`}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-3 ${colors.background} border ${colors.border} rounded-xl ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                {categories.map(category => (
                  <option key={category} value={category} className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className={colors.textSecondary}>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
                {searchTerm || selectedCategory !== 'all' ? 'No products found' : 'No products in inventory'}
              </h3>
              <p className={colors.textSecondary}>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Start by adding products to your inventory'}
              </p>
            </div>
          ) : (
            <div className="p-4">
              <DataTable
                columns={productColumns}
                data={filteredProducts}
              />
            </div>
          )}

          {/* Summary Footer */}
          {!isLoading && filteredProducts.length > 0 && (
            <div className={`border-t ${colors.border} px-6 py-4`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className={colors.textSecondary}>
                  Showing {filteredProducts.length} of {products.length} products
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className={colors.textSecondary}>
                    Total Value: <span className={colors.text}>
                      {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0))}
                    </span>
                  </div>
                  <div className={colors.textSecondary}>
                    Low Stock: <span className="text-red-400">
                      {filteredProducts.filter(p => p.stock <= 10).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeProducts;
