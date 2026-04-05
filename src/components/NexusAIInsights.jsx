import React, { useState, useEffect } from 'react';
import { getNexusInsights } from '../services/api';

const BusinessInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await getNexusInsights();
        setInsights(data || []);
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getIntensityColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-400';
      case 'success': return 'bg-green-400';
      case 'danger': return 'bg-red-400';
      default: return 'bg-blue-400';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'danger': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="insight-card h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-500/20 rounded-lg mr-3" role="img" aria-label="Business insights icon">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">AI Strategic Advisor</h3>
            <p className="text-sm text-blue-400">Data-driven Nexus Intelligence</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
          Nexus AI Active
        </div>
      </div>
      
      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4 text-sm font-medium">Nexus is crunching data...</p>
          </div>
        ) : insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={insight.id || index} className="p-4 card bg-gray-800/40 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start">
                <div className={`w-2.5 h-2.5 ${getIntensityColor(insight.type)} rounded-full mt-1.5 mr-4 flex-shrink-0 shadow-lg`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${getIconColor(insight.type)}`}>
                      {insight.title}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">IMPACT: {insight.impact || 'MEDIUM'}</span>
                  </div>
                  <p className="text-sm text-gray-100 leading-relaxed font-medium">
                    {insight.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No strategic insights available at this moment.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-800/50">
        <button className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter flex items-center group transition-colors">
          View All Strategy
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <span className="text-[10px] text-gray-600 font-mono">NEXUS-V2.1-ACTIVE</span>
      </div>
    </div>
  );
};

export default BusinessInsights;
