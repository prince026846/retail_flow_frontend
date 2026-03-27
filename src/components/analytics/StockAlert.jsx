import React from 'react';

const StockAlert = ({ loading = false }) => {
  const stockData = {
    criticalSKUs: 12,
    alertMessage: 'Immediate re-order required for "Quantum Watch" series.'
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

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Stock Alert</h3>
        <p className="text-sm text-gray-400">Inventory status monitoring</p>
      </div>
      
      {/* Critical SKUs Counter */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <div className="relative">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-red-400">
                {stockData.criticalSKUs}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-2">
          SKUs Critical
        </div>
        
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            Action Required
          </span>
        </div>
      </div>
      
      {/* Alert Message */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-300">{stockData.alertMessage}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors duration-200">
          Re-order Now
        </button>
        <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200">
          View Inventory
        </button>
      </div>
      
      {/* Mini Status Bar */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Last checked</span>
          <span className="text-gray-300">2 min ago</span>
        </div>
      </div>
    </div>
  );
};

export default StockAlert;
