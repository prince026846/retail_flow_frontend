import React from 'react';

const BusinessInsights = () => {
  return (
    <div className="insight-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-500/20 rounded-lg mr-3" role="img" aria-label="Business insights icon">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Business Insights</h3>
            <p className="text-sm text-blue-400">Data-driven recommendations</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
          Active
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 card">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-gray-100 leading-relaxed">
                <span className="font-semibold text-blue-400">15% surge in Electronics demand</span> predicted for next month based on current market trends. Consider increasing stock levels for popular electronic items.
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated 2 hours ago
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 card">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-gray-100 leading-relaxed">
                <span className="font-semibold text-green-400">Optimal pricing opportunity</span> detected for Home & Living category. A 5% price increase could boost revenue without impacting sales volume based on current market analysis.
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated 5 hours ago
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1">
            View all insights
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="text-sm text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessInsights;
