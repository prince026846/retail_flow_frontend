import React, { useState, useMemo, useEffect, Suspense } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import ProductSelector from '../components/ProductSelector';
import WebSocketStatus from '../components/WebSocketStatus';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { isToday, isThisWeek } from '../utils/helpers';
import { getProducts, getAnalytics, getWorstProducts, makeAuthenticatedRequest } from "../services/api";
import { Html5Qrcode } from "html5-qrcode";
import { lazyWithTracking } from "../utils/performance";
import websocketService from '../services/websocket';

// Lazy loaded billing component with performance tracking
const BillingCart = lazyWithTracking(() => import('../components/BillingCart'), 'billing-cart');

// Loading component for billing cart
const BillingLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();
  // Removed 'products' from useAppContext as it now comes from the backend
  const { addToCart, getSales, getLowStockProducts } = useAppContext();
  
  // 1. Add local state for products
  const [products, setProducts] = useState([]);
  const [showBilling, setShowBilling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([])
  const [worstSellers, setWorstSellers] = useState([])
  const [kpiData, setKpiData] = useState({
  soldToday: 0,
  soldWeek: 0
})
  const [showScanner, setShowScanner] = useState(false)
  const [scanner, setScanner] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  
  const columns = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Product", flex: 1 },
  { field: "unitsSold", headerName: "Units Sold", flex: 1 },
  // { field: "stock", headerName: "Stock", flex: 1}
]

  // 2. Fetch products from Backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

useEffect(() => {
  if (!showScanner) return

  const html5QrCode = new Html5Qrcode("reader")
  setScanner(html5QrCode)

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 120 }
  }

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      console.log("Scanned:", decodedText)

      const product = products.find(
        (p) => p.barcode === decodedText
      )

      if (product) {
        try {
          addToCart(product.id || product._id, 1);
          alert(`Success! ${product.name} added to cart.`);
        } catch (error) {
          alert(`Error adding to cart: ${error.message}`);
        }
      } else {
        alert("Product not found")
      }
    },
    (error) => {}
  )

  return () => {
    html5QrCode.stop().then(() => {
      html5QrCode.clear()
    })
  }
}, [showScanner, products])



  useEffect(() => {
  if (products.length > 0) {
    loadAnalytics()
  }
}, [products])

const loadAnalytics = async () => {
  try {
    const bestData = await getAnalytics()
    const worstData = await getWorstProducts()

    const bestMapped = bestData.map((item, index) => ({
      id: index + 1,
      name: item.name,
      unitsSold: item.unitsSold,
      category: item.category || "N/A",
      stock: Array.isArray(item.stock) ? item.stock[0] : item.stock
    }))

    const worstMapped = worstData.map((item, index) => ({
      id: index + 1,
      name: item.name,
      unitsSold: item.unitsSold,
      category: item.category || "N/A",
      stock: Array.isArray(item.stock) ? item.stock[0] : item.stock
    }))

    setBestSellers(bestMapped)
    setWorstSellers(worstMapped)

  } catch (err) {
    console.error("Analytics error:", err)
  }
}

  const sessionSales = getSales('employee');

  const metrics = useMemo(() => {
    const soldToday = sessionSales
      .filter(sale => isToday(sale.dateTime))
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
      }, 0);

    const soldWeek = sessionSales
      .filter(sale => isThisWeek(sale.dateTime))
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
      }, 0);

    // Note: getLowStockProducts might still use context data. 
    // If it breaks, you can calculate this filter directly from the 'products' state above.
    const lowStockCount = getLowStockProducts().length;

    return { soldToday, soldWeek, lowStockCount };
  }, [sessionSales, getLowStockProducts]);

  // const { bestSellers, worstSellers } = useMemo(() => {
  //   const productSales = {};
    
  //   sessionSales.forEach(sale => {
  //     sale.items.forEach(item => {
  //       if (!productSales[item.productId]) {
  //         productSales[item.productId] = {
  //           name: item.productName,
  //           quantity: 0
  //         };
  //       }
  //       productSales[item.productId].quantity += item.quantity;
  //     });
  //   });

  //   const salesArray = Object.entries(productSales).map(([id, data]) => {
  //     const product = products.find(p => p.id === id || p._id === id); // Handle MongoDB _id
  //     return {
  //       id,
  //       name: data.name,
  //       category: product?.category || 'N/A',
  //       unitsSold: data.quantity,
  //       stock: product?.quantity || 0
  //     };
  //   });

  //   salesArray.sort((a, b) => b.unitsSold - a.unitsSold);

  //   return {
  //     bestSellers: salesArray.slice(0, 5).map((item, index) => ({ ...item, id: index + 1 })),
  //     worstSellers: salesArray.slice(-5).reverse().map((item, index) => ({ ...item, id: index + 1 }))
  //   };
  // }, [products, sessionSales]);
