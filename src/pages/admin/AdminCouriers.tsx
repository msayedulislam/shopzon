import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Truck,
  Plus,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  MapPin,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Courier {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  is_active: boolean;
  supports_cod: boolean;
  base_rate: number;
  weight_rate: number;
  sla_hours: number;
  zones: any;
  created_at: string;
}

export default function AdminCouriers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [orderCouriers, setOrderCouriers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    base_rate: 0,
    weight_rate: 0,
    sla_hours: 72,
    supports_cod: true,
    is_active: true,
  });

  useEffect(() => {
    fetchCouriers();
    fetchOrderCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const { data } = await supabase
        .from('couriers')
        .select('*')
        .order('name');

      if (!data || data.length === 0) {
        // Create default couriers for Bangladesh
        const defaultCouriers = [
          { name: 'Pathao', code: 'PATHAO', base_rate: 60, weight_rate: 10, sla_hours: 48, supports_cod: true, is_active: true },
          { name: 'Paperfly', code: 'PAPERFLY', base_rate: 70, weight_rate: 12, sla_hours: 72, supports_cod: true, is_active: true },
          { name: 'RedX', code: 'REDX', base_rate: 65, weight_rate: 11, sla_hours: 48, supports_cod: true, is_active: true },
          { name: 'Steadfast', code: 'STEADFAST', base_rate: 55, weight_rate: 8, sla_hours: 72, supports_cod: true, is_active: true },
        ];

        for (const courier of defaultCouriers) {
          await supabase.from('couriers').insert(courier);
        }

        const { data: newData } = await supabase.from('couriers').select('*').order('name');
        setCouriers(newData || []);
      } else {
        setCouriers(data);
      }
    } catch (error) {
      console.error('Error fetching couriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCouriers = async () => {
    try {
      const { data } = await supabase
        .from('order_courier')
        .select(`*, orders (order_number, shipping_name, shipping_city), couriers (name)`)
        .order('created_at', { ascending: false })
        .limit(50);
      setOrderCouriers(data || []);
    } catch (error) {
      console.error('Error fetching order couriers:', error);
    }
  };

  const handleSaveCourier = async () => {
    try {
      if (editingCourier) {
        await supabase
          .from('couriers')
          .update(formData)
          .eq('id', editingCourier.id);
        toast({ title: 'Courier updated successfully' });
      } else {
        await supabase.from('couriers').insert(formData);
        toast({ title: 'Courier added successfully' });
      }

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: editingCourier ? 'update_courier' : 'create_courier',
        entity_type: 'courier',
        entity_id: editingCourier?.id,
        details: formData,
      });

      setDialogOpen(false);
      resetForm();
      fetchCouriers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (courier: Courier) => {
    try {
      await supabase
        .from('couriers')
        .update({ is_active: !courier.is_active })
        .eq('id', courier.id);
      fetchCouriers();
      toast({ title: `Courier ${courier.is_active ? 'deactivated' : 'activated'}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAssignCourier = async (orderCourierId: string, courierId: string) => {
    try {
      await supabase
        .from('order_courier')
        .update({ courier_id: courierId, assigned_at: new Date().toISOString() })
        .eq('id', orderCourierId);
      toast({ title: 'Courier assigned successfully' });
      fetchOrderCouriers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      base_rate: 0,
      weight_rate: 0,
      sla_hours: 72,
      supports_cod: true,
      is_active: true,
    });
    setEditingCourier(null);
  };

  const openEditDialog = (courier: Courier) => {
    setEditingCourier(courier);
    setFormData({
      name: courier.name,
      code: courier.code,
      base_rate: courier.base_rate,
      weight_rate: courier.weight_rate,
      sla_hours: courier.sla_hours,
      supports_cod: courier.supports_cod,
      is_active: courier.is_active,
    });
    setDialogOpen(true);
  };

  // Generate mock performance data
  const performanceData = couriers.map(c => ({
    name: c.name,
    deliveries: Math.floor(Math.random() * 500) + 100,
    success_rate: Math.floor(Math.random() * 20) + 80,
  }));

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Courier Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Courier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCourier ? 'Edit Courier' : 'Add New Courier'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Courier name"
                  />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="COURIER_CODE"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Rate (৳)</Label>
                  <Input
                    type="number"
                    value={formData.base_rate}
                    onChange={(e) => setFormData({ ...formData, base_rate: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Weight Rate (৳/kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight_rate}
                    onChange={(e) => setFormData({ ...formData, weight_rate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>SLA (Hours)</Label>
                <Input
                  type="number"
                  value={formData.sla_hours}
                  onChange={(e) => setFormData({ ...formData, sla_hours: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Supports COD</Label>
                <Switch
                  checked={formData.supports_cod}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_cod: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCourier}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Couriers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couriers.filter(c => c.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {orderCouriers.filter(oc => !oc.courier_id).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orderCouriers.filter(oc => oc.status === 'picked_up').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orderCouriers.filter(oc => oc.status === 'delivered' && 
                new Date(oc.delivered_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="couriers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="couriers">Courier Partners</TabsTrigger>
          <TabsTrigger value="assignments">Order Assignments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="couriers">
          <Card>
            <CardHeader>
              <CardTitle>Courier Partners</CardTitle>
              <CardDescription>Manage delivery partners and their rates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Courier</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Weight Rate</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>COD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {couriers.map((courier) => (
                    <TableRow key={courier.id}>
                      <TableCell className="font-medium">{courier.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{courier.code}</Badge>
                      </TableCell>
                      <TableCell>৳{courier.base_rate}</TableCell>
                      <TableCell>৳{courier.weight_rate}/kg</TableCell>
                      <TableCell>{courier.sla_hours}h</TableCell>
                      <TableCell>
                        {courier.supports_cod ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={courier.is_active}
                          onCheckedChange={() => handleToggleActive(courier)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(courier)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Order Courier Assignments</CardTitle>
              <CardDescription>Assign and track couriers for orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderCouriers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No courier assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderCouriers.map((oc) => (
                      <TableRow key={oc.id}>
                        <TableCell className="font-medium">{oc.orders?.order_number}</TableCell>
                        <TableCell>{oc.orders?.shipping_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {oc.orders?.shipping_city}
                          </div>
                        </TableCell>
                        <TableCell>
                          {oc.couriers?.name || (
                            <Select onValueChange={(v) => handleAssignCourier(oc.id, v)}>
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                {couriers.filter(c => c.is_active).map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {oc.tracking_number || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            oc.status === 'delivered' ? 'default' :
                            oc.status === 'picked_up' ? 'secondary' : 'outline'
                          }>
                            {oc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Package className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="deliveries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Deliveries" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((courier) => (
                    <div key={courier.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{courier.name}</span>
                        <span className="text-sm">{courier.success_rate}%</span>
                      </div>
                      <Progress value={courier.success_rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
