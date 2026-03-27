import React from 'react';

const ProfitSummary = ({ monthlyVariance = 4250, ytdPerformance = 412800 }) => {
  // Simple bar chart visualization using divs
  const monthlyData = [65, 72, 68, 81, 79, 85, 88, 82, 91, 95, 89, 92];
  const maxValue = Math.max(...monthlyData);

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Profit Summary</h3>
          <p className="text-sm text-gray-400 mt-1">Monthly variance and YTD performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Monthly Variance</p>
            <p className="text-lg font-semibold text-green-400">+${monthlyVariance.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">YTD Performance</p>
            <p className="text-lg font-semibold text-gray-100">${ytdPerformance.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Simple Bar Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-32 px-2">
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
              ${Math.round(ytdPerformance / 12).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Growth Rate</span>
            <span className="text-sm font-semibold text-green-400">+18.2%</span>
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Best Month</span>
            <span className="text-sm font-semibold text-gray-100">October</span>
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Profit Margin</span>
            <span className="text-sm font-semibold text-blue-400">26.1%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSummary;