const loadKPIs = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/sales-summary")
    const data = await res.json()

    setKpiData({
      soldToday: data.items_sold_today,
      soldWeek: data.items_sold_week
    })

  } catch (err) {
    console.error("KPI error:", err)
  }
}
const loadLowStock = async () => {
  try {
    const res = await makeAuthenticatedRequest("/analytics/low-stock-products")
    const data = await res.json()
    setLowStockProducts(data)
  } catch (err) {
    console.error("Low stock error:", err)
  }
}

useEffect(() => {
  loadKPIs()
  loadLowStock()
}, [])

// WebSocket connection effect
useEffect(() => {
  const token = sessionStorage.getItem("retailflow_token");
  
  console.log('WebSocket effect running, token exists:', !!token);
  
  if (token) {
    // Connect to WebSocket
    websocketService.connect(token)
      .then(() => {
        console.log('WebSocket connected successfully');
        setWsConnected(true);
      })
      .catch((error) => {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
        // Fallback: set up periodic polling if WebSocket fails
        const pollInterval = setInterval(() => {
          console.log('Polling KPI data as WebSocket fallback');
          loadKPIs();
        }, 30000); // Poll every 30 seconds
        
        return () => clearInterval(pollInterval);
      });

    // Set up event listeners
    const handleSalesUpdate = (data) => {
      console.log('Received sales update:', data);
      setKpiData({
        soldToday: data.items_sold_today,
        soldWeek: data.items_sold_week
      });
    };

    const handleOrderCreated = (data) => {
      console.log('Received order created notification:', data);
      // Optionally show a notification or refresh other data
      loadKPIs(); // Refresh KPIs to ensure consistency
    };

    websocketService.on('sales_update', handleSalesUpdate);
    websocketService.on('order_created', handleOrderCreated);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      websocketService.off('sales_update', handleSalesUpdate);
      websocketService.off('order_created', handleOrderCreated);
      websocketService.disconnect();
      setWsConnected(false);
    };
  } else {
    console.log('No token found, WebSocket not connecting');
  }
}, [])

