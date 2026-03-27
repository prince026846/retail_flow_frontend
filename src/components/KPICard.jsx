import React from 'react';

const KPICard = ({ title, value, icon, subtitle, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    green: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30'
    },
    purple: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    },
    orange: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      border: 'border-orange-500/30'
    },
    red: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30'
    },
    primary: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    secondary: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    },
    warning: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      border: 'border-orange-500/30'
    },
    accent: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30'
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="metric-card card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${selectedColor.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <div className={`text-2xl ${selectedColor.text}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              trend.type === 'positive' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={trend.type === 'positive' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                />
              </svg>
              {trend.value}
            </span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        {subtitle && (
          <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
