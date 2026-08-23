interface RecentAction {
  id: string;
  type: 'order' | 'customer' | 'search' | 'view';
  description: string;
  timestamp: string;
  details?: any;
}

const STORAGE_KEY = 'aba_recent_actions';
const MAX_RECENT_ACTIONS = 20;

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

export const useRecentActions = () => {
  const getRecentActions = (): RecentAction[] => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const actions = JSON.parse(stored);
      return actions
        .sort((a: RecentAction, b: RecentAction) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, MAX_RECENT_ACTIONS);
    } catch (e) {
      console.error('Error parsing recent actions:', e);
      return [];
    }
  };

  const addRecentAction = (action: Omit<RecentAction, 'id' | 'timestamp'>) => {
    const actions = getRecentActions();
    const newAction: RecentAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
    };
    
    // Remove duplicate if exists
    const filtered = actions.filter(a => 
      !(a.type === action.type && a.description === action.description)
    );
    
    filtered.unshift(newAction);
    const trimmed = filtered.slice(0, MAX_RECENT_ACTIONS);
    
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  };

  const clearRecentActions = () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  };

  const getActionsByType = (type: RecentAction['type']): RecentAction[] => {
    return getRecentActions().filter(a => a.type === type);
  };

  const getRecentSearches = (): string[] => {
    const searchActions = getActionsByType('search');
    return searchActions.map(a => a.description);
  };

  return {
    getRecentActions,
    addRecentAction,
    clearRecentActions,
    getActionsByType,
    getRecentSearches,
  };
};