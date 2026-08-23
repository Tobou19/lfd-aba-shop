interface UsageStats {
  totalOrders: number;
  totalCustomers: number;
  lastLogin: string | null;
  appOpens: number;
  offlineTime: number; // en minutes
}

const STORAGE_KEY = 'aba_usage_stats';

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
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage error:', e);
    }
  },
};

export const useUsageStats = () => {
  const getStats = (): UsageStats => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        totalOrders: 0,
        totalCustomers: 0,
        lastLogin: null,
        appOpens: 0,
        offlineTime: 0,
      };
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing usage stats:', e);
      return {
        totalOrders: 0,
        totalCustomers: 0,
        lastLogin: null,
        appOpens: 0,
        offlineTime: 0,
      };
    }
  };

  const saveStats = (stats: UsageStats) => {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  };

  const incrementAppOpens = () => {
    const stats = getStats();
    stats.appOpens += 1;
    stats.lastLogin = new Date().toISOString();
    saveStats(stats);
  };

  const incrementOrders = () => {
    const stats = getStats();
    stats.totalOrders += 1;
    saveStats(stats);
  };

  const incrementCustomers = () => {
    const stats = getStats();
    stats.totalCustomers += 1;
    saveStats(stats);
  };

  const trackOfflineTime = (minutes: number) => {
    const stats = getStats();
    stats.offlineTime += minutes;
    saveStats(stats);
  };

  const resetStats = () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  };

  // Auto-increment app opens on mount
  const initTracking = () => {
    incrementAppOpens();
  };

  return {
    getStats,
    incrementAppOpens,
    incrementOrders,
    incrementCustomers,
    trackOfflineTime,
    resetStats,
    initTracking,
  };
};