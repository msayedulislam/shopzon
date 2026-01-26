import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Clock, CheckCircle2, Truck, Search, 
  Filter, Calendar, ChevronRight, Loader2, ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-500/10' 
  },
  confirmed: { 
    icon: CheckCircle2, 
    color: 'text-blue-600', 
    bg: 'bg-blue-500/10' 
  },
  processing: { 
    icon: Package, 
    color: 'text-purple-600', 
    bg: 'bg-purple-500/10' 
  },
  shipped: { 
    icon: Truck, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-500/10' 
  },
  out_for_delivery: { 
    icon: Truck, 
    color: 'text-cyan-600', 
    bg: 'bg-cyan-500/10' 
  },
  delivered: { 
    icon: CheckCircle2, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-500/10' 
  },
  cancelled: { 
    icon: Package, 
    color: 'text-red-600', 
    bg: 'bg-red-500/10' 
  },
};

const tabs = ['All', 'Pending', 'Shipped', 'Delivered'];

export function MobileOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_image,
            price,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status?.toLowerCase() === activeTab.toLowerCase());

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">My Orders</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-semibold mb-2">Please login</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Login to view your orders
          </p>
          <Link to="/login" className="px-8 py-2.5 bg-primary text-white rounded-full font-medium">
            Login
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">My Orders</h1>
          </div>
          <button className="p-2">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/products" className="px-8 py-2.5 bg-primary text-white rounded-full font-medium inline-block">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-border/50 bg-secondary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}>
                          <StatusIcon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString('en-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${config.bg} ${config.color} capitalize text-xs`}>
                        {order.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      {order.order_items.slice(0, 4).map((item: any) => (
                        <div
                          key={item.id}
                          className="w-16 h-16 rounded-xl bg-secondary shrink-0 overflow-hidden"
                        >
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.order_items.length > 4 && (
                        <div className="w-16 h-16 rounded-xl bg-secondary shrink-0 flex items-center justify-center font-medium text-sm">
                          +{order.order_items.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                      </div>
                      <button className="flex items-center gap-1 px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                        Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
