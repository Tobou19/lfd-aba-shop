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

export const useUserPreferences = () => {
  const getPreferences = (): UserPreferences => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultPreferences;
    }
    return { ...defaultPreferences, ...JSON.parse(stored) };
  };

  const savePreferences = (preferences: UserPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
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
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    getPreferences,
    savePreferences,
    updatePreference,
    resetPreferences,
  };
};