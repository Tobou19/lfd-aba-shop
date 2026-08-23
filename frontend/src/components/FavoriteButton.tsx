import { useState, useEffect, useCallback } from 'react';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  id: string;
  type: 'product' | 'customer' | 'center';
  name: string;
  details?: string;
}

export const FavoriteButton = ({ id, type, name, details }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(id, type));
  }, [id, type]); // Retiré isFavorite des dépendances

  const handleToggle = useCallback(() => {
    const newState = toggleFavorite({ id, type, name, details });
    setIsFav(newState);
  }, [id, type, name, details, toggleFavorite]);

  return (
    <button
      onClick={handleToggle}
      style={{
        padding: '8px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        opacity: isFav ? 1 : 0.5,
        transition: 'opacity 0.2s',
      }}
      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFav ? '⭐' : '☆'}
    </button>
  );
};