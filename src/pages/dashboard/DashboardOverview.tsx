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
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground mb-1">{getGreeting()},</p>
            <h1 className="text-2xl md:text-3xl font-bold">
              {profile?.full_name || 'Welcome back!'}
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your orders today.
            </p>
          </div>
          <Link to="/products">
            <Button className="gap-2 shadow-lg">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group bg-card rounded-xl p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/dashboard/orders">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No orders yet</p>
            <Link to="/products">
              <Button variant="outline" className="mt-4">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Package;
              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Order Images */}
                    <div className="flex -space-x-2">
                      {order.order_items?.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg bg-secondary border-2 border-card overflow-hidden"
                        >
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {(order.order_items?.length || 0) > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-secondary border-2 border-card flex items-center justify-center text-xs font-medium">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Status & Price */}
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[order.status]} mb-1`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <p className="font-semibold text-primary">
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/addresses"
          className="group bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-primary transition-colors">
                Manage Addresses
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.addressCount} saved address{stats.addressCount !== 1 ? 'es' : ''}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/dashboard/wishlist"
          className="group bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-primary transition-colors">
                My Wishlist
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.wishlistCount} item{stats.wishlistCount !== 1 ? 's' : ''} saved
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/dashboard/profile"
          className="group bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-primary transition-colors">
                Edit Profile
              </p>
              <p className="text-sm text-muted-foreground">
                Update your info
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
