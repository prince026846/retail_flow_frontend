import React from 'react';

const CategorySplit = ({ data, loading = false }) => {
  const categories = data || [];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded-full mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-700 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate the SVG path for donut chart
  const createDonutPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = 50 + outerRadius * Math.cos(startAngleRad);
    const y1 = 50 + outerRadius * Math.sin(startAngleRad);
    const x2 = 50 + outerRadius * Math.cos(endAngleRad);
    const y2 = 50 + outerRadius * Math.sin(endAngleRad);

    const x3 = 50 + innerRadius * Math.cos(endAngleRad);
    const y3 = 50 + innerRadius * Math.sin(endAngleRad);
    const x4 = 50 + innerRadius * Math.cos(startAngleRad);
    const y4 = 50 + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  // Legend
  const totalValue = categories.reduce((sum, cat) => sum + (Number(cat.value) || 0), 0);
  let currentAngle = -90; // Start from top

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Category Split</h3>
        <p className="text-sm text-gray-400">Revenue volume by category</p>
      </div>
      
      {/* Donut Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
            {categories.map((category, index) => {
              const val = Number(category.value) || 0;
              const slicePercentage = totalValue > 0 ? (val / totalValue) * 100 : 0;
              const startAngle = currentAngle;
              const endAngle = startAngle + (slicePercentage * 360) / 100;
              currentAngle = endAngle;

              return (
                <path
                  key={index}
                  d={createDonutPath(startAngle, endAngle, 30, 45)}
                  fill={category.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center transform rotate-90">
              <div className="text-lg font-bold text-white">TOTAL</div>
              <div className="text-sm text-gray-400">100%</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend with scroll if many categories */}
      <div className="space-y-2 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
        {categories.map((category, index) => {
          const val = Number(category.value) || 0;
          const displayPercentage = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0";
          
          return (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2 group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-gray-300 truncate max-w-[120px]">{category.name}</span>
              </div>
              <span className="text-sm text-white font-medium">{displayPercentage}%</span>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">No data recorded</div>
        )}
      </div>
    </div>
  );
};

export default CategorySplit;
