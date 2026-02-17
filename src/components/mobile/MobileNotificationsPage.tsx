import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, Tag, Gift, Trash2, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'reward' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD-123456 has been shipped and is on its way!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale! 50% Off',
    message: 'Limited time offer on electronics. Shop now before it ends!',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'reward',
    title: 'You earned ৳100',
    message: 'Congratulations! You earned ৳100 reward points from your last purchase.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '4',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD-123455 has been delivered successfully.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Account Security',
    message: 'New login detected from a new device. Please verify if this was you.',
    time: '3 days ago',
    read: true,
  },
];

const typeIcons = {
  order: Package,
  promo: Tag,
  reward: Gift,
  system: Bell,
};

const typeColors = {
  order: 'bg-blue-500/10 text-blue-600',
  promo: 'bg-rose-500/10 text-rose-600',
  reward: 'bg-amber-500/10 text-amber-600',
  system: 'bg-gray-500/10 text-gray-600',
};

export function MobileNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-background pb-20">
      {/* Header */}
      <MobileHeader showBack title="Notifications" />

      <div className="px-4 py-3 sticky top-14 z-40 bg-[#f7f7f7]/80 dark:bg-background/80 backdrop-blur-md">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-card text-muted-foreground border border-border/5'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'unread'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-card text-muted-foreground border border-border/5'
              }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`h-4 min-w-[16px] px-1 rounded-full text-[9px] flex items-center justify-center ${filter === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'
                }`}>
                {unreadCount}
              </span>
            )}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="ml-auto text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"
            >
              <CheckCheck className="h-3 w-3" strokeWidth={3} />
              All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 pb-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => {
                const Icon = typeIcons[notification.type];

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`bg-white dark:bg-card rounded-3xl p-4 border shadow-sm transition-all active:scale-[0.98] ${notification.read ? 'border-border/5 opacity-80' : 'border-primary/10 bg-white'
                      }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 shadow-inner`}>
                        <Icon className="h-6 w-6 text-primary" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-xs font-black uppercase tracking-tight leading-tight ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {notification.time}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 -mr-1 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-card border border-border/5 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bell className="h-8 w-8 text-primary/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Clear as a whistle</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                {filter === 'unread' ? 'No unread notifications' : "Your inbox is empty"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileBottomNav />
    </div>
  );
}
