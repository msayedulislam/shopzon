import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bell,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileAdminHeader } from './MobileAdminHeader';
import { MobileAdminNav } from './MobileAdminNav';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { format } from 'date-fns';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export default function MobileAdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, usersRes, recentOrdersRes] = await Promise.all([
        supabase.from('orders').select('id, total, status'),
        supabase.from('products').select('id, stock'),
        supabase.from('profiles').select('id'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const users = usersRes.data || [];

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        lowStockProducts: products.filter(p => (p.stock || 0) < 10).length,
      });

      setRecentOrders(recentOrdersRes.data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statCards = [
    {
      title: 'Revenue',
      value: stats ? formatPrice(stats.totalRevenue) : '-',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      badge: stats?.pendingOrders ? `${stats.pendingOrders} pending` : undefined,
    },
    {
      title: 'Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      badge: stats?.lowStockProducts ? `${stats.lowStockProducts} low stock` : undefined,
    },
    {
      title: 'Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileAdminHeader 
        title="Admin Dashboard" 
        unreadCount={unreadCount}
        onNotificationClick={() => setShowNotifications(true)}
      />
      
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <div className="p-4 space-y-4">
          {/* Pull to refresh indicator */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat) => (
              <Card key={stat.title} className="overflow-hidden">
                <CardContent className="p-4">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{stat.title}</span>
                        <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      {stat.badge && (
                        <p className="text-[10px] text-destructive mt-1">{stat.badge}</p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-xs">View Orders</span>
                </Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Manage Products</span>
                </Button>
              </Link>
              <Link to="/admin/inventory-alerts">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <Bell className="h-5 w-5" />
                  <span className="text-xs">Stock Alerts</span>
                </Button>
              </Link>
              <Link to="/admin/sellers">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Sellers</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Link to="/admin/orders" className="text-xs text-primary">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No orders yet
                </div>
              ) : (
                <div className="divide-y">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/admin/orders`}
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">#{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.shipping_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Notifications Sheet */}
      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${!notification.read ? 'bg-primary/5' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        notification.type === 'order' 
                          ? 'bg-primary/10 text-primary'
                          : notification.type === 'seller'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {notification.type === 'order' ? (
                          <ShoppingBag className="h-5 w-5" />
                        ) : notification.type === 'seller' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(notification.timestamp, 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <MobileAdminNav unreadCount={unreadCount} />
    </div>
  );
}
