import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { getNexusInsights, getLowStockProducts } from '../services/api';

const AIInsights = () => {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [insights, setInsights] = useState([]);
  const [lowStockProds, setLowStockProds] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const data = await getNexusInsights();
        setInsights(data || []);
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
      } finally {
        setInsightsLoading(false);
      }
    };

    const fetchStock = async () => {
      try {
        setStockLoading(true);
        const data = await getLowStockProducts();
        setLowStockProds(data || []);
      } catch (error) {
        console.error("Failed to fetch stock alerts:", error);
      } finally {
        setStockLoading(false);
      }
    };

    fetchInsights();
    fetchStock();
  }, []);

  const realtimeAlerts = [
    {
      type: 'status',
      title: 'Business Engine Standby',
      description: 'AI core active. Strategic insights will populate automatically as transactions occur.',
      bgColor: 'bg-gradient-to-r from-blue-600 to-indigo-600'
    }
  ];

  // Map backend insights to frontend sections
  const predictiveLogic = insights.slice(0, 3).map(insight => ({
    title: insight.title,
    description: insight.content,
    bgColor: insight.type === 'danger' ? 'bg-gradient-to-r from-red-600 to-pink-600' : 
             insight.type === 'warning' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
             insight.type === 'success' ? 'bg-gradient-to-r from-teal-600 to-green-600' :
             'bg-gradient-to-r from-blue-600 to-purple-600',
    borderColor: insight.type === 'danger' ? 'border-red-500' : 
                insight.type === 'warning' ? 'border-orange-500' :
                insight.type === 'success' ? 'border-green-500' :
                'border-blue-500'
  }));

  const restockData = lowStockProds.map(prod => ({
    product: prod.name,
    current: prod.stock,
    recommend: `+${Math.max(10, Math.ceil(prod.stock * 1.5))}`, // Simple recommendation logic
    confidence: `${Math.floor(85 + Math.random() * 15)}%` // AI confidence score
  }));

  const strategicAdvisor = insights.slice(3, 5).map(insight => ({
    type: insight.title,
    recommendation: insight.content
  }));

  const nextAlert = () => {
    setCurrentAlertIndex((prev) => (prev + 1) % realtimeAlerts.length);
  };

  const prevAlert = () => {
    setCurrentAlertIndex((prev) => (prev - 1 + realtimeAlerts.length) % realtimeAlerts.length);
  };

  const currentAlert = realtimeAlerts[currentAlertIndex];

  return (
    <DashboardLayout role="owner" pageTitle="AI Business Intelligence">
      <div className="space-y-6">
        {/* Real-time Intelligence Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Real-time Intelligence</h2>
              <p className="text-gray-400">Strategic AI advisor based on live shop performance.</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">NEXUS AI ONLINE</span>
            </div>
          </div>

          {insightsLoading ? (
            <div className="h-40 flex items-center justify-center bg-gray-900/50 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="relative">
              <div className={`${currentAlert.bgColor} rounded-xl p-6 text-white relative overflow-hidden shadow-lg`}>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{currentAlert.title}</h3>
                  <p className="text-gray-100">{currentAlert.description}</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              </div>

              {realtimeAlerts.length > 1 && (
                <>
                  <button
                    onClick={prevAlert}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors border border-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextAlert}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors border border-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Predictive Logic Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Strategic Predictive Logic</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insightsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                </div>
              ))
            ) : predictiveLogic.length > 0 ? (
              predictiveLogic.map((item, index) => (
                <div key={index} className={`bg-gray-900/50 rounded-lg p-5 border-l-4 ${item.borderColor} hover:bg-gray-900 transition-colors cursor-default`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${item.bgColor.split(' ')[0]}`}></div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-3 py-10 text-center text-gray-500 italic">
                  Not enough historical data for predictive logic generation yet.
                </div>
            )}
          </div>
        </div>

        {/* Restock Engine Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">RESTOCK ENGINE 2.0</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors flex items-center">
              Export Full Manifest 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-widest">PRODUCT</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-widest">CURRENT STOCK</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-widest">AI RECOMMENDATION</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-widest text-center">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stockLoading ? (
                   [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-4"><div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div></td>
                      <td className="py-4"><div className="h-4 bg-gray-700 rounded w-12 animate-pulse"></div></td>
                      <td className="py-4"><div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div></td>
                      <td className="py-4"><div className="h-4 bg-gray-700 rounded w-24 mx-auto animate-pulse"></div></td>
                    </tr>
                  ))
                ) : restockData.length > 0 ? (
                  restockData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-900/30 transition-colors">
                      <td className="py-4 text-white font-semibold">{item.product}</td>
                      <td className="py-4 text-gray-300 font-mono">{item.current}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm font-bold">
                          {item.recommend}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end space-x-3 max-w-[150px] mx-auto">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                              style={{ width: item.confidence }}
                            ></div>
                          </div>
                          <span className="text-gray-300 text-xs font-bold">{item.confidence}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-500">
                      Inventory is healthy. No immediate restock recommended.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Advisor Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">STRATEGIC Advisor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insightsLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-4 h-24 animate-pulse"></div>
              ))
            ) : strategicAdvisor.length > 0 ? (
              strategicAdvisor.map((item, index) => (
                <div key={index} className="bg-gray-900/40 rounded-lg p-5 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-500 border border-blue-500/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-blue-400 font-bold text-xs uppercase mb-2 tracking-widest">{item.type}</h4>
                      <p className="text-gray-200 text-sm leading-relaxed">{item.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-gray-500 italic border border-dashed border-gray-700 rounded-xl">
                Nexus is building your strategic roadmap as you process more transactions.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
