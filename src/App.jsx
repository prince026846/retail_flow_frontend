import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { lazyWithTracking } from './utils/performance';
import OfflineStatus from './components/OfflineStatus';
import InstallPrompt from './components/InstallPrompt';

// Lazy loaded page components with performance tracking
const Login = lazyWithTracking(() => import('./pages/Login'), 'login');
const Register = lazyWithTracking(() => import('./pages/Register'), 'register');
const OwnerDashboard = lazyWithTracking(() => import('./pages/OwnerDashboard'), 'owner-dashboard');
const Analytics = lazyWithTracking(() => import('./pages/Analytics'), 'analytics');
const EmployeeDashboard = lazyWithTracking(() => import('./pages/EmployeeDashboard'), 'employee-dashboard');
const Inventory = lazyWithTracking(() => import('./pages/Inventory'), 'inventory');
const EmailVerification = lazyWithTracking(() => import('./pages/EmailVerification'), 'email-verification');
const ResendVerification = lazyWithTracking(() => import('./pages/ResendVerification'), 'resend-verification');
const PasswordResetRequest = lazyWithTracking(() => import('./pages/PasswordResetRequest'), 'password-reset-request');
const PasswordReset = lazyWithTracking(() => import('./pages/PasswordReset'), 'password-reset');
const AIInsights = lazyWithTracking(() => import('./pages/AIInsights'), 'ai-insights');
const CustomerManagement = lazyWithTracking(() => import('./pages/CustomerManagement'), 'customer-management');
const SupplierManagement = lazyWithTracking(() => import('./pages/SupplierManagement'), 'supplier-management');
const OrdersManagement = lazyWithTracking(() => import('./pages/OrdersManagement'), 'orders-management');
const Settings = lazyWithTracking(() => import('./pages/Settings'), 'settings');
const EmployeeProducts = lazyWithTracking(() => import('./pages/EmployeeProducts'), 'employee-products');
const WorkforceAnalytics = lazyWithTracking(() => import('./pages/WorkforceAnalytics'), 'workforce-analytics');
const OwnerBillSettings = lazyWithTracking(() => import('./pages/OwnerBillSettings'), 'owner-bill-settings');

// Loading component for lazy loaded routes
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Role validation component
function RoleGuard({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== requiredRole) {
    // Redirect to correct dashboard based on user's role
    const correctPath = user.role === 'owner' ? '/owner' : '/employee';
    return <Navigate to={correctPath} replace />;
  }
  
  return children;
}

// Single authentication-aware routing component
function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading only during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes - redirect if already authenticated */}
      <Route 
        path="/login" 
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'owner' ? '/owner' : '/employee'} replace />
          ) : (
            <Suspense fallback={<RouteLoader />}>
              <Login />
            </Suspense>
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'owner' ? '/owner' : '/employee'} replace />
          ) : (
            <Suspense fallback={<RouteLoader />}>
              <Register />
            </Suspense>
          )
        } 
      />
      
      {/* Email Verification Routes - Public */}
      <Route 
        path="/verify-email" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <EmailVerification />
          </Suspense>
        } 
      />
      <Route 
        path="/resend-verification" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <ResendVerification />
          </Suspense>
        } 
      />
      
      {/* Password Reset Routes - Public */}
      <Route 
        path="/password-reset-request" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <PasswordResetRequest />
          </Suspense>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <PasswordReset />
          </Suspense>
        } 
      />
      
      {/* Protected Routes with role guards */}
      <Route 
        path="/owner" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <OwnerDashboard />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <Analytics />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <Inventory />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/business-insights" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <AIInsights />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/customers" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <CustomerManagement />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/suppliers" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <SupplierManagement />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <OrdersManagement />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <Settings />
            </Suspense>
          </RoleGuard>
        } 
      />
<Route 
        path="/employee" 
        element={
          <RoleGuard requiredRole="employee">
            <Suspense fallback={<RouteLoader />}>
              <EmployeeDashboard />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/employee/products" 
        element={
          <RoleGuard requiredRole="employee">
            <Suspense fallback={<RouteLoader />}>
              <EmployeeProducts />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/workforce-analytics" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <WorkforceAnalytics />
            </Suspense>
          </RoleGuard>
        } 
      />
      <Route 
        path="/owner/bill-settings" 
        element={
          <RoleGuard requiredRole="owner">
            <Suspense fallback={<RouteLoader />}>
              <OwnerBillSettings />
            </Suspense>
          </RoleGuard>
        } 
      />
      {/* Root Route - redirect to register by default */}
      <Route 
        path="/" 
        element={
          !isAuthenticated || !user ? (
            <Navigate to="/register" replace />
          ) : (
            <Navigate to={user.role === 'owner' ? '/owner' : '/employee'} replace />
          )
        } 
      />
      
      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <OfflineStatus />
            <InstallPrompt />
            <AppRoutes />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
