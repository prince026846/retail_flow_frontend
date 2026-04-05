import React from 'react';

const MarginEfficiency = ({ data = {}, loading = false }) => {
  const { revenue = 0, profit = 0, efficiencyRatio = 0 } = data;

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 h-96">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const getEfficiencyColor = (ratio) => {
    if (ratio >= 70) return 'bg-green-500';
    if (ratio >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEfficiencyLabel = (ratio) => {
    if (ratio >= 70) return 'Optimal';
    if (ratio >= 50) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-96 flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Margin Efficiency</h3>
        <p className="text-sm text-gray-400">Revenue vs Profit analysis</p>
      </div>
      
      {/* Bar Chart */}
      <div className="flex-1 flex items-end justify-center space-x-8 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div 
              className="w-16 bg-blue-500 rounded-t-lg transition-all duration-500"
              style={{ height: `${Math.min((revenue / 1500000) * 200, 200)}px` }}
            ></div>
            <div className="text-center mt-2">
              <div className="text-white font-semibold text-lg">{formatCurrency(revenue)}</div>
              <div className="text-gray-400 text-sm">Revenue</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative">
            <div 
              className="w-16 bg-green-500 rounded-t-lg transition-all duration-500"
              style={{ height: `${Math.min((profit / 500000) * 200, 200)}px` }}
            ></div>
            <div className="text-center mt-2">
              <div className="text-white font-semibold text-lg">{formatCurrency(profit)}</div>
              <div className="text-gray-400 text-sm">Profit</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Efficiency Ratio */}
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Efficiency Ratio</span>
          <span className="text-sm font-medium text-white">{efficiencyRatio}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${getEfficiencyColor(efficiencyRatio)} transition-all duration-500 rounded-full`}
            style={{ width: `${efficiencyRatio}%` }}
          ></div>
        </div>
        <div className="mt-2 text-center">
          <span className={`text-xs font-medium ${
            efficiencyRatio >= 70 ? 'text-green-400' : 
            efficiencyRatio >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {getEfficiencyLabel(efficiencyRatio)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarginEfficiency;
