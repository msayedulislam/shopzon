import { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Loader2, Store, Clock, AlertTriangle, UserCheck, Filter, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export default function AdminSellers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSellerStatus = async (sellerId: string, status: 'active' | 'suspended', reason?: string) => {
    setActionLoading(sellerId);
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ status })
        .eq('id', sellerId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: status === 'active' ? 'approve_seller' : 'suspend_seller',
        entity_type: 'seller',
        entity_id: sellerId,
        details: { status, reason },
      });

      // Log to seller action logs
      await supabase.from('seller_action_logs').insert({
        seller_id: sellerId,
        admin_id: user?.id,
        action_type: status === 'active' ? 'approved' : 'suspended',
        reason: reason || null,
      });

      toast({
        title: status === 'active' ? 'Seller Approved' : 'Seller Suspended',
        description: status === 'active' 
          ? 'The seller can now start listing products.' 
          : 'The seller has been suspended.',
      });
      
      fetchSellers();
      setShowRejectDialog(false);
      setSelectedSeller(null);
      setRejectReason('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingSellers = sellers.filter(s => s.status === 'pending');
  const activeSellers = sellers.filter(s => s.status === 'active');
  const suspendedSellers = sellers.filter(s => s.status === 'suspended');

  const filterSellers = (list: any[]) => 
    list.filter(
      (s) =>
        s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone?.includes(searchQuery)
    );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SellerCard = ({ seller, showActions = true }: { seller: any; showActions?: boolean }) => (
    <div className="bg-card border rounded-2xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          <AvatarImage src={seller.logo_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {seller.shop_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg truncate">{seller.shop_name}</h3>
            <Badge className={`${statusColors[seller.status]} border-0 capitalize`}>
              {seller.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {seller.level}
            </Badge>
          </div>
          
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            {seller.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{seller.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <span>{seller.phone}</span>
            </div>
            {seller.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{seller.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Applied {format(new Date(seller.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {seller.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {seller.description}
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Commission: <span className="font-medium text-foreground">{seller.commission_rate}%</span>
            </span>
            <span className="text-muted-foreground">
              Sales: <span className="font-medium text-foreground">{seller.total_sales || 0}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {seller.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700"
                  onClick={() => updateSellerStatus(seller.id, 'active')}
                  disabled={actionLoading === seller.id}
                >
                  {actionLoading === seller.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    setSelectedSeller(seller);
                    setShowRejectDialog(true);
                  }}
                  disabled={actionLoading === seller.id}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {seller.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive"
                onClick={() => {
                  setSelectedSeller(seller);
                  setShowRejectDialog(true);
                }}
                disabled={actionLoading === seller.id}
              >
                <X className="h-4 w-4" />
                Suspend
              </Button>
            )}
            {seller.status === 'suspended' && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-green-600"
                onClick={() => updateSellerStatus(seller.id, 'active')}
                disabled={actionLoading === seller.id}
              >
                {actionLoading === seller.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Reactivate
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Sellers</h1>
          <p className="text-muted-foreground">Review and manage seller applications</p>
        </div>
        
        {pendingSellers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{pendingSellers.length} pending approval{pendingSellers.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingSellers.length}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSellers.length}</p>
              <p className="text-sm text-muted-foreground">Active Sellers</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{suspendedSellers.length}</p>
              <p className="text-sm text-muted-foreground">Suspended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {pendingSellers.length > 0 && (
              <Badge className="ml-1 bg-yellow-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {pendingSellers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Active ({activeSellers.length})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Suspended ({suspendedSellers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filterSellers(pendingSellers).length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium">No pending applications</p>
              <p className="text-muted-foreground">All seller applications have been reviewed</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filterSellers(pendingSellers).map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filterSellers(activeSellers).length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border">
              <Store className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium">No active sellers</p>
              <p className="text-muted-foreground">Approve pending applications to add sellers</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filterSellers(activeSellers).map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          {filterSellers(suspendedSellers).length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium">No suspended sellers</p>
              <p className="text-muted-foreground">All sellers are in good standing</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filterSellers(suspendedSellers).map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject/Suspend Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSeller?.status === 'pending' ? 'Reject Application' : 'Suspend Seller'}
            </DialogTitle>
            <DialogDescription>
              {selectedSeller?.status === 'pending' 
                ? `Are you sure you want to reject ${selectedSeller?.shop_name}'s application?`
                : `Are you sure you want to suspend ${selectedSeller?.shop_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Provide a reason for this action..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => updateSellerStatus(selectedSeller?.id, 'suspended', rejectReason)}
              disabled={actionLoading === selectedSeller?.id}
            >
              {actionLoading === selectedSeller?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {selectedSeller?.status === 'pending' ? 'Reject' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
