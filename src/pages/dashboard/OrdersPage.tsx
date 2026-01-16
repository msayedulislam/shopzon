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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">
              Track and manage your order history
            </p>
          </div>
          <Badge variant="secondary" className="w-fit text-base px-4 py-2">
            {orders.length} Total Order{orders.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {orders.length === 0
              ? "You haven't placed any orders yet. Start shopping!"
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {orders.length === 0 && (
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                {/* Order Header */}
                <div className="p-4 md:p-6 border-b border-border bg-secondary/30">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString('en-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`${config.bg} ${config.color} capitalize`}
                      >
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {order.order_items.slice(0, 5).map((item: any) => (
                      <div
                        key={item.id}
                        className="group relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-secondary flex-shrink-0 overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                      >
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute bottom-1 right-1 text-xs bg-foreground text-background px-1.5 rounded-full">
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.order_items.length > 5 && (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-secondary flex-shrink-0 flex items-center justify-center font-medium border-2 border-dashed border-border">
                        +{order.order_items.length - 5}
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span>{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="uppercase">{order.payment_method}</span>
                      {order.estimated_delivery && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      View Details
                      <ChevronRight className="h-4 w-4" />
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
