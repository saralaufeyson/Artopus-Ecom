import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationsRef = useRef<NotificationItem[]>([]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const refresh = useCallback(async () => {
    if (!auth?.user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      const newItems = res.data.notifications || [];

      // Trigger a toast for each new unread notification
      if (notificationsRef.current.length > 0) {
        const existingIds = new Set(notificationsRef.current.map((n) => n._id));
        newItems.forEach((item: NotificationItem) => {
          if (!item.isRead && !existingIds.has(item._id)) {
            toast.info(item.message, {
              toastId: item._id, // prevent duplicate toast renders
            });
          }
        });
      }

      setNotifications(newItems);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [auth?.user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await axios.patch(`/api/notifications/${id}/read`);
      setNotifications((current) => current.map((item) => (
        item._id === id ? { ...item, isRead: true } : item
      )));
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await axios.patch('/api/notifications/read-all');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!auth?.user) return undefined;

    const intervalId = window.setInterval(() => {
      refresh();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [auth?.user, refresh]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  }), [loading, markAllAsRead, markAsRead, notifications, refresh, unreadCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
}
