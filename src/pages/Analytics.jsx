import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAnalytics, getMonthlyRevenue, getCategorySales, getWorstProducts, getThisMonthAnalytics } from "../services/api";
import MonthlySalesVelocityChart from "../components/analytics/MonthlySalesVelocityChart";
import MarginEfficiency from "../components/analytics/MarginEfficiency";
import TopPerformers from "../components/analytics/TopPerformers";
import UnderPerformers from "../components/analytics/UnderPerformers";
import CategorySplit from "../components/analytics/CategorySplit";
import AISentimentAnalysis from "../components/analytics/AISentimentAnalysis";
import StockAlert from "../components/analytics/StockAlert";
import MarketReach from "../components/analytics/MarketReach";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample data that matches the screenshots
  const sampleData = {
    monthlySales: [3.2, 3.5, 3.8, 3.6, 4.0, 4.2, 3.9, 4.1, 4.3, 4.0, 4.2, 4.28],
    topPerformers: [
      { name: "Quantum Pro Watch", sales: 2400, percentage: 85 },
      { name: "Nebulo Audio Kit", sales: 1800, percentage: 75 },
      { name: "Stellar Drone X", sales: 1500, percentage: 65 },
      { name: "Cosmic VR Headset", sales: 1200, percentage: 55 },
      { name: "Infinity Phone Case", sales: 900, percentage: 45 }
    ],
    underPerformers: [
      { name: "Legacy Cables 12ml", sales: 12, percentage: 5 },
      { name: "Vintage Adapter Set", sales: 18, percentage: 8 },
      { name: "Classic Mouse Pad", sales: 24, percentage: 12 },
      { name: "Retro Keyboard Cover", sales: 30, percentage: 15 },
      { name: "Old-school USB Hub", sales: 36, percentage: 18 }
    ],
    categorySplit: [
      { name: "ELECTRONICS", value: 45, color: "#3B82F6" },
      { name: "HOME & LIVING", value: 20, color: "#10B981" },
      { name: "APPAREL", value: 25, color: "#F59E0B" },
      { name: "OTHERS", value: 10, color: "#8B5CF6" }
    ],
    marginEfficiency: {
      revenue: 1200000,
      profit: 420000,
      efficiencyRatio: 75
    }
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const [
          revenueData,
          categoryData,
          topProducts,
          worstProducts,
          thisMonthData,
        ] = await Promise.all([
          getMonthlyRevenue(),
          getCategorySales(),
          getAnalytics(),
          getWorstProducts(),
          getThisMonthAnalytics(),
        ]);

        const categoryColors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1"];
        const totalSalesValue = categoryData.values ? categoryData.values.reduce((a, b) => a + b, 0) : 0;
        
        const transformedCategorySales = (categoryData.labels || []).map((label, index) => {
          const value = categoryData.values[index] || 0;
          const percentage = totalSalesValue > 0 ? Math.round((value / totalSalesValue) * 100) : 0;
          return {
            name: label,
            value: percentage,
            color: categoryColors[index % categoryColors.length]
          };
        });

        setMonthlyRevenue(revenueData.values || []);
        setCategorySales(transformedCategorySales);
        
        // Transform data for components if needed
        setAnalyticsData({
          topPerformers: topProducts || [],
          underPerformers: worstProducts || [],
          marginEfficiency: {
            revenue: thisMonthData.total_revenue || 0,
            profit: (thisMonthData.total_revenue || 0) * 0.26, // Estimate 26% margin as per dashboard
            efficiencyRatio: 75
          }
        });

        setLoading(false);
      } catch (error) {
        console.error("Analytics loading error:", error);
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  return (
    <DashboardLayout role="owner" pageTitle="Market Intelligence">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Market Intelligence</h1>
            <p className="text-gray-400">Real-time performance metrics across all retail channels</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Sales Velocity Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MonthlySalesVelocityChart data={monthlyRevenue} loading={loading} />
        </div>
        
        {/* Margin Efficiency - Takes 1 column */}
        <div>
          <MarginEfficiency data={analyticsData.marginEfficiency} loading={loading} />
        </div>
      </div>

      {/* Middle Row - Top Performers and Under-performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopPerformers data={analyticsData.topPerformers} loading={loading} />
        <UnderPerformers data={analyticsData.underPerformers} loading={loading} />
      </div>

      {/* Bottom Row - Category Split, AI Sentiment, Stock Alert, Market Reach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <CategorySplit data={categorySales} loading={loading} />
        <AISentimentAnalysis loading={loading} />
        <StockAlert loading={loading} />
        <MarketReach loading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
