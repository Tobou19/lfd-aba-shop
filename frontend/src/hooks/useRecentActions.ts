interface RecentAction {
  id: string;
  type: 'order' | 'customer' | 'search' | 'view';
  description: string;
  timestamp: string;
  details?: any;
}

const STORAGE_KEY = 'aba_recent_actions';
const MAX_RECENT_ACTIONS = 20;

export const useRecentActions = () => {
  const getRecentActions = (): RecentAction[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const actions = JSON.parse(stored);
    return actions
      .sort((a: RecentAction, b: RecentAction) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, MAX_RECENT_ACTIONS);
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
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  };

  const clearRecentActions = () => {
    localStorage.removeItem(STORAGE_KEY);
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