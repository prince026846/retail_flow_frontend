import React from 'react';
import LineChart from './LineChart';

const RevenuePerformanceChart = ({ data = [] }) => {
  // Default data for UI display (can be replaced with actual data later)
  const defaultData = [45000, 52000, 48000, 61000, 58000, 67000, 72000, 69000, 75000, 82000, 78000, 85000];
  const chartData = data.length > 0 ? data : defaultData;
  
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Revenue Performance</h3>
          <p className="text-sm text-gray-400 mt-1">Monthly sales trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-400">Revenue</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <LineChart 
          data={chartData} 
          labels={labels}
          color="#3B82F6"
          backgroundColor="rgba(59, 130, 246, 0.1)"
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Average Monthly Revenue</p>
            <p className="text-lg font-semibold text-gray-100">
              ${Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Growth Rate</p>
            <p className="text-lg font-semibold text-green-400">+12.5%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePerformanceChart;
