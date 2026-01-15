import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-sm text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-4">
          You haven't placed any orders yet. Start shopping!
        </p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {order.order_items.slice(0, 4).map((item: any) => (
                  <div
                    key={item.id}
                    className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden"
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
                  </div>
                ))}
                {order.order_items.length > 4 && (
                  <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center text-sm font-medium">
                    +{order.order_items.length - 4}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {order.order_items.length} item(s) • {order.payment_method.toUpperCase()}
                </p>
                <Button variant="ghost" size="sm" className="gap-1">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
