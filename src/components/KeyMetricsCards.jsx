import React from 'react';

const KeyMetricsCards = ({ 
  totalRevenue = 124500, 
  netProfit = 32400, 
  totalOrders = 1420, 
  stockHealth = 94,
  revenueChange = 12.5,
  profitChange = 8.2,
  ordersChange = 15.3,
  healthChange = 2.1
}) => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: `+${revenueChange}%`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      change: `+${profitChange}%`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: `+${ordersChange}%`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Stock Health',
      value: `${stockHealth}%`,
      change: `+${healthChange}%`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card card-hover group">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 ${metric.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <div className={metric.iconColor}>
                {metric.icon}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                metric.changeType === 'positive' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {metric.change}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{metric.title}</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-100">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsCards;
