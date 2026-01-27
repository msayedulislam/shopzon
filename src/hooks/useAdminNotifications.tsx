import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/data/mockData';
import { notificationService } from '@/lib/notificationService';

export type NotificationType = 'order' | 'seller' | 'low_stock';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

// Request browser notification permission
const requestNotificationPermission = async () => {
  return notificationService.requestPermission();
};

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const hasRequestedPermission = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (!hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestNotificationPermission().then(() => {
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission);
        }
      });
    }
  }, []);

  const addNotification = useCallback((notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AdminNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
    setUnreadCount(prev => prev + 1);
    
    // Use centralized notification service for sound + browser notification
    notificationService.notify(notification.title, notification.message, `admin-${notification.type}`);
    
    // Show in-app toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Check for low stock products
  const checkLowStock = useCallback(async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock, low_stock_threshold')
        .lt('stock', 10) // Default low stock threshold
        .gt('stock', 0);

      if (products && products.length > 0) {
        products.forEach(product => {
          const threshold = product.low_stock_threshold || 10;
          if (product.stock !== null && product.stock <= threshold) {
            addNotification({
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${product.name} has only ${product.stock} items left`,
              data: product,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }, [addNotification]);

  useEffect(() => {
    // Initial low stock check
    checkLowStock();

    // Set up realtime subscriptions
    const ordersChannel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as any;
          addNotification({
            type: 'order',
            title: 'New Order Received!',
            message: `Order #${order.order_number} - ${formatPrice(order.total)}`,
            data: order,
          });
        }
      )
      .subscribe();

    const sellersChannel = supabase
      .channel('admin-sellers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sellers',
        },
        (payload) => {
          const seller = payload.new as any;
          addNotification({
            type: 'seller',
            title: 'New Seller Registration',
            message: `${seller.shop_name} has registered as a seller`,
            data: seller,
          });
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('admin-products-stock')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          const product = payload.new as any;
          const oldProduct = payload.old as any;
          const threshold = product.low_stock_threshold || 10;
          
          // Check if stock just went below threshold
          if (
            product.stock !== null && 
            product.stock <= threshold && 
            (oldProduct.stock === null || oldProduct.stock > threshold)
          ) {
            addNotification({
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${product.name} stock is now at ${product.stock} units`,
              data: product,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(sellersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [addNotification, checkLowStock]);

  const requestPermission = useCallback(async () => {
    await requestNotificationPermission();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    notificationPermission,
    requestPermission,
  };
}
