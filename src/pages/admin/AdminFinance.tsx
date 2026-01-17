import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  Check,
  X,
  Clock,
  Loader2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminFinance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    grossSales: 0,
    netRevenue: 0,
    totalCommission: 0,
    pendingPayouts: 0,
    processedPayouts: 0,
    pendingRefunds: 0,
  });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [sellerEarnings, setSellerEarnings] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [payoutNotes, setPayoutNotes] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      // Fetch orders for revenue calculation
      const { data: orders } = await supabase
        .from('orders')
        .select('total, subtotal, delivery_charge, discount, created_at, status');

      const grossSales = orders?.filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Fetch order items for commission calculation
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('commission_amount, seller_amount');

      const totalCommission = orderItems?.reduce((sum, i) => sum + (i.commission_amount || 0), 0) || 0;
      const netRevenue = grossSales - (orderItems?.reduce((sum, i) => sum + (i.seller_amount || 0), 0) || 0);

      // Fetch payouts
      const { data: payoutsData } = await supabase
        .from('seller_payouts')
        .select(`*, sellers (shop_name, phone, email)`)
        .order('created_at', { ascending: false });

      const pendingPayouts = payoutsData?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const processedPayouts = payoutsData?.filter(p => p.status === 'processed')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Fetch refunds
      const { data: refundsData } = await supabase
        .from('refunds')
        .select(`*, orders (order_number)`)
        .order('created_at', { ascending: false });

      const pendingRefunds = refundsData?.filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // Fetch seller earnings
      const { data: sellers } = await supabase
        .from('sellers')
        .select('id, shop_name, balance, total_sales, commission_rate');

      // Generate revenue chart data
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const dayOrders = orders?.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.toDateString() === date.toDateString();
        }) || [];
        return {
          date: format(date, 'MMM d'),
          revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          commission: dayOrders.length * 50, // Placeholder
        };
      });

      setStats({
        grossSales,
        netRevenue,
        totalCommission,
        pendingPayouts,
        processedPayouts,
        pendingRefunds,
      });
      setPayouts(payoutsData || []);
      setRefunds(refundsData || []);
      setSellerEarnings(sellers || []);
      setRevenueData(last30Days);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async (approve: boolean) => {
    if (!selectedPayout) return;

    try {
      const updates: any = {
        status: approve ? 'approved' : 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        notes: payoutNotes,
      };

      if (approve && paymentRef) {
        updates.payment_reference = paymentRef;
        updates.status = 'processed';
        updates.processed_at = new Date().toISOString();
      }

      await supabase
        .from('seller_payouts')
        .update(updates)
        .eq('id', selectedPayout.id);

      // Log action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: approve ? 'approve_payout' : 'reject_payout',
        entity_type: 'payout',
        entity_id: selectedPayout.id,
        details: { amount: selectedPayout.amount, seller_id: selectedPayout.seller_id },
      });

      toast({ title: `Payout ${approve ? 'approved' : 'rejected'} successfully` });
      setPayoutDialogOpen(false);
      setSelectedPayout(null);
      setPayoutNotes('');
      setPaymentRef('');
      fetchFinanceData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleProcessRefund = async (refundId: string, action: 'approve' | 'reject') => {
    try {
      await supabase
        .from('refunds')
        .update({
          status: action === 'approve' ? 'processed' : 'rejected',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', refundId);

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: `${action}_refund`,
        entity_type: 'refund',
        entity_id: refundId,
      });

      toast({ title: `Refund ${action}d successfully` });
      fetchFinanceData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const exportReport = (type: 'pdf' | 'excel') => {
    toast({ title: `Exporting ${type.toUpperCase()} report...`, description: 'Download will start shortly' });
    // In production, implement actual export logic
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
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.grossSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(stats.netRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(stats.totalCommission)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatPrice(stats.pendingPayouts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processed Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.processedPayouts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatPrice(stats.pendingRefunds)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue & Commission Trend (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [formatPrice(value)]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="commission" stroke="#10b981" fillOpacity={0.2} fill="#10b981" name="Commission" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Seller Payouts</TabsTrigger>
          <TabsTrigger value="earnings">Seller Earnings</TabsTrigger>
          <TabsTrigger value="refunds">Refund Management</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Review and process seller payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payout requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payout.sellers?.shop_name}</p>
                            <p className="text-sm text-muted-foreground">{payout.sellers?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatPrice(payout.amount)}</TableCell>
                        <TableCell>{payout.payment_method || 'bKash'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            payout.status === 'processed' ? 'default' :
                            payout.status === 'approved' ? 'secondary' :
                            payout.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(payout.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {payout.status === 'pending' && (
                            <Dialog open={payoutDialogOpen && selectedPayout?.id === payout.id} onOpenChange={(open) => {
                              setPayoutDialogOpen(open);
                              if (open) setSelectedPayout(payout);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm">Review</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Payout Request</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-secondary/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Seller</p>
                                    <p className="font-medium">{payout.sellers?.shop_name}</p>
                                    <p className="text-2xl font-bold mt-2">{formatPrice(payout.amount)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Payment Reference</label>
                                    <Input 
                                      placeholder="Transaction ID / Reference"
                                      value={paymentRef}
                                      onChange={(e) => setPaymentRef(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Notes</label>
                                    <Textarea 
                                      placeholder="Add notes..."
                                      value={payoutNotes}
                                      onChange={(e) => setPayoutNotes(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button className="flex-1" onClick={() => handleApprovePayout(true)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve & Process
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleApprovePayout(false)}>
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Seller Earnings Report</CardTitle>
              <CardDescription>Overview of all seller balances and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Current Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerEarnings.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell className="font-medium">{seller.shop_name}</TableCell>
                      <TableCell>{formatPrice(seller.total_sales || 0)}</TableCell>
                      <TableCell>{seller.commission_rate}%</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatPrice(seller.balance || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>Process customer refund requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No refund requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    refunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-medium">{refund.orders?.order_number}</TableCell>
                        <TableCell className="font-semibold">{formatPrice(refund.amount)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{refund.reason}</TableCell>
                        <TableCell>{refund.refund_method}</TableCell>
                        <TableCell>
                          <Badge variant={
                            refund.status === 'processed' ? 'default' :
                            refund.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {refund.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {refund.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleProcessRefund(refund.id, 'approve')}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleProcessRefund(refund.id, 'reject')}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
