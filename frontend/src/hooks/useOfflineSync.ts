import { useEffect, useState } from 'react';
import { offlineStorage, OfflineOrder, OfflineCustomer } from '../utils/offlineStorage';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Nettoyage automatique des données obsolètes
    offlineStorage.cleanupOldData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('Synchronisation en cours...');

    try {
      const { orders, customers } = offlineStorage.getPendingSync();

      // Synchroniser les clients d'abord
      for (const customer of customers) {
        try {
          const response = await fetch('/api/v1/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${offlineStorage.getUserSession()?.accessToken}`,
            },
            body: JSON.stringify({
              nomComplet: customer.nomComplet,
              telephone: customer.telephone,
              email: customer.email,
            }),
          });

          if (response.ok) {
            offlineStorage.updateOrderStatus(customer.id, 'synced');
          } else {
            offlineStorage.updateOrderStatus(customer.id, 'failed');
          }
        } catch (error) {
          console.error('Erreur de synchronisation client:', error);
          offlineStorage.updateOrderStatus(customer.id, 'failed');
        }
      }

      // Synchroniser les commandes
      for (const order of orders) {
        try {
          const response = await fetch('/api/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${offlineStorage.getUserSession()?.accessToken}`,
            },
            body: JSON.stringify({
              items: order.items,
              customerId: order.customerId,
              centreId: order.centreId,
            }),
          });

          if (response.ok) {
            offlineStorage.updateOrderStatus(order.id, 'synced');
          } else {
            offlineStorage.updateOrderStatus(order.id, 'failed');
          }
        } catch (error) {
          console.error('Erreur de synchronisation commande:', error);
          offlineStorage.updateOrderStatus(order.id, 'failed');
        }
      }

      setSyncStatus('Synchronisation terminée');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      setSyncStatus('Erreur de synchronisation');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncManual = () => {
    if (isOnline) {
      syncPendingData();
    }
  };

  return {
    isOnline,
    isSyncing,
    syncStatus,
    syncManual,
    pendingItems: offlineStorage.getPendingSync(),
  };
};