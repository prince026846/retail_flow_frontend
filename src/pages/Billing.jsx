import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ProductSelector from '../components/ProductSelector';
import WebSocketStatus from '../components/WebSocketStatus';
import BillsHistory from '../components/BillsHistory';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { lazyWithTracking } from "../utils/performance";
import websocketService from '../services/websocket';

// Lazy loaded billing component
const BillingCart = lazyWithTracking(() => import('../components/BillingCart'), 'billing-cart');

const BillingLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const Billing = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [view, setView] = useState(isOwner ? 'history' : 'pos');
  const [wsConnected, setWsConnected] = useState(false);

  // WebSocket connection effect
  useEffect(() => {
    const token = sessionStorage.getItem("retailflow_token");
    if (token) {
      websocketService.connect(token)
        .then(() => setWsConnected(true))
        .catch(() => setWsConnected(false));

      return () => {
        websocketService.disconnect();
        setWsConnected(false);
      };
    }
  }, []);

  return (
    <DashboardLayout role={user?.role} pageTitle={view === 'pos' ? "Point of Sale (POS) Billing" : "Billing History"}>
      <div className="space-y-6">
        {/* View Toggle for Owners */}
        {isOwner && (
          <div className="flex justify-end mb-4">
            <div className={`p-1 rounded-xl flex gap-1 ${colors.card} border ${colors.border} shadow-lg`}>
              <button
                onClick={() => setView('history')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${view === 'history' ? 'bg-blue-600 text-white shadow-md active:scale-95' : 'text-gray-400 hover:bg-gray-700/30'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bills History
              </button>
              <button
                onClick={() => setView('pos')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${view === 'pos' ? 'bg-purple-600 text-white shadow-md active:scale-95' : 'text-gray-400 hover:bg-gray-700/30'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Bill (POS)
              </button>
            </div>
          </div>
        )}

        {view === 'pos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8">
              <ProductSelector />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <Suspense fallback={<BillingLoader />}>
                <BillingCart onSaleComplete={() => {}} />
              </Suspense>
            </div>
          </div>
        ) : (
          <BillsHistory />
        )}
      </div>
      
      <WebSocketStatus connected={wsConnected} userRole={user?.role === 'owner' ? 'Owner' : 'Employee'} />
    </DashboardLayout>
  );
};

export default Billing;
