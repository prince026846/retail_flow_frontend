import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const AIInsights = () => {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  const realtimeAlerts = [
    {
      type: 'critical',
      title: 'Logitech MX Master 3S',
      description: 'Supply chain disruption in Region A-4. Zero stock expected within 48 hours.',
      bgColor: 'bg-gradient-to-r from-red-600 to-pink-600'
    },
    {
      type: 'anomaly',
      title: 'Home Office Category',
      description: 'Sales velocity increased by 400% in downtown sectors. Social trend detected.',
      bgColor: 'bg-gradient-to-r from-purple-600 to-purple-800'
    }
  ];

  const predictiveLogic = [
    {
      type: 'high-priority',
      title: 'Samsung Odyssey G9 will go out of stock in 4 days',
      description: 'Historical Lead Time: 12 days',
      bgColor: 'bg-gradient-to-r from-red-600 to-pink-600',
      borderColor: 'border-red-500'
    },
    {
      type: 'growth',
      title: 'Demand for Mechanical Keyboards forecast to increase by 22%',
      description: 'Impact window: Next week',
      bgColor: 'bg-gradient-to-r from-teal-600 to-green-600',
      borderColor: 'border-green-500'
    },
    {
      type: 'optimization',
      title: 'Clearance for Last-Gen Cables required to free $4.2k',
      description: 'Shelf space reclaimed: 14%',
      bgColor: 'bg-gradient-to-r from-purple-600 to-purple-800',
      borderColor: 'border-purple-500'
    }
  ];

  const restockData = [
    { product: 'MacBook Pro M3 14"', current: '12', recommend: '+24', confidence: '98%' },
    { product: 'Sony WH-1000XMS', current: '4', recommend: '+40', confidence: '92%' },
    { product: 'Razer DeathAdder V3', current: '8', recommend: '+16', confidence: '95%' },
    { product: 'Logitech G Pro X', current: '15', recommend: '+8', confidence: '88%' },
    { product: 'Corsair K70 RGB', current: '6', recommend: '+32', confidence: '91%' }
  ];

  const strategicAdvisor = [
    {
      type: 'Price Adjustment',
      recommendation: 'Increase pricing for RTX 4080 Super by 5% due to high holiday demand and competitor stock depletion.'
    },
    {
      type: 'Optimize Stock',
      recommendation: 'Liquidate Wired Webcams (Gen 1). Dead stock detected. 30% discount recommended for rapid exit.'
    }
  ];

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
              <p className="text-gray-400">Neural forecasting for Q3 Inventory cycles.</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">SYSTEM NOMINAL</span>
            </div>
          </div>

          <div className="relative">
            <div className={`${currentAlert.bgColor} rounded-xl p-6 text-white relative overflow-hidden`}>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{currentAlert.title}</h3>
                <p className="text-gray-100">{currentAlert.description}</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            </div>

            <button
              onClick={prevAlert}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextAlert}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Predictive Logic Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">PREDICTIVE LOGIC</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictiveLogic.map((item, index) => (
              <div key={index} className={`bg-gray-900 rounded-lg p-4 border-l-4 ${item.borderColor}`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${item.bgColor.replace('bg-gradient-to-r from-', 'bg-').split(' ')[0]}`}></div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-xs">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restock Engine Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">RESTOCK ENGINE</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Export Full Manifest →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3 text-gray-400 font-medium text-sm">PRODUCT</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">CURRENT</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">RECOMMEND</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {restockData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 text-white font-medium">{item.product}</td>
                    <td className="py-3 text-gray-300">{item.current}</td>
                    <td className="py-3">
                      <span className="text-green-400 font-medium">{item.recommend}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: item.confidence }}
                          ></div>
                        </div>
                        <span className="text-gray-300 text-sm">{item.confidence}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Advisor Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">STRATEGIC ADVISOR</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategicAdvisor.map((item, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm mb-2">{item.type}</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
