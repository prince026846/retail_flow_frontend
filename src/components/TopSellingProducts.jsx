import React from 'react';

const TopSellingProducts = ({ data = [] }) => {
  // Default data for UI display (can be replaced with actual data later)
  const defaultData = [
    {
      id: 1,
      name: 'Wireless Headphones',
      category: 'Electronics',
      unitsSold: 245,
      revenue: 36750
    },
    {
      id: 2,
      name: 'Running Shoes',
      category: 'Apparel',
      unitsSold: 189,
      revenue: 28350
    },
    {
      id: 3,
      name: 'Smart Watch',
      category: 'Electronics',
      unitsSold: 167,
      revenue: 41750
    },
    {
      id: 4,
      name: 'Office Chair',
      category: 'Home & Living',
      unitsSold: 143,
      revenue: 21450
    },
    {
      id: 5,
      name: 'Charging Pad',
      category: 'Electronics',
      unitsSold: 128,
      revenue: 6400
    }
  ];
  
  const tableData = data.length > 0 ? data : defaultData;

  return (
    <div className="data-table">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100">Top Selling Products</h3>
        <p className="text-sm text-gray-400 mt-1">Best performing items this month</p>
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
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tableData.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-400 text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-100">{product.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  {product.unitsSold.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  ₹{product.revenue.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="font-medium text-gray-300">{tableData.length}</span> products
          </p>
          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center">
            View all products
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopSellingProducts;
