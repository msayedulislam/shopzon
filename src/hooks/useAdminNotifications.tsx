import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/data/mockData';

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

// Notification sound - pleasant two-tone chime
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone (higher pitch)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 880; // A5
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.15);
    
    // Second tone (even higher pitch) - delayed slightly
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 1318.5; // E6
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0, audioContext.currentTime);
    gain2.gain.setValueAtTime(0.4, audioContext.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
    osc2.start(audioContext.currentTime + 0.1);
    osc2.stop(audioContext.currentTime + 0.35);
    
    // Third tone (highest) - for emphasis
    const osc3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    osc3.connect(gain3);
    gain3.connect(audioContext.destination);
    osc3.frequency.value = 1760; // A6
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0, audioContext.currentTime);
    gain3.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    osc3.start(audioContext.currentTime + 0.2);
    osc3.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Audio not supported');
  }
};

// Request browser notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Show browser push notification
const showBrowserNotification = (title: string, message: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: icon || '/favicon.png',
      badge: '/favicon.png',
      tag: 'admin-notification',
      requireInteraction: false,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
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
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser push notification
    showBrowserNotification(notification.title, notification.message);
    
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
