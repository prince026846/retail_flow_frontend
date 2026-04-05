import React from 'react';
import DoughnutChart from './DoughnutChart';

const CategorySplitChart = ({ data = [], labels = [] }) => {
  // Default data for UI display (can be replaced with actual data later)
  const defaultData = [35, 25, 20, 20];
  const defaultLabels = ['Electronics', 'Apparel', 'Home & Living', 'Others'];
  
  const chartData = data.length > 0 ? data : defaultData;
  const chartLabels = labels.length > 0 ? labels : defaultLabels;
  
  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'];

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Category Split</h3>
          <p className="text-sm text-gray-400 mt-1">Volume distribution by department</p>
        </div>
      </div>
      
      <div className="h-64 flex items-center justify-center">
        <DoughnutChart 
          data={chartData} 
          labels={chartLabels}
          colors={colors}
        />
      </div>
      
      <div className="mt-6 space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {chartLabels.map((label, index) => {
          const total = chartData.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((chartData[index] / total) * 100).toFixed(1) : 0;
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-sm text-gray-300">{label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-100">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySplitChart;
