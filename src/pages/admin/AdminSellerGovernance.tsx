import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle,
  Search,
  Filter,
  TrendingUp,
  Clock,
  XCircle,
  Loader2,
  MessageSquare,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SellerWithGovernance {
  id: string;
  shop_name: string;
  phone: string;
  email: string;
  status: string;
  level: string;
  rating: number;
  total_sales: number;
  created_at: string;
  governance?: {
    trust_score: number;
    warning_count: number;
    strike_count: number;
    cancellation_rate: number;
    fulfillment_rate: number;
    avg_shipping_time_hours: number;
    sla_violation_count: number;
  };
}

export default function AdminSellerGovernance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerWithGovernance[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState<SellerWithGovernance | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'warning' | 'strike' | 'suspend' | 'reactivate'>('warning');
  const [actionReason, setActionReason] = useState('');
  const [trustAdjustment, setTrustAdjustment] = useState(0);

  useEffect(() => {
    fetchSellersWithGovernance();
    fetchActionLogs();
  }, []);

  const fetchSellersWithGovernance = async () => {
    try {
      const { data: sellersData } = await supabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: governanceData } = await supabase
        .from('seller_governance')
        .select('*');

      const merged = sellersData?.map(seller => ({
        ...seller,
        governance: governanceData?.find(g => g.seller_id === seller.id),
      })) || [];

      setSellers(merged);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionLogs = async () => {
    try {
      const { data } = await supabase
        .from('seller_action_logs')
        .select(`*, sellers (shop_name)`)
        .order('created_at', { ascending: false })
        .limit(50);
      setActionLogs(data || []);
    } catch (error) {
      console.error('Error fetching action logs:', error);
    }
  };

  const handleSellerAction = async () => {
    if (!selectedSeller || !actionReason) return;

    try {
      // Create action log
      await supabase.from('seller_action_logs').insert({
        seller_id: selectedSeller.id,
        admin_id: user?.id,
        action_type: actionType,
        reason: actionReason,
        details: { trust_adjustment: trustAdjustment },
      });

      // Update seller status if suspending/reactivating
      if (actionType === 'suspend') {
        await supabase.from('sellers').update({ status: 'suspended' }).eq('id', selectedSeller.id);
      } else if (actionType === 'reactivate') {
        await supabase.from('sellers').update({ status: 'active' }).eq('id', selectedSeller.id);
      }

      // Update governance record
      const governanceUpdates: any = {};
      if (actionType === 'warning') {
        governanceUpdates.warning_count = (selectedSeller.governance?.warning_count || 0) + 1;
        governanceUpdates.last_warning_at = new Date().toISOString();
      } else if (actionType === 'strike') {
        governanceUpdates.strike_count = (selectedSeller.governance?.strike_count || 0) + 1;
        governanceUpdates.last_strike_at = new Date().toISOString();
      } else if (actionType === 'suspend') {
        governanceUpdates.suspended_at = new Date().toISOString();
        governanceUpdates.suspension_reason = actionReason;
      } else if (actionType === 'reactivate') {
        governanceUpdates.reactivated_at = new Date().toISOString();
      }

      if (trustAdjustment !== 0) {
        governanceUpdates.trust_score = Math.max(0, Math.min(100, 
          (selectedSeller.governance?.trust_score || 100) + trustAdjustment
        ));
      }

      // Upsert governance
      if (selectedSeller.governance) {
        await supabase.from('seller_governance')
          .update(governanceUpdates)
          .eq('seller_id', selectedSeller.id);
      } else {
        await supabase.from('seller_governance').insert({
          seller_id: selectedSeller.id,
          ...governanceUpdates,
        });
      }

      // Log admin action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: `seller_${actionType}`,
        entity_type: 'seller',
        entity_id: selectedSeller.id,
        details: { reason: actionReason, trust_adjustment: trustAdjustment },
      });

      toast({ title: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} issued successfully` });
      setActionDialogOpen(false);
      setSelectedSeller(null);
      setActionReason('');
      setTrustAdjustment(0);
      fetchSellersWithGovernance();
      fetchActionLogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold">Seller Governance</h1>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Active Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers.filter(s => s.status === 'suspended').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              With Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers.filter(s => (s.governance?.warning_count || 0) > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sellers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sellers">Seller Overview</TabsTrigger>
          <TabsTrigger value="logs">Action History</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sellers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sellers Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Warnings/Strikes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{seller.shop_name}</p>
                          <p className="text-sm text-muted-foreground">{seller.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getTrustScoreColor(seller.governance?.trust_score || 100)}`}>
                              {seller.governance?.trust_score || 100}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getTrustScoreLabel(seller.governance?.trust_score || 100)}
                            </span>
                          </div>
                          <Progress value={seller.governance?.trust_score || 100} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <p>Fulfillment: {seller.governance?.fulfillment_rate || 100}%</p>
                          <p className="text-muted-foreground">
                            Cancel Rate: {seller.governance?.cancellation_rate || 0}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(seller.governance?.warning_count || 0) > 0 && (
                            <Badge variant="outline" className="text-yellow-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {seller.governance?.warning_count} warnings
                            </Badge>
                          )}
                          {(seller.governance?.strike_count || 0) > 0 && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              {seller.governance?.strike_count} strikes
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          seller.status === 'active' ? 'default' :
                          seller.status === 'suspended' ? 'destructive' : 'secondary'
                        }>
                          {seller.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog open={actionDialogOpen && selectedSeller?.id === seller.id} onOpenChange={(open) => {
                          setActionDialogOpen(open);
                          if (open) setSelectedSeller(seller);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Take Action: {seller.shop_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-secondary/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Current Trust Score</p>
                                <p className={`text-2xl font-bold ${getTrustScoreColor(seller.governance?.trust_score || 100)}`}>
                                  {seller.governance?.trust_score || 100}
                                </p>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Action Type</label>
                                <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="warning">Issue Warning</SelectItem>
                                    <SelectItem value="strike">Issue Strike</SelectItem>
                                    {seller.status !== 'suspended' && (
                                      <SelectItem value="suspend">Suspend Seller</SelectItem>
                                    )}
                                    {seller.status === 'suspended' && (
                                      <SelectItem value="reactivate">Reactivate Seller</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Trust Score Adjustment</label>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    type="number"
                                    value={trustAdjustment}
                                    onChange={(e) => setTrustAdjustment(parseInt(e.target.value) || 0)}
                                    min={-100}
                                    max={100}
                                    className="w-24"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    New score: {Math.max(0, Math.min(100, (seller.governance?.trust_score || 100) + trustAdjustment))}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium">Reason</label>
                                <Textarea 
                                  placeholder="Explain the reason for this action..."
                                  value={actionReason}
                                  onChange={(e) => setActionReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSellerAction}
                                variant={actionType === 'reactivate' ? 'default' : 'destructive'}
                                disabled={!actionReason}
                              >
                                {actionType === 'warning' && 'Issue Warning'}
                                {actionType === 'strike' && 'Issue Strike'}
                                {actionType === 'suspend' && 'Suspend Seller'}
                                {actionType === 'reactivate' && 'Reactivate'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Action History
              </CardTitle>
              <CardDescription>Recent actions taken on sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.sellers?.shop_name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.action_type === 'reactivate' ? 'default' :
                          log.action_type === 'suspend' ? 'destructive' :
                          log.action_type === 'strike' ? 'destructive' : 'secondary'
                        }>
                          {log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{log.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
