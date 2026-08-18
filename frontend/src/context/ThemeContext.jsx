import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(() => {
    const saved = localStorage.getItem('fintrack_theme_mode');
    if (saved && ['light', 'dark', 'system'].includes(saved)) return saved;
    // Fallback check legacy
    const legacy = localStorage.getItem('fintrack_theme');
    if (legacy === 'dark' || legacy === 'light') return legacy;
    return 'system';
  });

  const [activeTheme, setActiveTheme] = useState('light');

  const setThemeMode = (mode) => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeModeState(mode);
      localStorage.setItem('fintrack_theme_mode', mode);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'dark') {
        isDark = true;
      } else if (themeMode === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        setActiveTheme('dark');
      } else {
        root.classList.remove('dark');
        setActiveTheme('light');
      }
    };

    applyTheme();

    const listener = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      setThemeMode, 
      isDark: activeTheme === 'dark',
      toggleTheme: () => setThemeMode(activeTheme === 'dark' ? 'light' : 'dark')
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
