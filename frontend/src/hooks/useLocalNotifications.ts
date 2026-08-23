import { useState, useEffect, useMemo, useCallback } from 'react';

interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'aba_notifications';
const MAX_NOTIFICATIONS = 50;

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

export const useLocalNotifications = () => {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);

  useEffect(() => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing notifications:', e);
        setNotifications([]);
      }
    }
  }, []);

  const addNotification = useCallback((notification: Omit<LocalNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: LocalNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotification, ...notifications].slice(0, MAX_NOTIFICATIONS);
    setNotifications(updated);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192.svg',
        });
      } catch (e) {
        console.error('Browser notification error:', e);
      }
    }
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [notifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    safeLocalStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (e) {
        console.error('Notification permission error:', e);
        return false;
      }
    }
    return false;
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount,
    requestPermission,
  };
};