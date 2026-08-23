import { useState, useEffect } from 'react';
import { offlineStorage } from '../utils/offlineStorage';

interface SearchResult {
  type: 'product' | 'customer' | 'center' | 'order';
  id: string;
  name: string;
  details?: string;
}

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchInLocalData = () => {
      const searchResults: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Rechercher dans les produits en cache
      const products = offlineStorage.getCachedProducts();
      if (products) {
        products.forEach((product: any) => {
          if (product.nom?.toLowerCase().includes(lowerQuery)) {
            searchResults.push({
              type: 'product',
              id: product.id,
              name: product.nom,
              details: `${product.prix} FCFA - ${product.disponible ? 'Disponible' : 'Rupture'}`,
            });
          }
        });
      }

      // Rechercher dans les centres en cache
      const centers = offlineStorage.getCachedCenters();
      if (centers) {
        centers.forEach((center: any) => {
          if (center.nom?.toLowerCase().includes(lowerQuery) || 
              center.ville?.toLowerCase().includes(lowerQuery)) {
            searchResults.push({
              type: 'center',
              id: center.id,
              name: center.nom,
              details: center.ville,
            });
          }
        });
      }

      // Rechercher dans les clients locaux
      const customers = offlineStorage.getCustomers();
      customers.forEach((customer) => {
        if (customer.nomComplet?.toLowerCase().includes(lowerQuery) ||
            customer.telephone?.includes(lowerQuery)) {
          searchResults.push({
            type: 'customer',
            id: customer.id,
            name: customer.nomComplet,
            details: customer.telephone,
          });
        }
      });

      setResults(searchResults.slice(0, 10)); // Limiter à 10 résultats
    };

    const timeoutId = setTimeout(searchInLocalData, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return '📦';
      case 'customer': return '👤';
      case 'center': return '🏢';
      case 'order': return '📋';
      default: return '🔍';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Ici, vous pouvez naviguer vers la page appropriée
    console.log('Naviguer vers:', result);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
        zIndex: 10000,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher produits, clients, centres..."
            autoFocus
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
          />
          <kbd style={{ 
            padding: '4px 8px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '12px',
            marginLeft: '8px',
          }}>
            ESC
          </kbd>
        </div>

        {results.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(result)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '24px' }}>{getTypeIcon(result.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{result.name}</div>
                  {result.details && (
                    <div style={{ fontSize: '12px', color: '#666' }}>{result.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            color: '#666' 
          }}>
            Aucun résultat pour "{query}"
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            color: '#666' 
          }}>
            Tapez pour rechercher dans les produits, clients et centres
          </div>
        )}
      </div>
    </div>
  );
};