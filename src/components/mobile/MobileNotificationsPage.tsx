import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, Tag, Gift, Trash2, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Read All
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'unread' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`min-w-[18px] h-[18px] rounded-full text-xs flex items-center justify-center ${
                filter === 'unread' ? 'bg-white/20' : 'bg-primary text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notifications List */}
      <div className="px-4 py-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => {
                const Icon = typeIcons[notification.type];
                const colorClass = typeColors[notification.type];

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`bg-white dark:bg-card rounded-2xl p-4 border ${
                      notification.read ? 'border-border/50' : 'border-primary/30 bg-primary/5'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 -mr-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'You have read all notifications' : "You don't have any notifications yet"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileBottomNav />
    </div>
  );
}
