import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  Filter,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  processing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
  shipped: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  out_for_delivery: { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  returned: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
};

export default function SellerOrders() {
  const { seller } = useOutletContext<{ seller: any }>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (seller) {
      fetchOrders();
    }
  }, [seller]);

  const fetchOrders = async () => {
    if (!seller) return;

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders (
            id,
            order_number,
            status,
            payment_status,
            payment_method,
            shipping_name,
            shipping_phone,
            shipping_address,
            shipping_area,
            shipping_city,
            created_at
          )
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group by order
      const groupedOrders = (data || []).reduce((acc: any, item) => {
        const orderId = item.order?.id;
        if (!orderId) return acc;
        
        if (!acc[orderId]) {
          acc[orderId] = {
            ...item.order,
            items: [],
            totalAmount: 0,
            sellerAmount: 0,
          };
        }
        acc[orderId].items.push(item);
        acc[orderId].totalAmount += item.price * item.quantity;
        acc[orderId].sellerAmount += item.seller_amount || (item.price * item.quantity);
        return acc;
      }, {});

      setOrders(Object.values(groupedOrders));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number or customer..."
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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 
                ? 'You haven\'t received any orders yet.'
                : 'Try adjusting your search or filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status]?.icon || Clock;
            const statusColor = statusConfig[order.status]?.color || 'text-gray-600';
            const statusBg = statusConfig[order.status]?.bg || 'bg-gray-100';

            return (
              <Card key={order.id} className="overflow-hidden">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${statusBg}`}>
                            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{order.order_number}</p>
                              <Badge className={`${statusBg} ${statusColor} border-0`}>
                                {order.status?.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_name} • {order.items?.length} item(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatPrice(order.sellerAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 py-4 bg-secondary/30">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Items */}
                        <div>
                          <h4 className="font-medium mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                                  {item.product_image ? (
                                    <img src={item.product_image} alt="" className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.product_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{formatPrice(item.seller_amount || item.price * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium mb-3">Shipping Details</h4>
                          <div className="p-4 bg-card rounded-xl space-y-2">
                            <p className="font-medium">{order.shipping_name}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address}, {order.shipping_area}, {order.shipping_city}
                            </p>
                            <div className="pt-2 border-t mt-3">
                              <Badge variant="outline">
                                {order.payment_method?.toUpperCase()} - {order.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}