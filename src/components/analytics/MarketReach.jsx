import React from 'react';

const MarketReach = ({ loading = false }) => {
  const marketData = {
    newUsers: 28000,
    description: 'Organic growth from social referrals peaking on weekends.'
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-16 bg-gray-700 rounded mb-3"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Market Reach</h3>
        <p className="text-sm text-gray-400">User acquisition metrics</p>
      </div>
      
      {/* New Users Counter */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-400">
                {formatNumber(marketData.newUsers)}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-2">
          New Users
        </div>
        
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            Growing
          </span>
        </div>
      </div>
      
      {/* Description */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-300">{marketData.description}</p>
      </div>
      
      {/* Mini Chart */}
      <div className="mb-4">
        <div className="flex items-end justify-between h-8">
          {[1200, 1800, 2400, 2200, 2800, 3200, 2800].map((value, index) => (
            <div
              key={index}
              className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
              style={{ height: `${(value / 3200) * 32}px` }}
            ></div>
          ))}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">7-day trend</div>
      </div>
      
      {/* Source Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Social</span>
          </div>
          <span className="text-gray-300">45%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Referral</span>
          </div>
          <span className="text-gray-300">30%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Organic</span>
          </div>
          <span className="text-gray-300">25%</span>
        </div>
      </div>
      
      {/* Growth Rate */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Growth Rate</span>
          <span className="text-green-400 font-medium">+18.5%</span>
        </div>
      </div>
    </div>
  );
};

export default MarketReach;
