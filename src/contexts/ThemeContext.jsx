import { createContext, useContext, useState, useEffect } from 'react';
import useCriticalStyles from '../hooks/useCriticalStyles';
import PropTypes from 'prop-types';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Provider untuk mengelola dark/light mode
 * Menggunakan useState dan useEffect untuk persist theme
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Load theme dari localStorage atau default ke 'light'
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Inject critical CSS early to prevent FOUC
  useCriticalStyles(theme);

  // Apply theme ke document saat theme berubah
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook untuk menggunakan ThemeContext
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;
