import React, { useState, useEffect, useMemo, Suspense } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ProductModal from "../components/ProductModal";
import RealTimeNotification from "../components/RealTimeNotification";
import WebSocketStatus from "../components/WebSocketStatus";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency, isLowStock } from "../utils/helpers";
import { getProducts, createProduct, updateProduct, deleteProduct, getThisMonthAnalytics, getAnalytics, getWorstProducts, getLowStockProducts, getMonthlyRevenue, getCategorySales, getWorkforceAnalytics, getAllEmployees, getEmployeePerformanceById } from "../services/api";
import { lazyWithTracking } from "../utils/performance";
import websocketService from '../services/websocket';

// New dashboard components
import KeyMetricsCards from "../components/KeyMetricsCards";
import RevenuePerformanceChart from "../components/RevenuePerformanceChart";
import CategorySplitChart from "../components/CategorySplitChart";
import BusinessInsights from "../components/NexusAIInsights";
import StockAlerts from "../components/StockAlerts";
import ProfitSummary from "../components/ProfitSummary";
import TopSellingProducts from "../components/TopSellingProducts";
import UnderperformingStock from "../components/UnderperformingStock";

// Lazy loaded chart components with performance tracking
const ChartCard = lazyWithTracking(() => import("../components/ChartCard"), 'chart-card');
const LineChart = lazyWithTracking(() => import("../components/LineChart"), 'line-chart');
const DoughnutChart = lazyWithTracking(() => import("../components/DoughnutChart"), 'doughnut-chart');

