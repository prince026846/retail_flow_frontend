import React from 'react';

const UnderPerformers = ({ data = [], loading = false }) => {
  // Default data matching the screenshot
  const defaultData = [
    { name: "Legacy Cables 12ml", sales: 12, percentage: 5 },
    { name: "Vintage Adapter Set", sales: 18, percentage: 8 },
    { name: "Classic Mouse Pad", sales: 24, percentage: 12 },
    { name: "Retro Keyboard Cover", sales: 30, percentage: 15 },
    { name: "Old-school USB Hub", sales: 36, percentage: 18 }
  ];

  const performers = data.length > 0 ? data : defaultData;

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatSales = (sales) => {
    if (sales >= 1000) {
      return `${(sales / 1000).toFixed(1)}k sales`;
    }
    return `${sales} sales`;
  };

  const getBarColor = (percentage) => {
    if (percentage <= 10) return 'bg-red-500';
    if (percentage <= 15) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Under-performers</h3>
        <p className="text-sm text-gray-400">Products needing attention</p>
      </div>
      
      <div className="space-y-4">
        {performers.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-400 text-sm font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                <p className="text-gray-400 text-xs">{formatSales(item.sales)}</p>
              </div>
            </div>
            
            <div className="flex items-center ml-4">
              <div className="w-24 bg-gray-700 rounded-full h-2 mr-3 overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(item.percentage)} transition-all duration-500 rounded-full`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="text-white text-sm font-medium w-12 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Sales</span>
          <span className="text-white font-semibold">
            {performers.reduce((sum, item) => sum + item.sales, 0).toLocaleString()} units
          </span>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-orange-400 font-medium">
            ⚠️ Consider discount or promotion
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnderPerformers;
