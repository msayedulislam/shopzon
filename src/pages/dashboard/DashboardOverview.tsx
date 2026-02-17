import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Package,
  Heart,
  MapPin,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { LoyaltyPointsWidget } from '@/components/LoyaltyPointsWidget';
import { OrderTrackingWidget } from '@/components/OrderTrackingWidget';

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  wishlistCount: number;
  addressCount: number;
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-200',
  processing: 'bg-purple-500/10 text-purple-600 border-purple-200',
  shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  out_for_delivery: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  cancelled: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const { profile } = useOutletContext<any>();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    wishlistCount: 0,
    addressCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all data in parallel
      const [ordersResult, wishlistResult, addressResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, order_number, total, created_at, order_items(id, product_name, product_image)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id),
      ]);

      const orders = ordersResult.data || [];
      const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'];

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter(o => activeStatuses.includes(o.status)).length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        wishlistCount: wishlistResult.data?.length || 0,
        addressCount: addressResult.data?.length || 0,
      });

      setRecentOrders(orders.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'bg-primary/10 text-primary',
      link: '/dashboard/orders',
    },
    {
      icon: Truck,
      label: 'Active Orders',
      value: stats.activeOrders,
      color: 'bg-blue-500/10 text-blue-600',
      link: '/dashboard/orders',
    },
    {
      icon: CheckCircle2,
      label: 'Delivered',
      value: stats.deliveredOrders,
      color: 'bg-emerald-500/10 text-emerald-600',
      link: '/dashboard/orders',
    },
    {
      icon: Heart,
      label: 'Wishlist',
      value: stats.wishlistCount,
      color: 'bg-pink-500/10 text-pink-600',
      link: '/dashboard/wishlist',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section - Premium Govaly Design */}
      <div className="relative overflow-hidden bg-white dark:bg-card p-8 rounded-[2.5rem] border border-border/5 shadow-xl shadow-primary/5 group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard Overview</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Govaly User'}
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-3 opacity-70">
              Your premium shopping experience at a glance
            </p>
          </div>
          <Link to="/products">
            <Button className="h-14 rounded-2xl px-8 bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <ShoppingBag className="h-5 w-5 mr-3" strokeWidth={3} />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid - High Density Uppercase */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group bg-white dark:bg-card rounded-3xl p-6 border border-border/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 border border-current/10 shadow-inner`}>
              <stat.icon className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <p className="text-3xl font-black uppercase tracking-tighter italic">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 group-hover:text-primary transition-colors">{stat.label}</p>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-primary" strokeWidth={3} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border/10">
              <h2 className="text-sm font-black uppercase tracking-widest italic">Recent Orders</h2>
              <Link to="/dashboard/orders">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                  View All
                  <ArrowRight className="h-3 w-3 ml-2" strokeWidth={3} />
                </Button>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-4 border border-border/10">
                  <Package className="h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">No orders found yet</p>
                <Link to="/products">
                  <Button variant="outline" className="mt-6 rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest">
                    Start Your Search
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/5">
                {recentOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Package;
                  return (
                    <div
                      key={order.id}
                      className="px-8 py-5 hover:bg-secondary/20 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        {/* Order Images - Stacked */}
                        <div className="flex -space-x-3">
                          {order.order_items?.slice(0, 3).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-xl bg-white shadow-md border-2 border-white overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
                            >
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                  <Package className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                            {order.order_number}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            {new Date(order.created_at).toLocaleDateString('en-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>

                        {/* Status & Price */}
                        <div className="text-right shrink-0">
                          <Badge
                            variant="outline"
                            className={`${statusColors[order.status]} mb-1.5 rounded-full border-0 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest`}
                          >
                            <StatusIcon className="h-2.5 w-2.5 mr-1.5" strokeWidth={3} />
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm font-black uppercase tracking-tighter text-black dark:text-white">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widgets Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-border/5 shadow-sm">
              <LoyaltyPointsWidget />
            </div>
            <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-border/5 shadow-sm">
              <OrderTrackingWidget />
            </div>
          </div>
        </div>

        {/* Quick Links - Sidebar Column */}
        <div className="space-y-4">
          {[
            { title: 'Addresses', count: stats.addressCount, icon: MapPin, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/dashboard/addresses' },
            { title: 'Wishlist', count: stats.wishlistCount, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', link: '/dashboard/wishlist' },
            { title: 'Wallet', subtitle: 'View Balance', icon: Gift, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/dashboard/wallet' }
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="block p-2 bg-white dark:bg-card rounded-[2rem] border border-border/5 shadow-sm hover:shadow-lg transition-all active:scale-95 group"
            >
              <div className="flex items-center gap-4 p-4">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-inner`}>
                  <item.icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest">{item.title}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
                    {item.subtitle || `${item.count} saved`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" strokeWidth={3} />
              </div>
            </Link>
          ))}

          {/* Ad Banner Widget */}
          <div className="relative rounded-[2.5rem] overflow-hidden h-40 shadow-xl shadow-primary/5">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              alt="Ad"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">Limited Offer</p>
              <h3 className="text-white text-lg font-black uppercase tracking-tighter italic">Summer Sale</h3>
            </div>
          </div>
        </div>
        );
}
