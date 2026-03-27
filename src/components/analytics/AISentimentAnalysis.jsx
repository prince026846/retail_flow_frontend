import React from 'react';

const AISentimentAnalysis = ({ loading = false }) => {
  const sentimentData = {
    score: 4.8,
    rating: "Excellent",
    trend: 8,
    description: "Sentiment trending up 8% due to fast fulfillment."
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-16 bg-gray-700 rounded mb-3"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getSentimentColor = (score) => {
    if (score >= 4.5) return 'text-green-400';
    if (score >= 3.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRatingColor = (rating) => {
    if (rating === "Excellent") return 'bg-green-500/20 text-green-400';
    if (rating === "Good") return 'bg-blue-500/20 text-blue-400';
    if (rating === "Fair") return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">AI Sentiment Analysis</h3>
        <p className="text-sm text-gray-400">Customer satisfaction metrics</p>
      </div>
      
      {/* Customer Satisfaction Score */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className={`text-2xl font-bold ${getSentimentColor(sentimentData.score)}`}>
                {sentimentData.score}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(sentimentData.rating)}`}>
            {sentimentData.rating}
          </span>
        </div>
        
        <div className="text-sm text-gray-400">
          CUSTOMER SAT
        </div>
      </div>
      
      {/* Trend Indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center text-green-400">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">+{sentimentData.trend}%</span>
        </div>
      </div>
      
      {/* Description */}
      <div className="text-center">
        <p className="text-sm text-gray-300">{sentimentData.description}</p>
      </div>
      
      {/* Mini Chart */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-end justify-between h-8">
          {[3.2, 3.5, 3.8, 4.1, 4.3, 4.6, 4.8].map((value, index) => (
            <div
              key={index}
              className="w-2 bg-gradient-to-t from-blue-500 to-green-500 rounded-t"
              style={{ height: `${(value / 5) * 32}px` }}
            ></div>
          ))}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">7-day trend</div>
      </div>
    </div>
  );
};

export default AISentimentAnalysis;
