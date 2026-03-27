import React from 'react';
import LineChart from '../LineChart';

const MonthlySalesVelocityChart = ({ data = [], loading = false }) => {
  // Default data matching the screenshot
  const defaultData = [3.2, 3.5, 3.8, 3.6, 4.0, 4.2, 3.9, 4.1, 4.3, 4.0, 4.2, 4.28];
  const chartData = data.length > 0 ? data : defaultData;
  
  const labels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const currentValue = chartData[chartData.length - 1] || 4.28;
  const previousValue = chartData[chartData.length - 2] || 4.2;
  const growth = ((currentValue - previousValue) / previousValue * 100).toFixed(1);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 h-96">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Monthly Sales Velocity</h3>
          <p className="text-sm text-gray-400">Aggregate performance over 12 months</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">${currentValue}M</div>
          <div className="text-sm text-green-400">+{growth}% vs LY</div>
        </div>
      </div>
      
      <div className="h-64">
        <LineChart 
          data={chartData} 
          labels={labels}
          color="#3B82F6"
          backgroundColor="rgba(59, 130, 246, 0.1)"
          strokeWidth={3}
          showGrid={true}
          showDots={true}
          dotColor="#3B82F6"
          gridColor="rgba(255, 255, 255, 0.1)"
          textColor="#9CA3AF"
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Monthly Revenue</span>
          </div>
          <div className="text-gray-400">
            Average: ${(chartData.reduce((a, b) => a + b, 0) / chartData.length).toFixed(2)}M
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesVelocityChart;
