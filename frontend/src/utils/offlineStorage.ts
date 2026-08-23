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

export const offlineStorage = {
  // Gestion des commandes hors connexion
  saveOrder: (order: OfflineOrder) => {
    const orders = offlineStorage.getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getOrders: (): OfflineOrder[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  },

  removeOrder: (orderId: string) => {
    const orders = offlineStorage.getOrders().filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus: (orderId: string, status: OfflineOrder['status']) => {
    const orders = offlineStorage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Gestion des clients hors connexion
  saveCustomer: (customer: OfflineCustomer) => {
    const customers = offlineStorage.getCustomers();
    customers.push(customer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getCustomers: (): OfflineCustomer[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return stored ? JSON.parse(stored) : [];
  },

  // Cache des produits pour consultation hors connexion
  cacheProducts: (products: any[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify({
      data: products,
      timestamp: Date.now(),
    }));
  },

  getCachedProducts: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) return null;
    
    const cached = JSON.parse(stored);
    // Cache valide pendant 24h
    if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      return null;
    }
    
    return cached.data;
  },

  // Cache des centres
  cacheCenters: (centers: any[]) => {
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify({
      data: centers,
      timestamp: Date.now(),
    }));
  },

  getCachedCenters: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.CENTERS);
    if (!stored) return null;
    
    const cached = JSON.parse(stored);
    // Cache valide pendant 7 jours
    if (Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEYS.CENTERS);
      return null;
    }
    
    return cached.data;
  },

  // Session utilisateur
  saveUserSession: (session: any) => {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  },

  getUserSession: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  clearUserSession: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
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
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(validOrders));

    // Nettoyer les clients synchronisés
    const customers = offlineStorage.getCustomers();
    const validCustomers = customers.filter(customer => {
      if (customer.status === 'synced' && now - new Date(customer.createdAt).getTime() > maxAge) {
        return false;
      }
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(validCustomers));
  },

  // Synchronisation des données hors connexion
  getPendingSync: () => {
    const orders = offlineStorage.getOrders().filter(o => o.status === 'pending');
    const customers = offlineStorage.getCustomers().filter(c => c.status === 'pending');
    return { orders, customers };
  },

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};