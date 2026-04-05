import React from 'react';

const StockAlerts = ({ lowStockItems = [], deadStockItems = [] }) => {
  const lowStockCount = lowStockItems.length;
  const deadStockCount = deadStockItems.length;

  return (
    <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
      {/* Low Stock Alert */}
      <div className="alert-card alert-low-stock card-hover group">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-gray-50 transition-colors duration-200">Low Stock</h3>
              <p className="text-sm text-orange-400">Items needing immediate restock</p>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-2xl font-bold text-orange-400 group-hover:text-orange-300 transition-colors duration-200">{lowStockCount}</p>
            <p className="text-xs text-gray-400">Items</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {lowStockItems.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 card card-hover group">
              <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">{item.name}</span>
              <span className="text-xs text-orange-400 font-medium bg-orange-500/20 px-2 py-1 rounded-full">{item.stock} left</span>
            </div>
          ))}
          {lowStockCount === 0 && (
            <div className="text-sm text-gray-500 text-center py-2 italic font-medium">Inventory levels healthy.</div>
          )}
        </div>
        
        <button className="w-full mt-4 btn-warning">
          View All Low Stock Items
        </button>
      </div>

      {/* Underperforming Alert (Replacing Dead Stock with real logic) */}
      <div className="alert-card alert-dead-stock card-hover group">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/20 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-gray-50 transition-colors duration-200">Stagnant Stock</h3>
              <p className="text-sm text-red-400">High stock, Zero sales (30d+)</p>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-2xl font-bold text-red-400 group-hover:text-red-300 transition-colors duration-200">{deadStockCount}</p>
            <p className="text-xs text-gray-400">Items</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {deadStockItems.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 card card-hover group">
              <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">{item.name}</span>
              <span className="text-xs text-red-400 font-medium bg-red-500/20 px-2 py-1 rounded-full">{item.stock} in stock</span>
            </div>
          ))}
          {deadStockCount === 0 && (
            <div className="text-sm text-gray-500 text-center py-2 italic font-medium">Optimal stock velocity maintained.</div>
          )}
        </div>
        
        <button className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 hover:shadow-glow-orange">
          Inventory Analytics
        </button>
      </div>
    </div>
  );
};

export default StockAlerts;
