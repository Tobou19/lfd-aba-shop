interface UserPreferences {
  notificationsEnabled: boolean;
  autoSyncEnabled: boolean;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
}

const STORAGE_KEY = 'aba_user_preferences';

const defaultPreferences: UserPreferences = {
  notificationsEnabled: true,
  autoSyncEnabled: true,
  language: 'fr',
  fontSize: 'medium',
};

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

export const useUserPreferences = () => {
  const getPreferences = (): UserPreferences => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultPreferences;
    }
    try {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Error parsing preferences:', e);
      return defaultPreferences;
    }
  };

  const savePreferences = (preferences: UserPreferences) => {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const preferences = getPreferences();
    preferences[key] = value;
    savePreferences(preferences);
  };

  const resetPreferences = () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  };

  return {
    getPreferences,
    savePreferences,
    updatePreference,
    resetPreferences,
  };
};