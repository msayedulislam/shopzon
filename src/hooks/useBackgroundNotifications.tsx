import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

// Register service worker for background notifications
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return null;
};

// Keep WebSocket connection alive
const keepAlive = () => {
  // Ping every 30 seconds to keep connection alive
  const interval = setInterval(() => {
    if (document.hidden) {
      // When tab is in background, ensure supabase connection is maintained
      supabase.channel('keep-alive').subscribe();
    }
  }, 30000);

  return () => clearInterval(interval);
};

// Request persistent storage
const requestPersistentStorage = async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persisted storage granted: ${isPersisted}`);
  }
};

// Play notification sound (works in background with user interaction)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (required for background)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Three-tone chime
    const frequencies = [880, 1318.5, 1760];
    const delays = [0, 0.1, 0.2];
    const durations = [0.15, 0.25, 0.3];
    const gains = [0.4, 0.4, 0.3];
    
    frequencies.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.setValueAtTime(gains[i], audioContext.currentTime + delays[i]);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delays[i] + durations[i]);
      osc.start(audioContext.currentTime + delays[i]);
      osc.stop(audioContext.currentTime + delays[i] + durations[i]);
    });
  } catch (error) {
    console.log('Audio not supported');
  }
};

// Show browser notification
const showNotification = (title: string, body: string, tag: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag,
      requireInteraction: true, // Keep notification visible until user interacts
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export function useBackgroundNotifications(enabled: boolean = true) {
  const channelsRef = useRef<any[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  const setupNotifications = useCallback(async () => {
    if (!enabled) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Request persistent storage for reliability
    await requestPersistentStorage();

    // Keep connection alive in background
    cleanupRef.current = keepAlive();

    // Setup realtime subscriptions
    const ordersChannel = supabase
      .channel('bg-admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as any;
          playNotificationSound();
          showNotification(
            '🛒 New Order Received!',
            `Order #${order.order_number} - ${formatPrice(order.total)}`,
            `order-${order.id}`
          );
        }
      )
      .subscribe();

    const sellersChannel = supabase
      .channel('bg-admin-sellers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sellers',
        },
        (payload) => {
          const seller = payload.new as any;
          playNotificationSound();
          showNotification(
            '🏪 New Seller Registration',
            `${seller.shop_name} has registered as a seller`,
            `seller-${seller.id}`
          );
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('bg-admin-products-stock')
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
          
          if (
            product.stock !== null && 
            product.stock <= threshold && 
            (oldProduct.stock === null || oldProduct.stock > threshold)
          ) {
            playNotificationSound();
            showNotification(
              '⚠️ Low Stock Alert',
              `${product.name} has only ${product.stock} items left`,
              `stock-${product.id}`
            );
          }
        }
      )
      .subscribe();

    channelsRef.current = [ordersChannel, sellersChannel, productsChannel];

    // Handle visibility change - reconnect when returning to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        channelsRef.current.forEach(channel => {
          if (channel.state !== 'joined') {
            channel.subscribe();
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  useEffect(() => {
    setupNotifications();

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [setupNotifications]);
}
