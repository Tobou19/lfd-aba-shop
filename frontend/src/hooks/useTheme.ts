import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage error:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage error:', e);
    }
  },
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = safeLocalStorage.getItem('aba_theme');
    return (saved as Theme) || 'auto';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'auto') {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? 'light' : 'dark';
    }
    return currentTheme;
  };

  useEffect(() => {
    const updateEffectiveTheme = () => {
      const newTheme = getEffectiveTheme(theme);
      setEffectiveTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    updateEffectiveTheme();

    let interval: NodeJS.Timeout;
    if (theme === 'auto') {
      interval = setInterval(updateEffectiveTheme, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    safeLocalStorage.setItem('aba_theme', newTheme);
  };

  return { theme, effectiveTheme, changeTheme };
};