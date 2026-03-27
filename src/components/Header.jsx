import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = ({ role, pageTitle, onMenuClick, showMenuButton = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  // Use actual logged-in user data
  const displayName = user?.name || 'User';
  const displayRole = user?.role === 'owner' ? 'Owner' : 'Employee';
  
  return (
    <header className={`${colors.card} border-b ${colors.border} px-4 lg:px-6 py-3 lg:py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Bar - Prominent position */}
          <div className="relative max-w-lg flex-1 hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-4 w-4 ${colors.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full text-sm ${isDark ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              placeholder="Search customers, products, orders..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <button onClick={onMenuClick} className={`md:hidden p-2 ${colors.textSecondary} hover:${colors.text} ${isDark ? 'hover:bg-gray-100' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Notification Icons - Cleaner design */}
          <div className="hidden md:flex items-center space-x-1">
            <button className={`relative p-2 ${colors.textSecondary} hover:${colors.text} ${isDark ? 'hover:bg-gray-100' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200 group`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            
            <button className={`relative p-2 ${colors.textSecondary} hover:${colors.text} ${isDark ? 'hover:bg-gray-100' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200 group`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            </button>
          </div>
          
          {/* User Avatar - Cleaner */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block text-right">
              <p className={`text-sm font-semibold ${colors.text}`}>
                {displayName}
              </p>
              <p className={`text-xs ${colors.textSecondary}`}>{displayRole}</p>
            </div>
            
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Logout Button - Simplified */}
          <button
            onClick={handleLogout}
            className={`hidden lg:block px-3 py-1.5 text-xs font-medium ${colors.textSecondary} ${colors.border} rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200`}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
