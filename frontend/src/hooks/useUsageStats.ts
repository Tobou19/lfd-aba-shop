interface UsageStats {
  totalOrders: number;
  totalCustomers: number;
  lastLogin: string | null;
  appOpens: number;
  offlineTime: number; // en minutes
}

const STORAGE_KEY = 'aba_usage_stats';

export const useUsageStats = () => {
  const getStats = (): UsageStats => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        totalOrders: 0,
        totalCustomers: 0,
        lastLogin: null,
        appOpens: 0,
        offlineTime: 0,
      };
    }
    return JSON.parse(stored);
  };

  const saveStats = (stats: UsageStats) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
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
    localStorage.removeItem(STORAGE_KEY);
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