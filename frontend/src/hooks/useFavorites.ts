interface FavoriteItem {
  id: string;
  type: 'product' | 'customer' | 'center';
  name: string;
  details?: string;
  addedAt: string;
}

const STORAGE_KEY = 'aba_favorites';

export const useFavorites = () => {
  const getFavorites = (): FavoriteItem[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const addFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    const favorites = getFavorites();
    const exists = favorites.some(f => f.id === item.id && f.type === item.type);
    
    if (!exists) {
      const newFavorite: FavoriteItem = {
        ...item,
        addedAt: new Date().toISOString(),
      };
      favorites.push(newFavorite);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  };

  const removeFavorite = (id: string, type: string) => {
    const favorites = getFavorites().filter(f => !(f.id === id && f.type === type));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  };

  const isFavorite = (id: string, type: string): boolean => {
    const favorites = getFavorites();
    return favorites.some(f => f.id === id && f.type === type);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    if (isFavorite(item.id, item.type)) {
      removeFavorite(item.id, item.type);
      return false;
    } else {
      addFavorite(item);
      return true;
    }
  };

  const getFavoritesByType = (type: FavoriteItem['type']): FavoriteItem[] => {
    return getFavorites().filter(f => f.type === type);
  };

  const clearFavorites = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    clearFavorites,
  };
};