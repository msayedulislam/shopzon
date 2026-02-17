import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10 border-amber-200'
  },
  confirmed: {
    icon: CheckCircle2,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10 border-blue-200'
  },
  processing: {
    icon: Package,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10 border-purple-200'
  },
  shipped: {
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10 border-indigo-200'
  },
  out_for_delivery: {
    icon: Truck,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10 border-cyan-200'
  },
  delivered: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10 border-emerald-200'
  },
  cancelled: {
    icon: Package,
    color: 'text-red-600',
    bg: 'bg-red-500/10 border-red-200'
  },
  returned: {
    icon: Package,
    color: 'text-gray-600',
    bg: 'bg-gray-500/10 border-gray-200'
  },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

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

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">My Order History</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Track and manage your premium purchases
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/5">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Package className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="pr-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Orders</p>
              <p className="text-xl font-black uppercase tracking-tighter italic">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Filters - High Density Uppercase */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-transform group-focus-within:scale-110" strokeWidth={3} />
            <Input
              placeholder="SEARCH BY ORDER ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-black uppercase tracking-widest text-[10px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px] h-14 bg-secondary/30 border-none rounded-2xl focus:ring-primary shadow-inner font-black uppercase tracking-widest text-[10px] px-6">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-primary" strokeWidth={3} />
                <SelectValue placeholder="FILTER STATUS" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/5 shadow-2xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest py-3">ALL ORDERS</SelectItem>
              {Object.keys(statusConfig).map(status => (
                <SelectItem key={status} value={status} className="text-[10px] font-black uppercase tracking-widest py-3">
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List - High Density Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-[2rem] bg-secondary/50 flex items-center justify-center mx-auto mb-6 border border-border/10">
            <Package className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter italic mb-3">
            {orders.length === 0 ? 'No Legacy Found' : 'No Matching Results'}
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8 max-w-xs mx-auto leading-relaxed">
            {orders.length === 0
              ? "Your premium wardrobe is waiting to be built. Start your journey today."
              : 'Refine your search parameters to find the specific order heritage.'}
          </p>
          {orders.length === 0 && (
            <Link to="/products">
              <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Explore Collection
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                {/* Order Header - Subtitle Style */}
                <div className="px-8 py-6 border-b border-border/5 bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center border border-current/10 shadow-inner`}>
                        <StatusIcon className="h-7 w-7" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">{order.order_number}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                          {new Date(order.created_at).toLocaleDateString('en-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge
                        variant="outline"
                        className={`${config.bg} ${config.color} rounded-full border-0 px-4 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm`}
                      >
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-2xl font-black uppercase tracking-tighter italic text-black dark:text-white">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items Section */}
                <div className="p-8">
                  <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {order.order_items.map((item: any) => (
                      <div
                        key={item.id}
                        className="group/item relative w-20 h-20 rounded-2xl bg-white shadow-md border-2 border-white overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
                      >
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <Package className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <div className="absolute top-1 right-1 h-5 min-w-5 px-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-white text-[8px] font-black flex items-center justify-center border border-white/20">
                            ×{item.quantity}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-6 pt-6 border-t border-border/5">
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {order.order_items.length} Units Heritage
                      </span>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                        Paid via {order.payment_method}
                      </span>
                      {order.estimated_delivery && (
                        <>
                          <div className="h-1 w-1 rounded-full bg-border" />
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            <Truck className="h-3 w-3" />
                            Delivery {new Date(order.estimated_delivery).toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </div>
                    <Button className="h-12 px-8 rounded-xl bg-secondary hover:bg-primary hover:text-white group/btn transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest mr-3">Examine Details</span>
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
