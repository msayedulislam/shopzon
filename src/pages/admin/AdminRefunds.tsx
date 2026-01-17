import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  CreditCard,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { toast } from 'sonner';

interface Refund {
  id: string;
  order_id: string;
  amount: number;
  reason: string;
  refund_method: string;
  status: string;
  notes: string | null;
  wallet_credited: boolean | null;
  created_at: string;
  processed_at: string | null;
  orders?: {
    order_number: string;
    shipping_name: string;
    shipping_phone: string;
  };
}

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processNotes, setProcessNotes] = useState('');
  const [creditToWallet, setCreditToWallet] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [statusFilter]);

  const fetchRefunds = async () => {
    try {
      let query = supabase
        .from('refunds')
        .select(`
          *,
          orders (
            order_number,
            shipping_name,
            shipping_phone
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: pendingCount } = await supabase
        .from('refunds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: approvedData } = await supabase
        .from('refunds')
        .select('amount')
        .eq('status', 'approved');

      const { data: rejectedCount } = await supabase
        .from('refunds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      const totalApproved = approvedData?.reduce((sum, r) => sum + r.amount, 0) || 0;

      setStats({
        pending: pendingCount?.length || 0,
        approved: approvedData?.length || 0,
        rejected: rejectedCount?.length || 0,
        totalAmount: totalApproved,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProcess = async (action: 'approve' | 'reject') => {
    if (!selectedRefund) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          processed_at: new Date().toISOString(),
          notes: processNotes,
          wallet_credited: action === 'approve' ? creditToWallet : false,
        })
        .eq('id', selectedRefund.id);

      if (error) throw error;

      toast.success(`Refund ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowProcessDialog(false);
      setSelectedRefund(null);
      setProcessNotes('');
      setCreditToWallet(false);
      fetchRefunds();
      fetchStats();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.orders?.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.orders?.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <RotateCcw className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Refund Management</h1>
          <p className="text-muted-foreground">Process and manage customer refund requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Refunds</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunded</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">All time approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order, customer, or reason..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="animate-pulse">Loading refunds...</div>
                  </TableCell>
                </TableRow>
              ) : filteredRefunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No refunds found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-mono text-sm">
                      #{refund.orders?.order_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{refund.orders?.shipping_name}</p>
                        <p className="text-xs text-muted-foreground">{refund.orders?.shipping_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(refund.amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{refund.reason}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(refund.refund_method)}
                        <span className="capitalize">{refund.refund_method}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(refund.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {refund.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowProcessDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRefund(refund);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Process Refund Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund Request</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order:</span>
                  <span className="font-mono">#{selectedRefund.orders?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span>{selectedRefund.orders?.shipping_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-primary">{formatPrice(selectedRefund.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="text-right max-w-[200px]">{selectedRefund.reason}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Processing Notes</Label>
                <Textarea
                  placeholder="Add notes about this refund decision..."
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="wallet-credit">Credit to Wallet</Label>
                  <p className="text-xs text-muted-foreground">
                    Add amount to customer's wallet balance
                  </p>
                </div>
                <Switch
                  id="wallet-credit"
                  checked={creditToWallet}
                  onCheckedChange={setCreditToWallet}
                />
              </div>

              {creditToWallet && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Wallet credit will be applied immediately upon approval</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleProcess('reject')}
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleProcess('approve')}
              disabled={processing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
