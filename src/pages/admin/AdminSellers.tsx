import { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSellers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const updateSellerStatus = async (sellerId: string, status: 'active' | 'suspended') => {
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
        details: { status },
      });

      toast({ title: `Seller ${status === 'active' ? 'approved' : 'suspended'}` });
      fetchSellers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredSellers = sellers.filter(
    (s) =>
      s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
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
      <h1 className="text-2xl font-bold">Manage Sellers</h1>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sellers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sellers Table */}
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium">Shop</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Level</th>
                <th className="text-left p-4 font-medium">Commission</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-secondary/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{seller.shop_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {seller.total_sales || 0} sales
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{seller.email}</p>
                    <p className="text-sm text-muted-foreground">{seller.phone}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize">
                      {seller.level}
                    </Badge>
                  </td>
                  <td className="p-4">{seller.commission_rate}%</td>
                  <td className="p-4">
                    <Badge className={statusColors[seller.status]}>
                      {seller.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {seller.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600"
                            onClick={() => updateSellerStatus(seller.id, 'active')}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                        </>
                      )}
                      {seller.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive"
                          onClick={() => updateSellerStatus(seller.id, 'suspended')}
                        >
                          <X className="h-4 w-4" />
                          Suspend
                        </Button>
                      )}
                      {seller.status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-green-600"
                          onClick={() => updateSellerStatus(seller.id, 'active')}
                        >
                          <Check className="h-4 w-4" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
