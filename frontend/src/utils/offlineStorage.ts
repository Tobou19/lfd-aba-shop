// Système de stockage local pour le mode hors connexion
export interface OfflineOrder {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'synced' | 'failed';
  createdAt: Date;
  customerId?: string;
  centreId?: string;
}

export interface OfflineCustomer {
  id: string;
  nomComplet: string;
  telephone: string;
  email?: string;
  statut: 'pending' | 'synced' | 'failed';
  createdAt: Date;
}

const STORAGE_KEYS = {
  ORDERS: 'aba_offline_orders',
  CUSTOMERS: 'aba_offline_customers',
  PRODUCTS: 'aba_offline_products',
  CENTERS: 'aba_offline_centers',
  USER_SESSION: 'aba_user_session',
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

export const offlineStorage = {
  // Gestion des commandes hors connexion
  saveOrder: (order: OfflineOrder) => {
    const orders = offlineStorage.getOrders();
    orders.push(order);
    safeLocalStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getOrders: (): OfflineOrder[] => {
    const stored = safeLocalStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing orders:', e);
      return [];
    }
  },

  removeOrder: (orderId: string) => {
    const orders = offlineStorage.getOrders().filter(o => o.id !== orderId);
    safeLocalStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus: (orderId: string, status: OfflineOrder['status']) => {
    const orders = offlineStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      safeLocalStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Gestion des clients hors connexion
  saveCustomer: (customer: OfflineCustomer) => {
    const customers = offlineStorage.getCustomers();
    customers.push(customer);
    safeLocalStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getCustomers: (): OfflineCustomer[] => {
    const stored = safeLocalStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing customers:', e);
      return [];
    }
  },

  // Cache des produits pour consultation hors connexion
  cacheProducts: (products: any[]) => {
    safeLocalStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify({
      data: products,
      timestamp: Date.now(),
    }));
  },

  getCachedProducts: () => {
    const stored = safeLocalStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) return null;
    
    try {
      const cached = JSON.parse(stored);
      // Cache valide pendant 24h
      if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
        safeLocalStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        return null;
      }
      
      return cached.data;
    } catch (e) {
      console.error('Error parsing cached products:', e);
      return null;
    }
  },

  // Cache des centres
  cacheCenters: (centers: any[]) => {
    safeLocalStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify({
      data: centers,
      timestamp: Date.now(),
    }));
  },

  getCachedCenters: () => {
    const stored = safeLocalStorage.getItem(STORAGE_KEYS.CENTERS);
    if (!stored) return null;
    
    try {
      const cached = JSON.parse(stored);
      // Cache valide pendant 7 jours
      if (Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000) {
        safeLocalStorage.removeItem(STORAGE_KEYS.CENTERS);
        return null;
      }
      
      return cached.data;
    } catch (e) {
      console.error('Error parsing cached centers:', e);
      return null;
    }
  },

  // Session utilisateur
  saveUserSession: (session: any) => {
    safeLocalStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  },

  getUserSession: () => {
    const stored = safeLocalStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing user session:', e);
      return null;
    }
  },

  clearUserSession: () => {
    safeLocalStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  },

  // Nettoyage automatique des données obsolètes
  cleanupOldData: () => {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

    // Nettoyer les commandes synchronisées
    const orders = offlineStorage.getOrders();
    const validOrders = orders.filter(order => {
      if (order.status === 'synced' && now - new Date(order.createdAt).getTime() > maxAge) {
        return false;
      }
      return true;
    });
    safeLocalStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(validOrders));

    // Nettoyer les clients synchronisés
    const customers = offlineStorage.getCustomers();
    const validCustomers = customers.filter(customer => {
      if (customer.status === 'synced' && now - new Date(customer.createdAt).getTime() > maxAge) {
        return false;
      }
      return true;
    });
    safeLocalStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(validCustomers));
  },

  // Synchronisation des données hors connexion
  getPendingSync: () => {
    const orders = offlineStorage.getOrders().filter(o => o.status === 'pending');
    const customers = offlineStorage.getCustomers().filter(c => c.status === 'pending');
    return { orders, customers };
  },

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      safeLocalStorage.removeItem(key);
    });
  },
};