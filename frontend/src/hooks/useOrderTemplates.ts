interface OrderTemplate {
  id: string;
  name: string;
  description: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  createdAt: string;
}

const STORAGE_KEY = 'aba_order_templates';

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

export const useOrderTemplates = () => {
  const getTemplates = (): OrderTemplate[] => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing templates:', e);
      return [];
    }
  };

  const addTemplate = (template: Omit<OrderTemplate, 'id' | 'createdAt'>) => {
    const templates = getTemplates();
    const newTemplate: OrderTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  };

  const removeTemplate = (id: string) => {
    const templates = getTemplates().filter(t => t.id !== id);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  };

  const updateTemplate = (id: string, updates: Partial<OrderTemplate>) => {
    const templates = getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  };

  const getTemplate = (id: string): OrderTemplate | undefined => {
    return getTemplates().find(t => t.id === id);
  };

  const clearTemplates = () => {
    safeLocalStorage.removeItem(STORAGE_KEY);
  };

  // Templates prédéfinis pour l'application
  const getPredefinedTemplates = (): OrderTemplate[] => {
    return [
      {
        id: 'weekly-meal',
        name: 'Repas Hebdomadaires',
        description: 'Pack repas pour une semaine complète',
        items: [
          { productId: 'moringa', quantity: 7 },
          { productId: 'vegetables', quantity: 7 },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'monthly-meal',
        name: 'Repas Mensuels',
        description: 'Pack repas pour un mois complet',
        items: [
          { productId: 'moringa', quantity: 30 },
          { productId: 'vegetables', quantity: 30 },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  };

  return {
    getTemplates,
    addTemplate,
    removeTemplate,
    updateTemplate,
    getTemplate,
    clearTemplates,
    getPredefinedTemplates,
  };
};