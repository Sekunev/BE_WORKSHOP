'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'red';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // LocalStorage'dan tema bilgisini al
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Önceki tema class'larını temizle
    root.classList.remove('light', 'dark', 'blue', 'green', 'purple', 'red');
    
    // Yeni tema class'ını ekle
    root.classList.add(newTheme);
    
    // CSS değişkenlerini güncelle
    const themes = {
      light: {
        '--primary': 'oklch(0.21 0.034 264.665)',
        '--primary-foreground': 'oklch(0.985 0.002 247.839)',
        '--secondary': 'oklch(0.967 0.003 264.542)',
        '--secondary-foreground': 'oklch(0.21 0.034 264.665)',
        '--accent': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--accent-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
        '--ring': 'oklch(0.5 0.2 240)',             // EKLENMELİ
        '--muted': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--muted-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
      },
      dark: {
        '--primary': 'oklch(0.928 0.006 264.531)',
        '--primary-foreground': 'oklch(0.21 0.034 264.665)',
        '--secondary': 'oklch(0.278 0.033 256.848)',
        '--secondary-foreground': 'oklch(0.985 0.002 247.839)',
        '--accent': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--accent-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
        '--ring': 'oklch(0.5 0.2 240)',             // EKLENMELİ
        '--muted': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--muted-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
      },
      blue: {
        '--primary': 'oklch(0.5 0.2 240)',
        '--primary-foreground': 'oklch(0.98 0.002 247.839)',
        '--secondary': 'oklch(0.9 0.05 240)',
        '--secondary-foreground': 'oklch(0.2 0.034 264.665)',
        '--accent': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--accent-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
        '--ring': 'oklch(0.5 0.2 240)',             // EKLENMELİ
        '--muted': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--muted-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
      },
      green: {
        '--primary': 'oklch(0.5 0.2 140)',
        '--primary-foreground': 'oklch(0.98 0.002 247.839)',
        '--secondary': 'oklch(0.9 0.05 140)',
        '--secondary-foreground': 'oklch(0.2 0.034 264.665)',
        '--accent': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--accent-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
        '--ring': 'oklch(0.5 0.2 240)',             // EKLENMELİ
        '--muted': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--muted-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
      },
      purple: {
        '--primary': 'oklch(0.5 0.2 280)',
        '--primary-foreground': 'oklch(0.98 0.002 247.839)',
        '--secondary': 'oklch(0.9 0.05 280)',
        '--secondary-foreground': 'oklch(0.2 0.034 264.665)',
        '--accent': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--accent-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
        '--ring': 'oklch(0.5 0.2 240)',             // EKLENMELİ
        '--muted': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--muted-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
      },
      red: {
        '--primary': 'oklch(0.5 0.2 20)',
        '--primary-foreground': 'oklch(0.98 0.002 247.839)',
        '--secondary': 'oklch(0.9 0.05 20)',
        '--secondary-foreground': 'oklch(0.2 0.034 264.665)',
        '--accent': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--accent-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
        '--ring': 'oklch(0.5 0.2 240)',             // EKLENMELİ
        '--muted': 'oklch(0.9 0.05 240)',           // EKLENMELİ
        '--muted-foreground': 'oklch(0.2 0.034 264.665)', // EKLENMELİ
      },
    };

    const themeColors = themes[newTheme];
    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
