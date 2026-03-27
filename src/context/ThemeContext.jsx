import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always use dark mode
  const [isDark] = useState(true);

  // Set dark mode class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const theme = {
    isDark,
    colors: {
      // Dark mode colors only
      dark: {
        primary: 'from-purple-500 to-pink-500',
        secondary: 'from-blue-500 to-indigo-500',
        accent: 'from-green-500 to-emerald-500',
        warning: 'from-orange-500 to-red-500',
        background: 'bg-gray-950',
        card: 'bg-gray-900',
        text: 'text-gray-100',
        textSecondary: 'text-gray-400',
        border: 'border-gray-700',
        shadow: 'shadow-black'
      }
    }
  };

  // Always return dark colors
  const colors = theme.colors.dark;

  return (
    <ThemeContext.Provider value={{ isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
