import React, { useState, useEffect } from 'react';
import { getProfitSummary } from '../services/api';

const ProfitSummary = () => {
  const [data, setData] = useState({
    ytd_performance: 0,
    monthly_variance: 0,
    avg_monthly_profit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getProfitSummary();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch profit summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlyVariance = data.monthly_variance || 0;
  const ytdPerformance = data.ytd_performance || 0;
  const avgMonthlyProfit = data.avg_monthly_profit || 0;

  // Simple bar chart visualization using divs (simulated for now based on performance)
  const monthlyData = [65, 72, 68, 81, 79, 85, 88, 82, 91, 95, 89, 92];
  const maxValue = Math.max(...monthlyData);

  if (loading) {
    return (
      <div className="chart-container bg-gray-800 rounded-xl p-6 h-full flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading profit data...</p>
      </div>
    );
  }

  return (
    <div className="chart-container h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Profit Summary</h3>
          <p className="text-sm text-gray-400 mt-1">Monthly variance and YTD performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Monthly Variance</p>
            <p className={`text-lg font-semibold ${monthlyVariance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthlyVariance >= 0 ? '+' : ''}{monthlyVariance}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">YTD Performance</p>
            <p className="text-lg font-semibold text-gray-100">₹{ytdPerformance.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
      
      {/* Simple Bar Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-24 px-2">
          {monthlyData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div className="w-full bg-gray-700 rounded-t relative group cursor-pointer">
                <div 
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-200 group-hover:from-blue-500 group-hover:to-blue-300"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-gray-100 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {value}%
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-2">
                {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Avg. Monthly Profit</span>
            <span className="text-sm font-semibold text-gray-100">
              ₹{avgMonthlyProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Growth Rate</span>
            <span className={`text-sm font-semibold ${monthlyVariance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthlyVariance >= 0 ? '+' : ''}{monthlyVariance}%
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Profit Margin</span>
            <span className="text-sm font-semibold text-blue-400">26%</span>
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">System Health</span>
            <span className="text-sm font-semibold text-green-400">98%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSummary;
