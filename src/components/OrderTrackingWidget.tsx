import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Truck, Package, CheckCircle2, Clock, AlertCircle, 
  ArrowRight, Search, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { format } from 'date-fns';

interface OrderTracking {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  estimated_delivery?: string;
  shipping_name: string;
  shipping_city: string;
  total: number;
  items: { product_name: string; quantity: number }[];
}

const statusSteps = [
  { status: 'pending', label: 'Order Placed', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'processing', label: 'Processing', icon: Clock },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export function OrderTrackingWidget({ orderId }: { orderId?: string }) {
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState(orderId || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id, order_number, status, created_at, estimated_delivery,
          shipping_name, shipping_city, total,
          order_items(product_name, quantity)
        `)
        .or(`order_number.eq.${id},id.eq.${id}`)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setOrder({
          ...data,
          items: data.order_items || [],
        });
      }
    } catch (err) {
      setError('Order not found. Please check the order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchOrder(searchId.trim());
    }
  };

  const getCurrentStep = () => {
    if (!order) return -1;
    return statusSteps.findIndex(s => s.status === order.status);
  };

  const currentStep = getCurrentStep();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Track Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter order number (e.g., BDM-20260127-12345)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Track'}
          </Button>
        </form>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
              <div>
                <p className="font-mono text-lg font-bold">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  Ordered on {format(new Date(order.created_at), 'PPP')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                <Badge 
                  variant="secondary"
                  className={
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }
                >
                  {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.slice(0, 5).map((step, index) => {
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={step.status} className="flex flex-col items-center relative z-10">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.2 : 1,
                          backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </motion.div>
                      <span className={`text-xs mt-2 text-center ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-secondary -z-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (currentStep / 4) * 100)}%` }}
                  className="h-full bg-primary"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Delivering to</p>
                <p className="font-medium">{order.shipping_name}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_city}</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="font-medium">
                  {order.estimated_delivery 
                    ? format(new Date(order.estimated_delivery), 'PPP')
                    : '2-5 business days'}
                </p>
              </div>
            </div>

            {/* Items Summary */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Items ({order.items.length})</p>
              <div className="space-y-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product_name}</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            <Link to="/dashboard/orders">
              <Button variant="outline" className="w-full gap-2">
                View Order Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
