import { useState, useEffect } from 'react';
import { 
  Search, Loader2, Eye, Edit, History, RefreshCw, Download, 
  CheckCircle2, XCircle, Truck, Package, Clock, AlertTriangle,
  Filter, MoreHorizontal, Printer, MessageSquare, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';

const orderStatuses = [
  'pending', 'confirmed', 'processing', 'shipped', 
  'out_for_delivery', 'delivered', 'cancelled', 'returned'
];

const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_area: string;
  created_at: string;
  delivered_at: string | null;
  notes: string | null;
  order_items: any[];
  order_notes?: any[];
  order_courier?: any[];
  user_id: string | null;
};

type OrderEditHistory = {
  id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  created_at: string;
  admin_id: string | null;
};

export default function AdminOrdersEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [editHistory, setEditHistory] = useState<OrderEditHistory[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_area: '',
    notes: '',
    status: '',
    payment_status: '',
    reason: '',
  });

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
          order_items (*, seller:sellers(shop_name)),
          order_notes (*),
          order_courier (*, couriers (*))
        `)
        .order('created_at', { ascending: false })
        .limit(200);

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

  const fetchEditHistory = async (orderId: string) => {
    const { data } = await supabase
      .from('order_edit_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    setEditHistory(data || []);
  };

  const openDetailsDialog = async (order: Order) => {
    setSelectedOrder(order);
    await fetchEditHistory(order.id);
    setDetailsDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      shipping_name: order.shipping_name || '',
      shipping_phone: order.shipping_phone || '',
      shipping_address: order.shipping_address || '',
      shipping_city: order.shipping_city || '',
      shipping_area: order.shipping_area || '',
      notes: order.notes || '',
      status: order.status,
      payment_status: order.payment_status,
      reason: '',
    });
    setEditDialogOpen(true);
  };

  const saveOrderEdit = async () => {
    if (!selectedOrder) return;

    try {
      const changes: { field: string; old: string; new: string }[] = [];

      // Track changes
      if (editForm.shipping_name !== selectedOrder.shipping_name) {
        changes.push({ field: 'shipping_name', old: selectedOrder.shipping_name, new: editForm.shipping_name });
      }
      if (editForm.shipping_phone !== selectedOrder.shipping_phone) {
        changes.push({ field: 'shipping_phone', old: selectedOrder.shipping_phone, new: editForm.shipping_phone });
      }
      if (editForm.shipping_address !== selectedOrder.shipping_address) {
        changes.push({ field: 'shipping_address', old: selectedOrder.shipping_address, new: editForm.shipping_address });
      }
      if (editForm.status !== selectedOrder.status) {
        changes.push({ field: 'status', old: selectedOrder.status, new: editForm.status });
      }
      if (editForm.payment_status !== selectedOrder.payment_status) {
        changes.push({ field: 'payment_status', old: selectedOrder.payment_status, new: editForm.payment_status });
      }

      // Update order
      const updates: any = {
        shipping_name: editForm.shipping_name,
        shipping_phone: editForm.shipping_phone,
        shipping_address: editForm.shipping_address,
        shipping_city: editForm.shipping_city,
        shipping_area: editForm.shipping_area,
        notes: editForm.notes,
        status: editForm.status,
        payment_status: editForm.payment_status,
      };

      if (editForm.status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Log edit history for each change
      for (const change of changes) {
        await supabase.from('order_edit_history').insert({
          order_id: selectedOrder.id,
          admin_id: user?.id,
          field_changed: change.field,
          old_value: change.old,
          new_value: change.new,
          reason: editForm.reason || null,
        });
      }

      // Log admin action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'edit_order',
        entity_type: 'order',
        entity_id: selectedOrder.id,
        details: { changes, reason: editForm.reason },
      });

      toast({ title: 'Order updated successfully' });
      setEditDialogOpen(false);
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

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    setBulkActionLoading(true);

    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
        updates.payment_status = 'paid';
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .in('id', selectedOrders);

      if (error) throw error;

      // Log bulk action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'bulk_update_order_status',
        entity_type: 'order',
        details: { order_ids: selectedOrders, new_status: newStatus },
      });

      toast({ title: `${selectedOrders.length} orders updated to ${newStatus}` });
      setSelectedOrders([]);
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const getDateFilteredOrders = (orders: Order[]) => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return orders.filter(o => new Date(o.created_at).toDateString() === now.toDateString());
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orders.filter(o => new Date(o.created_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orders.filter(o => new Date(o.created_at) >= monthAgo);
      default:
        return orders;
    }
  };

  const filteredOrders = getDateFilteredOrders(orders).filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
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

  const paymentColors: Record<string, string> = {
    pending: 'text-yellow-600',
    paid: 'text-green-600',
    failed: 'text-red-600',
    refunded: 'text-purple-600',
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
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
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage and track all orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shipped}</p>
                <p className="text-xs text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Order Status" />
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
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{selectedOrders.length} orders selected</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('confirmed')}
                  disabled={bulkActionLoading}
                >
                  Confirm All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('processing')}
                  disabled={bulkActionLoading}
                >
                  Mark Processing
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('shipped')}
                  disabled={bulkActionLoading}
                >
                  Mark Shipped
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('delivered')}
                  disabled={bulkActionLoading}
                >
                  Mark Delivered
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className={selectedOrders.includes(order.id) ? 'bg-primary/5' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => toggleSelectOrder(order.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{order.shipping_name}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                  </div>
                </TableCell>
                <TableCell>{order.order_items?.length || 0} items</TableCell>
                <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-xs uppercase">{order.payment_method}</p>
                    <Badge variant="outline" className={paymentColors[order.payment_status]}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.order_courier?.[0]?.courier_id || ''}
                    onValueChange={(v) => assignCourier(order.id, v)}
                  >
                    <SelectTrigger className="w-[120px] h-8">
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
                  <Badge className={statusColors[order.status]}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDetailsDialog(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(order)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {orderStatuses.map(status => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => {
                            setSelectedOrder(order);
                            setEditForm({ ...editForm, status });
                            saveOrderEdit();
                          }}
                          className="capitalize"
                        >
                          Set as {status.replace('_', ' ')}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order {selectedOrder.order_number}</span>
                  <Badge className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status.replace('_', ' ')}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{selectedOrder.shipping_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{selectedOrder.shipping_phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">City:</span>
                          <span>{selectedOrder.shipping_city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Area:</span>
                          <span>{selectedOrder.shipping_area}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p className="mt-1">{selectedOrder.shipping_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Payment Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="uppercase">{selectedOrder.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline" className={paymentColors[selectedOrder.payment_status]}>
                            {selectedOrder.payment_status}
                          </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery:</span>
                          <span>{formatPrice(selectedOrder.delivery_charge || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount:</span>
                          <span>-{formatPrice(selectedOrder.discount || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="mt-4">
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img src={item.product_image} alt="" className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                            {item.seller?.shop_name && (
                              <p className="text-xs text-muted-foreground">Seller: {item.seller.shop_name}</p>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedOrder.order_notes?.map((note: any) => (
                      <div 
                        key={note.id} 
                        className={`p-3 rounded-lg ${note.is_internal ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400' : 'bg-secondary/50'}`}
                      >
                        <p className="text-sm">{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.created_at).toLocaleString()}
                          {note.is_internal && ' • Internal'}
                        </p>
                      </div>
                    ))}
                    {(!selectedOrder.order_notes || selectedOrder.order_notes.length === 0) && (
                      <p className="text-muted-foreground text-center py-4">No notes yet</p>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={isInternal} onCheckedChange={(c) => setIsInternal(!!c)} />
                        Internal note (not visible to customer)
                      </label>
                      <Button onClick={addOrderNote} size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <div className="space-y-2">
                    {editHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No edit history</p>
                    ) : (
                      editHistory.map((entry) => (
                        <div key={entry.id} className="p-3 bg-secondary/50 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{entry.field_changed.replace('_', ' ')}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <span className="line-through">{entry.old_value || 'empty'}</span>
                            <span>→</span>
                            <span className="text-foreground">{entry.new_value}</span>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1">Reason: {entry.reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                <Button onClick={() => {
                  setDetailsDialogOpen(false);
                  openEditDialog(selectedOrder);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={editForm.shipping_name}
                  onChange={(e) => setEditForm({ ...editForm, shipping_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.shipping_phone}
                  onChange={(e) => setEditForm({ ...editForm, shipping_phone: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Address</Label>
              <Input
                value={editForm.shipping_address}
                onChange={(e) => setEditForm({ ...editForm, shipping_address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>City</Label>
                <Input
                  value={editForm.shipping_city}
                  onChange={(e) => setEditForm({ ...editForm, shipping_city: e.target.value })}
                />
              </div>
              <div>
                <Label>Area</Label>
                <Input
                  value={editForm.shipping_area}
                  onChange={(e) => setEditForm({ ...editForm, shipping_area: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Order Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={editForm.payment_status} onValueChange={(v) => setEditForm({ ...editForm, payment_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Order Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Internal notes about this order"
              />
            </div>

            <div>
              <Label>Reason for Changes</Label>
              <Input
                value={editForm.reason}
                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                placeholder="Why are you making these changes?"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveOrderEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
