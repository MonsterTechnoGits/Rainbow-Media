'use client';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { lightTheme, darkTheme } from './index';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme after hydration
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme);
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      // Check system preference
      setMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    setIsHydrated(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  // Listen to system theme changes
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme-mode');
      if (!savedTheme) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isHydrated]);

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