// Loading component for charts
const ChartLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const OwnerDashboard = () => {
  const { addProduct, updateProduct, deleteProduct } = useAppContext();
  const { colors } = useTheme();

  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [worstSellers, setWorstSellers] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const [revenue, setRevenue] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categorySales, setCategorySales] = useState({ labels: [], values: [] });

  // Workforce analytics state
  const [workforceAnalytics, setWorkforceAnalytics] = useState(null);
  const [loadingWorkforce, setLoadingWorkforce] = useState(false);
  
  // Individual employee performance state
  const [employeesPerformance, setEmployeesPerformance] = useState([]);
  const [loadingEmployeesPerformance, setLoadingEmployeesPerformance] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [wsConnected, setWsConnected] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Products fetch error:", err);
    }
  };

  // =============================
  // LOAD ANALYTICS
  // =============================

  const loadAnalytics = async () => {
    try {
      const [
        thisMonthData,
        bestData,
        worstData,
        lowStockData,
        revenueData,
        categoryData,
      ] = await Promise.all([
        getThisMonthAnalytics(),
        getAnalytics(),
        getWorstProducts(),
        getLowStockProducts(),
        getMonthlyRevenue(),
        getCategorySales(),
      ]);

      setRevenue(thisMonthData.total_revenue ?? 0);
      setItemsSold(thisMonthData.items_sold ?? 0);

      setBestSellers(
        bestData.map((item, i) => ({
          id: i + 1,
          name: item.name,
          category: item.category || "N/A",
          unitsSold: item.unitsSold,
          revenue: item.revenue ?? 0,
          stock: item.stock,
        }))
      );

      setWorstSellers(
        worstData.map((item, i) => ({
          id: i + 1,
          name: item.name,
          category: item.category || "N/A",
          unitsSold: item.unitsSold,
          revenue: item.revenue ?? 0,
          stock: item.stock,
        }))
      );

      setLowStockItems(
        lowStockData.map((item, i) => ({
          id: i + 1,
          name: item.name,
          category: item.category || "N/A",
          stock: item.stock,
          reorderLevel: item.low_stock_threshold ?? 10,
        }))
      );

      setMonthlyRevenue(revenueData.values ?? []);
      setCategorySales({
        labels: categoryData.labels ?? [],
        values: categoryData.values ?? [],
      });
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  // Load workforce analytics
  const loadWorkforceAnalytics = async () => {
    setLoadingWorkforce(true);
    try {
      const data = await getWorkforceAnalytics();
      setWorkforceAnalytics(data);
      console.log('📊 Workforce Analytics loaded:', data);
    } catch (err) {
      console.error("Workforce analytics error:", err);
      setWorkforceAnalytics({
        total_employees: 0,
        active_employees: 0,
        total_sales: 0
      });
    } finally {
      setLoadingWorkforce(false);
    }
  };

  // Load all employees' individual performance
  const loadAllEmployeesPerformance = async () => {
    setLoadingEmployeesPerformance(true);
    try {
      // First get all employees
      const employees = await getAllEmployees();
      console.log('📋 All employees:', employees);
      
      // Then get performance data for each employee
      const performancePromises = employees.map(async (employee) => {
        try {
          const performance = await getEmployeePerformanceById(employee._id);
          return {
            ...employee,
            performance: performance,
            // Provide default performance if none exists
            displayPerformance: performance || {
              total_sales: 0,
              total_orders: 0,
              average_order_value: 0,
              performance_score: 0,
              trend: 'stable'
            }
          };
        } catch (error) {
          console.warn(`No performance data for employee ${employee._id}:`, error.message);
          return {
            ...employee,
            performance: null,
            displayPerformance: {
              total_sales: 0,
              total_orders: 0,
              average_order_value: 0,
              performance_score: 0,
              trend: 'stable'
            }
          };
        }
      });
      
      const results = await Promise.all(performancePromises);
      setEmployeesPerformance(results);
      console.log('📊 All employees performance loaded:', results);
    } catch (err) {
      console.error("Error loading employees performance:", err);
    } finally {
      setLoadingEmployeesPerformance(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadAnalytics();
    loadWorkforceAnalytics();
    loadAllEmployeesPerformance();
  }, []);

  // WebSocket connection effect
  useEffect(() => {
    const token = sessionStorage.getItem("retailflow_token");
    
    console.log('Owner Dashboard WebSocket effect running, token exists:', !!token);
    
    if (token) {
      // Connect to WebSocket
      websocketService.connect(token)
        .then(() => {
          console.log('Owner Dashboard WebSocket connected successfully');
          setWsConnected(true);
        })
        .catch((error) => {
          console.error('Owner Dashboard failed to connect WebSocket:', error);
          setWsConnected(false);
          // Fallback: set up periodic polling if WebSocket fails
          const pollInterval = setInterval(() => {
            console.log('Owner Dashboard polling analytics data as WebSocket fallback');
            loadAnalytics();
          }, 30000); // Poll every 30 seconds
          
          return () => clearInterval(pollInterval);
        });

      // Set up event listeners
      const handleSalesUpdate = (data) => {
        console.log('Owner Dashboard received comprehensive sales update:', data);
        
        // Show notification
        setNotification({
          message: `Sales data updated! Revenue: ₹${data.this_month_revenue?.toFixed(2) || '0'}, Items sold: ${data.this_month_items_sold || '0'}`,
          type: 'success'
        });
        
        // Update basic metrics if available
        if (data.this_month_revenue !== undefined) {
          setRevenue(data.this_month_revenue);
        }
        if (data.this_month_items_sold !== undefined) {
          setItemsSold(data.this_month_items_sold);
        }
        
        // Update chart data if available
        if (data.monthly_revenue && Array.isArray(data.monthly_revenue)) {
          setMonthlyRevenue(data.monthly_revenue);
        }
        
        if (data.category_sales) {
          setCategorySales({
            labels: data.category_sales.labels || [],
            values: data.category_sales.values || [],
          });
        }
        
        // Refresh all analytics to ensure consistency
        loadAnalytics();
      };

      const handleOrderCreated = (data) => {
        console.log('Owner Dashboard received order created notification:', data);
        
        // Show notification
        setNotification({
          message: `New order created! ₹${data.total_price?.toFixed(2) || '0'} - ${data.items_count || 0} items`,
          type: 'success'
        });
        
        // Refresh all analytics when new order is created
        loadAnalytics();
      };

      websocketService.on('sales_update', handleSalesUpdate);
      websocketService.on('order_created', handleOrderCreated);

      // Cleanup on unmount
      return () => {
        console.log('Owner Dashboard cleaning up WebSocket connection');
        websocketService.off('sales_update', handleSalesUpdate);
        websocketService.off('order_created', handleOrderCreated);
        websocketService.disconnect();
        setWsConnected(false);
      };
    } else {
      console.log('Owner Dashboard no token found, WebSocket not connecting');
    }
  }, [])

  // Listen for custom KPI update events from BillingCart (for immediate updates)
  useEffect(() => {
    const handleKpiUpdate = (event) => {
      console.log('Owner Dashboard received KPI update event:', event.detail);
      // Refresh analytics to get the latest data
      loadAnalytics();
    };

    window.addEventListener('kpiUpdate', handleKpiUpdate);
    
    return () => {
      window.removeEventListener('kpiUpdate', handleKpiUpdate);
    };
  }, [])

  // =============================
  // INVENTORY HEALTH
  // =============================

  const inventoryHealth = useMemo(() => {
    if (!products.length) return 0;
    const healthy = products.filter((p) => (p.stock ?? 0) >= 10).length;
    return Math.round((healthy / products.length) * 100);
  }, [products]);

  // =============================
  // PRODUCT ACTIONS
  // =============================

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
    console.log("Sending product:", formData);

    try {
      if (modalMode === "add") {
        await createProduct(formData);
      } else {
        await updateProduct(editingProduct.id, formData);
      }

      setIsModalOpen(false);
      loadProducts();  // refresh table

    } catch (err) {
      console.error("Save product error:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // =============================
  // TABLE COLUMNS
  // =============================

  const productColumns = [
    { label: "#", key: "id" },
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    { label: "Units Sold", key: "unitsSold" },
    { label: "Revenue", key: "revenue", render: (v) => formatCurrency(v ?? 0) },
    { label: "Stock", key: "stock" },
  ];

  const lowStockColumns = [
    { label: "#", key: "id" },
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    {
      label: "Stock",
      key: "stock",
      render: (v, row) => (
        <span className={isLowStock(row) ? "text-danger-600 font-semibold" : ""}>
          {v}{isLowStock(row) && " ⚠️"}
        </span>
      ),
    },
    { label: "Reorder Level", key: "reorderLevel" },
  ];

  const inventoryColumns = [
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price", render: (v) => formatCurrency(v ?? 0) },
    {
      label: "Stock",
      key: "stock",
      render: (v, row) => (
        <span className={isLowStock(row) ? "text-danger-600 font-semibold" : ""}>
          {v}{isLowStock(row) && " ⚠️"}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "id",
      render: (id, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEditProduct(row)} className="text-primary-600">Edit</button>
          <button onClick={() => handleDeleteProduct(id)} className="text-danger-600">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="owner" pageTitle="Dashboard Overview">
      
      {/* Real-time Notification */}
      <RealTimeNotification 
        message={notification.message} 
        type={notification.type} 
      />

      {/* Key Metrics Cards */}
      <KeyMetricsCards 
        totalRevenue={revenue}
        netProfit={Math.round(revenue * 0.26)} // 26% profit margin
        totalOrders={itemsSold}
        stockHealth={inventoryHealth}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Suspense fallback={<ChartLoader />}>
          <RevenuePerformanceChart data={monthlyRevenue} />
        </Suspense>
        <Suspense fallback={<ChartLoader />}>
          <CategorySplitChart data={categorySales.values} labels={categorySales.labels} />
        </Suspense>
      </div>

      {/* Workforce Analytics Section */}
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-4 lg:p-6 mb-6 lg:mb-8`}>
        <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>Workforce Analytics</h3>
        {loadingWorkforce ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className={`ml-3 ${colors.textSecondary}`}>Loading workforce data...</span>
          </div>
        ) : workforceAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${colors.card} rounded-lg p-4 border ${colors.border} hover:shadow-md transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{workforceAnalytics.total_employees}</div>
                  <div className={`text-sm ${colors.textSecondary}`}>Total Employees</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-900 bg-opacity-20">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className={`${colors.card} rounded-lg p-4 border ${colors.border} hover:shadow-md transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{workforceAnalytics.active_employees}</div>
                  <div className={`text-sm ${colors.textSecondary}`}>Active Employees</div>
                </div>
                <div className="p-3 rounded-lg bg-green-900 bg-opacity-20">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className={`${colors.card} rounded-lg p-4 border ${colors.border} hover:shadow-md transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{formatCurrency(workforceAnalytics.total_sales)}</div>
                  <div className={`text-sm ${colors.textSecondary}`}>Total Sales</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-900 bg-opacity-20">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center ${colors.textSecondary} py-8`}>
            No workforce data available
          </div>
        )}
      </div>

      {/* Individual Employee Performance Section */}
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-4 lg:p-6 mb-6 lg:mb-8`}>
        <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>Individual Employee Performance</h3>
        {loadingEmployeesPerformance ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className={`ml-3 ${colors.textSecondary}`}>Loading employee performance data...</span>
          </div>
        ) : employeesPerformance.length > 0 ? (
          <div className="space-y-4">
            {employeesPerformance.map((employee, index) => (
              <div key={employee._id} className={`${colors.card} rounded-lg p-4 border ${colors.border} hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className={`font-semibold ${colors.text}`}>
                      {employee.name || `Employee ${index + 1}`}
                    </h4>
                    <p className={`text-sm ${colors.textSecondary}`}>{employee.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      employee.role === 'owner' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {employee.role}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(employee.displayPerformance.total_sales)}
                    </div>
                    <div className={`text-sm ${colors.textSecondary}`}>Total Sales</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className={`${colors.textSecondary}`}>Orders:</span>
                    <span className={`ml-2 font-medium ${colors.text}`}>{employee.displayPerformance.total_orders}</span>
                  </div>
                  <div>
                    <span className={`${colors.textSecondary}`}>Avg Order:</span>
                    <span className={`ml-2 font-medium ${colors.text}`}>{formatCurrency(employee.displayPerformance.average_order_value)}</span>
                  </div>
                  <div>
                    <span className={`${colors.textSecondary}`}>Performance:</span>
                    <span className={`ml-2 font-medium ${
                      employee.displayPerformance.performance_score >= 80 ? 'text-green-400' :
                      employee.displayPerformance.performance_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {employee.displayPerformance.performance_score}/100
                    </span>
                  </div>
                  <div>
                    <span className={`${colors.textSecondary}`}>Trend:</span>
                    <span className={`ml-2 font-medium ${
                      employee.displayPerformance.trend === 'up' ? 'text-green-400' :
                      employee.displayPerformance.trend === 'down' ? 'text-red-400' : `${colors.text}`
                    }`}>
                      {employee.displayPerformance.trend === 'up' ? '📈' :
                       employee.displayPerformance.trend === 'down' ? '📉' : '➡️'} 
                      {employee.displayPerformance.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center ${colors.textSecondary} py-8`}>
            No employee performance data available
          </div>
        )}
      </div>

      {/* Business Insights and Stock Alerts - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="lg:col-span-2">
          <BusinessInsights />
        </div>
        <div>
          <ProfitSummary />
        </div>
      </div>

      {/* Stock Alerts - Full width on mobile */}
      <div className="mb-6 lg:mb-8">
        <StockAlerts lowStockCount={lowStockItems.length} />
      </div>

      {/* Tables Row - Stack on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <TopSellingProducts data={bestSellers} />
        <UnderperformingStock data={worstSellers} />
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={modalMode}
      />

      {/* WebSocket Status Indicator */}
      <WebSocketStatus connected={wsConnected} userRole="Owner" />

    </DashboardLayout>
  );
};

export default OwnerDashboard;
