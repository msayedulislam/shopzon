import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, MessageSquare, Edit, History, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';

const orderStatuses = [
  'pending', 'confirmed', 'processing', 'shipped', 
  'out_for_delivery', 'delivered', 'cancelled', 'returned'
];

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_area: string;
  created_at: string;
  order_items: any[];
  order_notes?: any[];
  order_courier?: any[];
};

export default function AdminAdvancedOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    fetchCouriers();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_notes (*),
          order_courier (*, couriers (*))
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    const { data } = await supabase
      .from('couriers')
      .select('*')
      .eq('is_active', true);
    setCouriers(data || []);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
        updates.payment_status = 'paid';
      }

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;

      // Log edit history
      await supabase.from('order_edit_history').insert({
        order_id: orderId,
        admin_id: user?.id,
        field_changed: 'status',
        old_value: orders.find(o => o.id === orderId)?.status,
        new_value: status,
      });

      toast({ title: 'Status updated' });
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const addOrderNote = async () => {
    if (!selectedOrder || !noteText.trim()) return;
    try {
      const { error } = await supabase.from('order_notes').insert({
        order_id: selectedOrder.id,
        admin_id: user?.id,
        note: noteText,
        is_internal: isInternal,
      });

      if (error) throw error;
      toast({ title: 'Note added' });
      setNoteText('');
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const assignCourier = async (orderId: string, courierId: string) => {
    try {
      // Check if courier assignment exists
      const { data: existing } = await supabase
        .from('order_courier')
        .select('id')
        .eq('order_id', orderId)
        .single();

      if (existing) {
        await supabase
          .from('order_courier')
          .update({ courier_id: courierId, assigned_at: new Date().toISOString() })
          .eq('order_id', orderId);
      } else {
        await supabase.from('order_courier').insert({
          order_id: orderId,
          courier_id: courierId,
          status: 'assigned',
          assigned_at: new Date().toISOString(),
        });
      }

      toast({ title: 'Courier assigned' });
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    out_for_delivery: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Advanced Order Management</h1>
        <Button variant="outline" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {['pending', 'processing', 'shipped', 'delivered'].map(status => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{status}</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === status).length}
                  </p>
                </div>
                <Badge className={statusColors[status]}>{status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, customer, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{order.shipping_name}</p>
                  <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                </TableCell>
                <TableCell>{order.order_items?.length || 0} items</TableCell>
                <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                <TableCell>
                  <Select
                    value={order.order_courier?.[0]?.courier_id || ''}
                    onValueChange={(v) => assignCourier(order.id, v)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {couriers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(v) => updateOrderStatus(order.id, v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <Badge className={statusColors[order.status]}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order {order.order_number}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="details">
                          <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="items">Items</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                          </TabsList>
                          <TabsContent value="details" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-muted-foreground">Customer</Label>
                                <p className="font-medium">{order.shipping_name}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium">{order.shipping_phone}</p>
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-muted-foreground">Address</Label>
                                <p className="font-medium">
                                  {order.shipping_address}, {order.shipping_area}, {order.shipping_city}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Payment Method</Label>
                                <p className="font-medium uppercase">{order.payment_method}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Payment Status</Label>
                                <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                  {order.payment_status}
                                </Badge>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="items">
                            <div className="space-y-2">
                              {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                                  <div>
                                    <p className="font-medium">{item.product_name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                              <div className="flex justify-between p-3 border-t">
                                <p className="font-bold">Total</p>
                                <p className="font-bold">{formatPrice(order.total)}</p>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="notes" className="space-y-4">
                            <div className="space-y-2">
                              {order.order_notes?.map((note: any) => (
                                <div key={note.id} className={`p-3 rounded-lg ${note.is_internal ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-secondary/50'}`}>
                                  <p className="text-sm">{note.note}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(note.created_at).toLocaleString()}
                                    {note.is_internal && ' • Internal'}
                                  </p>
                                </div>
                              ))}
                              {(!order.order_notes || order.order_notes.length === 0) && (
                                <p className="text-muted-foreground text-center py-4">No notes yet</p>
                              )}
                            </div>
                            <div className="space-y-2 border-t pt-4">
                              <Textarea
                                placeholder="Add a note..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                              />
                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                  />
                                  Internal note
                                </label>
                                <Button onClick={addOrderNote} size="sm">Add Note</Button>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="history">
                            <p className="text-muted-foreground text-center py-8">
                              Edit history coming soon
                            </p>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
