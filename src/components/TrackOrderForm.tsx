import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Calendar,
  ChevronRight,
  Loader2,
  XCircle,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  total: number;
  subtotal: number;
  delivery_charge: number | null;
  discount: number | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_area: string;
  shipping_city: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string | null;
  order_items: OrderItem[];
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  processing: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
  out_for_delivery: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/30',
  returned: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
};

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_image,
          quantity,
          price
        )
      `)
      .eq('order_number', orderNumber.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to search order');
      setOrder(null);
    } else if (data) {
      // Verify phone if provided
      if (phoneNumber && !data.shipping_phone.includes(phoneNumber.replace(/\D/g, ''))) {
        toast.error('Phone number does not match order');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } else {
      setOrder(null);
      toast.error('Order not found');
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.status === 'cancelled' || order.status === 'returned') return -1;
    return statusSteps.findIndex(s => s.key === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6">Track Your Order</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Order Number *</label>
            <Input
              placeholder="e.g., BDM-20240115-12345"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number (Optional)</label>
            <Input
              placeholder="e.g., 01712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-12"
            />
          </div>
        </div>
        <Button 
          className="w-full md:w-auto mt-6 h-12 px-8" 
          size="lg" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Track Order
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {searched && !loading && (
        order ? (
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-2xl font-bold text-foreground">{order.order_number}</p>
                </div>
                <Badge className={`${statusColors[order.status || 'pending']} text-sm px-3 py-1`}>
                  {(order.status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Badge>
              </div>

              {/* Progress Steps */}
              {currentStepIndex >= 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center mb-2
                            ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                            ${isCurrent ? 'ring-4 ring-primary/30' : ''}
                          `}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs text-center ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Cancelled/Returned Status */}
              {(order.status === 'cancelled' || order.status === 'returned') && (
                <div className="flex items-center gap-4 p-4 bg-destructive/10 rounded-xl mb-6">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">
                      Order {order.status === 'cancelled' ? 'Cancelled' : 'Returned'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This order has been {order.status}. Please contact support for more information.
                    </p>
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="text-muted-foreground">
                    <p className="font-medium text-foreground">{order.shipping_name}</p>
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_area}, {order.shipping_city}</p>
                    <p className="flex items-center gap-1 mt-2">
                      <Phone className="h-4 w-4" />
                      {order.shipping_phone}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Order Details
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <span className="text-foreground">Placed:</span>{' '}
                      {order.created_at && format(new Date(order.created_at), 'MMM d, yyyy')}
                    </p>
                    {order.estimated_delivery && (
                      <p>
                        <span className="text-foreground">Est. Delivery:</span>{' '}
                        {format(new Date(order.estimated_delivery), 'MMM d, yyyy')}
                      </p>
                    )}
                    {order.delivered_at && (
                      <p>
                        <span className="text-foreground">Delivered:</span>{' '}
                        {format(new Date(order.delivered_at), 'MMM d, yyyy')}
                      </p>
                    )}
                    <p>
                      <span className="text-foreground">Payment:</span>{' '}
                      {order.payment_method?.toUpperCase()} - {order.payment_status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Items ({order.order_items.length})
              </h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.delivery_charge && order.delivery_charge > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>{formatPrice(order.delivery_charge)}</span>
                  </div>
                )}
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Search Another */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setOrder(null);
                  setSearched(false);
                  setOrderNumber('');
                  setPhoneNumber('');
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Track Another Order
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center border border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find an order with that number. Please check and try again.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearched(false);
                setOrderNumber('');
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )
      )}
    </div>
  );
}