// Listen for custom KPI update events from BillingCart
useEffect(() => {
  const handleKpiUpdate = (event) => {
    console.log('Received KPI update event:', event.detail);
    setKpiData({
      soldToday: event.detail.soldToday,
      soldWeek: event.detail.soldWeek
    });
  };

  window.addEventListener('kpiUpdate', handleKpiUpdate);
  
  return () => {
    window.removeEventListener('kpiUpdate', handleKpiUpdate);
  };
}, [])
  const productColumns = [
    { label: "#", key: "id" },
  { label: "Product Name", key: "name" },
  { label: "Category", key: "category" },
  { label: "Units Sold", key: "unitsSold" },
  { label: "Stock", key: "stock" }
  ];

  const handleSaleComplete = () => {
    setShowBilling(false);
    // WebSocket will automatically update the KPIs, but we can also refresh products
    // and KPIs immediately to ensure updates
    const refreshData = async () => {
      try {
        // Refresh products to update stock levels
        const productData = await getProducts();
        setProducts(productData);
        
        // Also refresh KPIs as backup
        await loadKPIs();
        
        console.log('Data refreshed after sale completion');
      } catch (err) {
        console.error("Failed to refresh data after sale:", err);
      }
    };
    
    refreshData();
  };

  return (
    <DashboardLayout role="employee" pageTitle="Employee Dashboard">
      <div className={`${colors.background} min-h-screen rounded-xl`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
          <div className={`bg-gradient-to-r ${colors.primary} px-4 py-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Items Sold Today</h3>
              <span className="text-xl">📦</span>
            </div>
          </div>
          <div className="p-4">
            <div className={`text-2xl font-bold ${colors.text} mb-1`}>{kpiData.soldToday}</div>
            <div className={`text-xs ${wsConnected ? 'text-green-500' : 'text-red-500'}`}>
              {wsConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
          </div>
        </div>

        <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
          <div className={`bg-gradient-to-r ${colors.secondary} px-4 py-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Items Sold This Week</h3>
              <span className="text-xl">📊</span>
            </div>
          </div>
          <div className="p-4">
            <div className={`text-2xl font-bold ${colors.text} mb-1`}>{kpiData.soldWeek}</div>
            <div className={`text-xs ${wsConnected ? 'text-green-500' : 'text-red-500'}`}>
              {wsConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
          </div>
        </div>

        <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
          <div className={`bg-gradient-to-r ${colors.warning} px-4 py-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Low Stock Alerts</h3>
              <span className="text-xl">⚠️</span>
            </div>
          </div>
          <div className="p-4">
            <div className={`text-2xl font-bold ${colors.text} mb-1`}>{lowStockProducts.length}</div>
            <div className={`text-xs ${lowStockProducts.length > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {lowStockProducts.length > 0 ? 'Action Needed' : 'All Good'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => navigate('/employee/products')}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-md text-sm font-medium"
        >
          <span className="mr-2">📦</span>
          View Products
        </button>

        <button
          onClick={() => setShowBilling(!showBilling)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md text-sm font-medium"
        >
          <span className="mr-2">{showBilling ? "📊" : "💳"}</span>
          {showBilling ? "Hide Billing" : "Quick Billing"}
        </button>

        {showBilling && (
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-md text-sm font-medium"
          >
            <span className="mr-2">📷</span>
            {showScanner ? "Close Scanner" : "Scan Barcode"}
          </button>
        )}
      </div>

      {/* Billing Section */}
      {showBilling && (
        <div className="space-y-4 mb-8">
          {showScanner && (
            <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} p-3 max-w-md mx-auto`}>
              <div id="reader"></div>
              <p className={`text-center text-sm ${colors.textSecondary} mt-2`}>
                Align barcode inside the box
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
              <div className={`bg-gradient-to-r ${colors.accent} px-4 py-3`}>
                <h3 className="text-white font-semibold flex items-center text-sm">
                  <span className="mr-2">🛒</span>
                  Product Selector
                </h3>
              </div>
              <div className="p-4">
                <ProductSelector products={products} />
              </div>
            </div>

            <Suspense fallback={<BillingLoader />}>
              <BillingCart onSaleComplete={handleSaleComplete} />
            </Suspense>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} p-8 text-center`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className={`mt-4 ${colors.textSecondary}`}>Loading products...</p>
          </div>
        ) : (
          <>
            {bestSellers.length > 0 ? (
              <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
                <div className={`bg-gradient-to-r ${colors.primary} px-4 py-3`}>
                  <h3 className="text-white font-semibold flex items-center text-sm">
                    <span className="mr-2">🏆</span>Top 5 Best-Selling Products
                  </h3>
                </div>
                <div className="p-4">
                  <DataTable columns={productColumns} data={bestSellers} />
                </div>
              </div>
            ) : (
              <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} p-6 text-center`}>
                <div className="text-4xl mb-3">📊</div>
                <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>No Sales Yet</h3>
                <p className={colors.textSecondary}>Start selling to see your best products here</p>
              </div>
            )}
            
            {worstSellers.length > 0 && (
              <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
                <div className={`bg-gradient-to-r ${colors.warning} px-4 py-3`}>
                  <h3 className="text-white font-semibold flex items-center text-sm">
                    <span className="mr-2">📉</span>Top 5 Worst-Selling Products
                  </h3>
                </div>
                <div className="p-4">
                  <DataTable columns={productColumns} data={worstSellers} />
                </div>
              </div>
            )}

            <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden`}>
              <div className={`bg-gradient-to-r ${colors.warning} px-4 py-3`}>
                <h3 className="text-white font-semibold flex items-center text-sm">
                  <span className="mr-2">⚠️</span>Low Stock Products
                </h3>
              </div>
              <div className="p-4">
                <DataTable
                  columns={[{ label: "Product", key: "name" }, { label: "Category", key: "category" }, { label: "Stock Left", key: "stock" }]}
                  data={lowStockProducts}
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      <WebSocketStatus connected={wsConnected} userRole="Employee" />
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
