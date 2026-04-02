import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  Eye,
  Star,
  MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import KPICard from './KPICard';
import { useAuth } from '../context/AuthContext';
import { smartAPI } from '../services/api';

const EmployeePerformance = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  // Get current user info from AuthContext
  useEffect(() => {
    if (user) {
      setUserRole(user.role || '');
      // Use _id field instead of email for employee ID
      setUserId(user._id || user.email || '');
    }
  }, [user]);

  const createDefaultPerformanceData = () => {
    const now = new Date().toISOString();
    return {
      total_sales: 0,
      total_orders: 0,
      average_order_value: 0,
      conversion_rate: 0,
      performance_score: 0,
      trend: 'stable',
      period_start: now,
      period_end: now,
      updated_at: now,
      customer_satisfaction_score: null,
      attendance_rate: null,
      productivity_score: null,
      rank: null,
      metrics: {
        sales_this_month: 0,
        orders_this_month: 0,
        average_daily_sales: 0,
        conversion_rate: 0
      }
    };
  };

  const makeAuthorizedRequest = async (path, options = {}) => {
    const token = sessionStorage.getItem('retailflow_token');
    if (!token) {
      const authError = new Error('Authentication token not found');
      authError.status = 401;
      throw authError;
    }

    return smartAPI.makeRequest(path, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  };

  const fetchJson = async (path, options = {}) => {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 5000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await makeAuthorizedRequest(path, {
        ...options,
        signal: controller.signal
      });

      if (!response.ok) {
        const requestError = new Error(`Request failed (${response.status})`);
        requestError.status = response.status;
        throw requestError;
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const computePerformanceScore = (totalSales, totalOrders, averageOrderValue) => {
    const salesScore = Math.min(50, (totalSales / 5000) * 50);
    const ordersScore = Math.min(30, (totalOrders / 50) * 30);
    const avgOrderScore = Math.min(20, (averageOrderValue / 100) * 20);
    return Number((salesScore + ordersScore + avgOrderScore).toFixed(1));
  };

  const normalizePerformanceData = (data = {}, fallback = createDefaultPerformanceData()) => {
    const totalSales = Number(data.total_sales ?? data.totalRevenue ?? fallback.total_sales ?? 0);
    const totalOrders = Number(data.total_orders ?? data.orderCount ?? fallback.total_orders ?? 0);
    const averageOrderValue = Number(
      data.average_order_value ??
      data.avgOrderValue ??
      (totalOrders > 0 ? totalSales / totalOrders : 0)
    );

    return {
      ...fallback,
      ...data,
      total_sales: totalSales,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      conversion_rate: Number(data.conversion_rate ?? fallback.conversion_rate ?? 0),
      performance_score: Number(
        data.performance_score ??
        fallback.performance_score ??
        computePerformanceScore(totalSales, totalOrders, averageOrderValue)
      ),
      trend: data.trend || fallback.trend || 'stable',
      period_start: data.period_start || data.first_order || fallback.period_start,
      period_end: data.period_end || data.last_order || fallback.period_end,
      updated_at: data.updated_at || new Date().toISOString(),
      customer_satisfaction_score: data.customer_satisfaction_score ?? fallback.customer_satisfaction_score,
      attendance_rate: data.attendance_rate ?? fallback.attendance_rate,
      productivity_score: data.productivity_score ?? fallback.productivity_score,
      rank: data.rank ?? fallback.rank
    };
  };

  const fetchOrdersForEmployee = async (employeeId = userId, limit = 100) => {
    const orders = await fetchJson(`/orders/?page=1&limit=${limit}`, { timeoutMs: 8000 });

    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter((order) => String(order.user_id) === String(employeeId));
  };

  const mapOrdersToSalesHistory = (orders) => {
    return orders
      .map((order) => {
        const productsSold = Array.isArray(order.items)
          ? order.items.map((item) => item.name || item.product_name).filter(Boolean)
          : [];

        return {
          order_id: String(order.id || order.order_id || ''),
          customer_name: order.customer_name || (order.customer_id ? `Customer ${String(order.customer_id).slice(-6)}` : 'Walk-in'),
          sale_amount: Number(order.total_price || 0),
          products_sold: productsSold,
          sale_date: order.created_at || new Date().toISOString(),
          order_status: order.status || 'completed'
        };
      })
      .filter((order) => Boolean(order.order_id))
      .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
  };

  const fetchEmployeePerformance = async (employeeId = userId) => {
    const fallback = createDefaultPerformanceData();

    if (!employeeId) {
      return fallback;
    }

    if (userRole === 'owner') {
      try {
        const response = await makeAuthorizedRequest(`/employees/${employeeId}/performance`);
        if (response.status === 404) {
          return fallback;
        }

        if (!response.ok) {
          const requestError = new Error(`Failed to fetch performance data (${response.status})`);
          requestError.status = response.status;
          throw requestError;
        }

        const data = await response.json();
        return normalizePerformanceData(data, fallback);
      } catch (error) {
        console.warn('Owner performance endpoint unavailable, using order-derived fallback:', error);
      }
    }

    try {
      const employeeOrders = await fetchOrdersForEmployee(employeeId, 100);

      if (!employeeOrders.length) {
        return fallback;
      }

      const totalSales = employeeOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
      const totalOrders = employeeOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthOrders = employeeOrders.filter((order) => new Date(order.created_at) >= monthStart);
      const monthSales = monthOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
      const daysElapsed = Math.max(1, Math.floor((now - monthStart) / (1000 * 60 * 60 * 24)) + 1);

      const orderDates = employeeOrders
        .map((order) => new Date(order.created_at))
        .filter((date) => !Number.isNaN(date.getTime()));

      const firstOrderDate = orderDates.length ? new Date(Math.min(...orderDates)) : now;
      const lastOrderDate = orderDates.length ? new Date(Math.max(...orderDates)) : now;

      return normalizePerformanceData(
        {
          total_sales: totalSales,
          total_orders: totalOrders,
          average_order_value: averageOrderValue,
          performance_score: computePerformanceScore(totalSales, totalOrders, averageOrderValue),
          trend: 'stable',
          period_start: firstOrderDate.toISOString(),
          period_end: lastOrderDate.toISOString(),
          updated_at: now.toISOString(),
          metrics: {
            sales_this_month: monthSales,
            orders_this_month: monthOrders.length,
            average_daily_sales: monthSales / daysElapsed,
            conversion_rate: 0
          }
        },
        fallback
      );
    } catch (error) {
      console.error('Failed to build fallback employee performance:', error);
      return fallback;
    }
  };

  const fetchLeaderboard = async () => {
    const buildSelfEntry = async () => {
      const selfPerformance = performanceData || await fetchEmployeePerformance(userId);
      return [{
        employee_id: userId,
        rank: 1,
        employee_name: user?.name || user?.email || 'Current User',
        employee_email: user?.email || 'N/A',
        total_sales: selfPerformance.total_sales || 0,
        total_orders: selfPerformance.total_orders || 0,
        average_order_value: selfPerformance.average_order_value || 0,
        conversion_rate: selfPerformance.conversion_rate || 0
      }];
    };

    if (userRole !== 'owner') {
      return buildSelfEntry();
    }

    try {
      const data = await fetchJson('/analytics/sales-by-employee?limit=10', { timeoutMs: 8000 });
      const leaderboardRows = (Array.isArray(data) ? data : []).map((employee, index) => ({
        employee_id: String(employee.userId || employee.employee_id || `employee-${index}`),
        rank: index + 1,
        employee_name: employee.username || employee.employee_name || employee.email || 'Unknown',
        employee_email: employee.email || employee.employee_email || 'N/A',
        total_sales: Number(employee.totalRevenue ?? employee.total_sales ?? 0),
        total_orders: Number(employee.orderCount ?? employee.total_orders ?? 0),
        average_order_value: Number(employee.avgOrderValue ?? employee.average_order_value ?? 0),
        conversion_rate: Number(employee.conversion_rate ?? 0)
      }));

      return leaderboardRows.length > 0 ? leaderboardRows : buildSelfEntry();
    } catch (error) {
      if (error.status === 403 || error.status === 404) {
        return buildSelfEntry();
      }
      throw error;
    }
  };

  const fetchSalesHistory = async (employeeId = userId) => {
    const employeeOrders = await fetchOrdersForEmployee(employeeId, 100);
    return mapOrdersToSalesHistory(employeeOrders).slice(0, 20);
  };

  const fetchReviews = async () => {
    // Backend endpoint for performance reviews is not implemented yet.
    // Return empty data and let UI render the placeholder state.
    return [];
  };

  const fetchAnalytics = async () => {
    if (userRole !== 'owner') {
      return null;
    }

    const [workforceData, salesByEmployeeData] = await Promise.all([
      fetchJson('/analytics/workforce', { timeoutMs: 8000 }),
      fetchJson('/analytics/sales-by-employee?limit=200', { timeoutMs: 8000 })
    ]);

    const employees = Array.isArray(salesByEmployeeData) ? salesByEmployeeData : [];
    const totalEmployees = Number(workforceData?.total_employees || 0);
    const totalSales = Number(workforceData?.total_sales || 0);
    const activeEmployees = Number(workforceData?.active_employees || 0);

    const salesDistribution = employees.reduce((acc, employee) => {
      const revenue = Number(employee.totalRevenue || 0);
      if (revenue >= 50000) {
        acc.high_performers += 1;
      } else if (revenue >= 15000) {
        acc.mid_performers += 1;
      } else {
        acc.entry_level += 1;
      }
      return acc;
    }, {
      high_performers: 0,
      mid_performers: 0,
      entry_level: 0
    });

    const topEmployee = employees[0];

    return {
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      total_sales: totalSales,
      average_sales_per_employee: totalEmployees > 0 ? totalSales / totalEmployees : 0,
      performance_trends: [],
      sales_distribution: salesDistribution,
      top_performer: topEmployee ? {
        employee_name: topEmployee.username || topEmployee.email || 'Unknown',
        total_sales: Number(topEmployee.totalRevenue || 0),
        total_orders: Number(topEmployee.orderCount || 0)
      } : null
    };
  };

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        switch (activeTab) {
          case 'overview':
            const performance = await fetchEmployeePerformance();
            setPerformanceData(performance);
            break;
          
          case 'leaderboard':
            const leaderboardData = await fetchLeaderboard();
            setLeaderboard(leaderboardData);
            break;
          
          case 'sales':
            const salesData = await fetchSalesHistory();
            setSalesHistory(salesData);
            break;
          
          case 'reviews':
            const reviewsData = await fetchReviews();
            setReviews(reviewsData);
            break;
          
          case 'analytics':
            if (userRole === 'owner') {
              const analyticsData = await fetchAnalytics();
              setAnalytics(analyticsData);
            }
            break;
        }
      } catch (err) {
        console.error('Error loading data:', err);
        if (activeTab === 'overview') {
          setPerformanceData(createDefaultPerformanceData());
          setError(null);
        } else {
          setError(err.message || 'Failed to load employee performance data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    } else {
      setError('User ID not found. Please log in again.');
      setLoading(false);
    }
  }, [activeTab, userId, userRole]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Number(amount || 0));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }

    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render overview tab
  const renderOverview = () => {
    if (!performanceData) return null;

    const kpis = [
      {
        title: 'Total Sales',
        value: formatCurrency(performanceData.total_sales),
        icon: DollarSign,
        color: 'from-green-500 to-green-600',
        trend: '+12.5%'
      },
      {
        title: 'Total Orders',
        value: performanceData.total_orders,
        icon: ShoppingCart,
        color: 'from-blue-500 to-blue-600',
        trend: '+8.2%'
      },
      {
        title: 'Avg Order Value',
        value: formatCurrency(performanceData.average_order_value),
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600',
        trend: '+3.7%'
      },
      {
        title: 'Conversion Rate',
        value: `${(performanceData.conversion_rate || 0).toFixed(1)}%`,
        icon: Target,
        color: 'from-orange-500 to-orange-600',
        trend: '+1.2%'
      }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <KPICard
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                color={kpi.color}
                trend={kpi.trend}
              />
            </motion.div>
          ))}
        </div>

        {/* Performance Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-medium">
                  {performanceData.customer_satisfaction_score !== undefined && performanceData.customer_satisfaction_score !== null
                    ? `${performanceData.customer_satisfaction_score}/5.0`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Attendance Rate</span>
                <span className="font-medium">
                  {performanceData.attendance_rate !== undefined && performanceData.attendance_rate !== null
                    ? `${performanceData.attendance_rate.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Productivity Score</span>
                <span className="font-medium">
                  {performanceData.productivity_score !== undefined && performanceData.productivity_score !== null
                    ? `${performanceData.productivity_score.toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Rank</span>
                <span className="font-medium">
                  {performanceData.rank !== undefined && performanceData.rank !== null
                    ? `#${performanceData.rank}`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Performance Period
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Period Start</span>
                <span className="font-medium">{formatDate(performanceData.period_start)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Period End</span>
                <span className="font-medium">{formatDate(performanceData.period_end)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">
                  {performanceData.updated_at 
                    ? formatDate(performanceData.updated_at)
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Render leaderboard tab
  const renderLeaderboard = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Sales Leaderboard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((employee, index) => (
                  <motion.tr
                    key={employee.employee_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={employee.employee_id === userId ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {employee.rank === 1 && <Award className="w-5 h-5 text-yellow-500 mr-2" />}
                        {employee.rank === 2 && <Award className="w-5 h-5 text-gray-400 mr-2" />}
                        {employee.rank === 3 && <Award className="w-5 h-5 text-orange-600 mr-2" />}
                        <span className="font-medium">#{employee.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.employee_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employee_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(employee.total_sales)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.total_orders}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(employee.average_order_value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(employee.conversion_rate || 0).toFixed(1)}%
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render sales history tab
  const renderSalesHistory = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
              Recent Sales
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesHistory.map((sale, index) => (
                  <motion.tr
                    key={sale.order_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{sale.order_id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.customer_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(sale.sale_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sale.products_sold.length > 0 
                          ? sale.products_sold.slice(0, 2).join(', ') + 
                            (sale.products_sold.length > 2 ? '...' : '')
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(sale.sale_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${sale.order_status === 'completed' ? 'bg-green-100 text-green-800' : 
                          sale.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {sale.order_status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render reviews tab
  const renderReviews = () => {
    if (!reviews.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Performance Reviews
          </h3>
          <p className="text-gray-600">
            Performance reviews are not available yet. This module will be enabled when the backend endpoint is implemented.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {review.review_type.charAt(0).toUpperCase() + review.review_type.slice(1)} Review
                  </h4>
                  <p className="text-sm text-gray-500">
                    by {review.reviewer_name} on {formatDate(review.review_date)}
                  </p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {review.strengths.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Strengths</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {review.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.areas_for_improvement.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Areas for Improvement</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {review.areas_for_improvement.map((area, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.goals.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Goals</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {review.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.comments && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 italic">
                    "{review.comments}"
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Render analytics tab (owner only)
  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Employees"
            value={analytics.total_employees}
            icon={Users}
            color="from-blue-500 to-blue-600"
          />
          <KPICard
            title="Active Employees"
            value={analytics.active_employees}
            icon={TrendingUp}
            color="from-green-500 to-green-600"
          />
          <KPICard
            title="Total Sales"
            value={formatCurrency(analytics.total_sales)}
            icon={DollarSign}
            color="from-purple-500 to-purple-600"
          />
          <KPICard
            title="Avg Sales/Employee"
            value={formatCurrency(analytics.average_sales_per_employee)}
            icon={Target}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Performance Trends */}
        {analytics.performance_trends.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.performance_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week_start" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [formatCurrency(value), 'Avg Sales']}
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_sales_per_employee" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sales Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.sales_distribution).map(([tier, count]) => (
                <div key={tier} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">
                    {tier.replace('_', ' ')}
                  </span>
                  <span className="font-medium">{count} employees</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performer</h3>
            {analytics.top_performer ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-medium">{analytics.top_performer.employee_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Sales: {formatCurrency(analytics.top_performer.total_sales)}
                </div>
                <div className="text-sm text-gray-600">
                  Orders: {analytics.top_performer.total_orders}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading employee performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Performance</h1>
          <p className="text-gray-600">Track and analyze employee performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'leaderboard', 'sales', 'reviews', ...(userRole === 'owner' ? ['analytics'] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'sales' && renderSalesHistory()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'analytics' && userRole === 'owner' && renderAnalytics()}
      </div>
    </div>
  );
};

export default EmployeePerformance;
