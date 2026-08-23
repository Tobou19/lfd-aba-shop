const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function apiFetch(path: string, options: RequestInit = {}, forceOnline = false) {
  const isOnline = navigator.onLine;
  
  // En mode hors connexion, essayer le cache local
  if (!isOnline && !forceOnline) {
    const cachedData = getFromCache(path);
    if (cachedData) {
      return cachedData;
    }
    
    // Pour les requêtes POST/PUT/DELETE hors connexion, stocker pour synchronisation
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      throw new Error('HORS_CONNEXION');
    }
    
    throw new Error('Aucune donnée disponible hors connexion');
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Erreur API (${res.status})`);
    }
    
    const data = await res.json();
    
    // Mettre en cache les données GET
    if (!options.method || options.method === 'GET') {
      saveToCache(path, data);
    }
    
    return data;
  } catch (error) {
    // En cas d'erreur réseau, essayer le cache
    if (!forceOnline) {
      const cachedData = getFromCache(path);
      if (cachedData) {
        return cachedData;
      }
    }
    throw error;
  }
}

// Système de cache simple
const CACHE_PREFIX = 'aba_api_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(path: string): string {
  return `${CACHE_PREFIX}${path}`;
}

function saveToCache(path: string, data: any): void {
  const key = getCacheKey(path);
  const cacheItem = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(cacheItem));
}

function getFromCache(path: string): any | null {
  const key = getCacheKey(path);
  const stored = localStorage.getItem(key);
  
  if (!stored) return null;
  
  try {
    const cacheItem = JSON.parse(stored);
    const age = Date.now() - cacheItem.timestamp;
    
    // Vérifier si le cache est encore valide
    if (age > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

// Nettoyer le cache
export function clearApiCache(): void {
  Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_PREFIX))
    .forEach(key => localStorage.removeItem(key));
}

// Précharger des données essentielles
export async function preloadEssentialData(): Promise<void> {
  if (!navigator.onLine) return;
  
  try {
    // Charger les centres
    await apiFetch('/centers');
    // Charger les produits
    await apiFetch('/products');
  } catch (error) {
    console.warn('Erreur lors du préchargement des données:', error);
  }
}
