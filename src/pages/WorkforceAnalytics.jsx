import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { getWorkforceAnalytics, getAllEmployees, getEmployeePerformanceById } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const WorkforceAnalytics = () => {
  const { isDark, colors } = useTheme();
  
  const [workforceData, setWorkforceData] = useState({
    total_employees: 0,
    active_employees: 0,
    total_sales: 0
  });
  const [employeesPerformance, setEmployeesPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Load workforce analytics
  const loadWorkforceAnalytics = async () => {
    try {
      const data = await getWorkforceAnalytics();
      setWorkforceData(data);
    } catch (error) {
      console.error('Error loading workforce analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load all employees' performance
  const loadEmployeesPerformance = async () => {
    try {
      const employees = await getAllEmployees();
      
      const performancePromises = employees.map(async (employee) => {
        try {
          const performance = await getEmployeePerformanceById(employee._id);
          return {
            ...employee,
            performance: performance || {
              total_sales: 0,
              total_orders: 0,
              average_order_value: 0,
              performance_score: 0,
              trend: 'stable'
            }
          };
        } catch (error) {
          return {
            ...employee,
            performance: {
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
    } catch (error) {
      console.error('Error loading employees performance:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadWorkforceAnalytics();
    loadEmployeesPerformance();
  }, []);

  const StatCard = ({ title, value, color, icon, trend }) => (
    <div className={`${colors.card} rounded-xl p-6 border ${colors.border} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${colors.textSecondary} text-sm font-medium mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('600', '900')} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const EmployeeCard = ({ employee, index }) => {
    const performance = employee.performance || {};
    const performanceColor = performance.performance_score >= 80 ? 'text-green-400' : 
                           performance.performance_score >= 60 ? 'text-yellow-400' : 'text-red-400';
    
    return (
      <div className={`${colors.card} rounded-lg p-4 border ${colors.border} hover:shadow-md transition-all duration-300`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className={`font-semibold ${colors.text} text-lg`}>
              {employee.name || `Employee ${index + 1}`}
            </h4>
            <p className={`${colors.textSecondary} text-sm`}>{employee.email}</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              employee.role === 'owner' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
            }`}>
              {employee.role}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(performance.total_sales)}
            </div>
            <div className={`${colors.textSecondary} text-sm`}>Total Sales</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className={`${colors.textSecondary}`}>Orders:</span>
            <span className={`ml-2 font-medium ${colors.text}`}>{performance.total_orders}</span>
          </div>
          <div>
            <span className={`${colors.textSecondary}`}>Avg Order:</span>
            <span className={`ml-2 font-medium ${colors.text}`}>{formatCurrency(performance.average_order_value)}</span>
          </div>
          <div>
            <span className={`${colors.textSecondary}`}>Performance:</span>
            <span className={`ml-2 font-medium ${performanceColor}`}>
              {performance.performance_score}/100
            </span>
          </div>
          <div>
            <span className={`${colors.textSecondary}`}>Trend:</span>
            <span className={`ml-2 font-medium ${
              performance.trend === 'up' ? 'text-green-400' :
              performance.trend === 'down' ? 'text-red-400' : `${colors.text}`
            }`}>
              {performance.trend === 'up' ? '📈' :
               performance.trend === 'down' ? '📉' : '➡️'} 
              {performance.trend}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="owner" pageTitle="Workforce Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${colors.text}`}>Workforce Analytics</h1>
            <p className={`${colors.textSecondary} mt-1`}>Monitor employee performance and sales metrics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Employees"
            value={loading ? "..." : workforceData.total_employees}
            color="text-blue-400"
            icon={
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            trend={12}
          />
          <StatCard
            title="Active Employees"
            value={loading ? "..." : workforceData.active_employees}
            color="text-green-400"
            icon={
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={8}
          />
          <StatCard
            title="Total Sales"
            value={loading ? "..." : formatCurrency(workforceData.total_sales)}
            color="text-purple-400"
            icon={
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            trend={15}
          />
        </div>

        {/* Individual Employee Performance */}
        <div className={`${colors.card} rounded-xl border ${colors.border}`}>
          <div className="p-6 border-b ${colors.border}">
            <h2 className={`text-xl font-semibold ${colors.text}`}>Individual Employee Performance</h2>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Detailed performance metrics for each team member</p>
          </div>
          <div className="p-6">
            {loadingEmployees ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className={`ml-3 ${colors.textSecondary}`}>Loading employee performance data...</span>
              </div>
            ) : employeesPerformance.length > 0 ? (
              <div className="space-y-4">
                {employeesPerformance.map((employee, index) => (
                  <EmployeeCard key={employee._id} employee={employee} index={index} />
                ))}
              </div>
            ) : (
              <div className={`text-center ${colors.textSecondary} py-12`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No employee performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${colors.card} rounded-xl p-6 border ${colors.border}`}>
            <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>Performance Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${colors.textSecondary}`}>High Performers (80-100)</span>
                <span className="text-green-400 font-medium">
                  {employeesPerformance.filter(e => e.performance.performance_score >= 80).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colors.textSecondary}`}>Average Performers (60-79)</span>
                <span className="text-yellow-400 font-medium">
                  {employeesPerformance.filter(e => e.performance.performance_score >= 60 && e.performance.performance_score < 80).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colors.textSecondary}`}>Needs Improvement (0-59)</span>
                <span className="text-red-400 font-medium">
                  {employeesPerformance.filter(e => e.performance.performance_score < 60).length}
                </span>
              </div>
            </div>
          </div>

          <div className={`${colors.card} rounded-xl p-6 border ${colors.border}`}>
            <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>Team Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${colors.textSecondary}`}>Average Performance Score</span>
                <span className="text-blue-400 font-medium">
                  {employeesPerformance.length > 0 
                    ? Math.round(employeesPerformance.reduce((acc, e) => acc + e.performance.performance_score, 0) / employeesPerformance.length)
                    : 0}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colors.textSecondary}`}>Total Orders Processed</span>
                <span className="text-purple-400 font-medium">
                  {employeesPerformance.reduce((acc, e) => acc + e.performance.total_orders, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${colors.textSecondary}`}>Average Order Value</span>
                <span className="text-green-400 font-medium">
                  {formatCurrency(
                    employeesPerformance.length > 0 
                      ? employeesPerformance.reduce((acc, e) => acc + e.performance.average_order_value, 0) / employeesPerformance.length
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkforceAnalytics;
