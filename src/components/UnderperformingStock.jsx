import React from 'react';

const UnderperformingStock = ({ data = [] }) => {
  // Default data for UI display (can be replaced with actual data later)
  const defaultData = [
    {
      id: 1,
      name: 'Table Lamp',
      category: 'Home & Living',
      stock: 45,
      daysInStock: 120
    },
    {
      id: 2,
      name: 'Winter Scarf',
      category: 'Apparel',
      stock: 78,
      daysInStock: 95
    },
    {
      id: 3,
      name: 'Radio Set',
      category: 'Electronics',
      stock: 23,
      daysInStock: 87
    },
    {
      id: 4,
      name: 'Leather Wallet',
      category: 'Apparel',
      stock: 56,
      daysInStock: 76
    },
    {
      id: 5,
      name: 'Ceramic Vase',
      category: 'Home & Living',
      stock: 34,
      daysInStock: 68
    }
  ];
  
  const tableData = data.length > 0 ? data : defaultData;

  const getDaysInStockColor = (days) => {
    if (days >= 90) return 'text-red-400';
    if (days >= 60) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getDaysInStockBadge = (days) => {
    if (days >= 90) return 'bg-red-500/20 text-red-400';
    if (days >= 60) return 'bg-orange-500/20 text-orange-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  return (
    <div className="data-table">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100">Underperforming Stock</h3>
        <p className="text-sm text-gray-400 mt-1">Items with low sales velocity</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Stock Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Days in Stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tableData.map((product) => (
              <tr key={product.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-100">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-100 mr-2">{product.stock}</span>
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getDaysInStockColor(product.daysInStock)} mr-2`}>
                      {product.daysInStock} days
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDaysInStockBadge(product.daysInStock)}`}>
                      {product.daysInStock >= 90 ? 'Critical' : product.daysInStock >= 60 ? 'Warning' : 'Alert'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            <span className="font-medium text-red-400">{tableData.filter(p => p.daysInStock >= 90).length} critical</span>, 
            <span className="font-medium text-orange-400 ml-1">{tableData.filter(p => p.daysInStock >= 60 && p.daysInStock < 90).length} warning</span> items
          </p>
          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center">
            View recommendations
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderperformingStock;
