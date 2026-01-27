import { useState, useEffect } from 'react';
import { Ticket, Copy, Check, Loader2, Gift, Clock, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, differenceInDays } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_purchase: number | null;
  max_discount: number | null;
  expires_at: string | null;
  is_active: boolean;
}

export default function CouponsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out expired coupons
      const activeCoupons = (data || []).filter(coupon => {
        if (!coupon.expires_at) return true;
        return !isPast(new Date(coupon.expires_at));
      });
      
      setCoupons(activeCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({ title: 'Coupon code copied!' });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({ 
        title: 'Failed to copy', 
        description: 'Please copy the code manually',
        variant: 'destructive' 
      });
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% OFF`;
    }
    return `৳${coupon.value} OFF`;
  };

  const getDaysRemaining = (expiresAt: string) => {
    const days = differenceInDays(new Date(expiresAt), new Date());
    if (days <= 0) return 'Expires today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Coupons</h1>
            <p className="text-muted-foreground">
              Available discount codes for your orders
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>{coupons.length} coupons available</span>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No coupons available</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Check back later for exclusive discount codes and special offers.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-card rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Discount Badge */}
                <div className="bg-gradient-to-br from-primary to-primary/80 p-6 flex items-center justify-center sm:w-40">
                  <div className="text-center text-primary-foreground">
                    <Percent className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xl sm:text-2xl font-bold">{formatDiscount(coupon)}</p>
                  </div>
                </div>

                {/* Coupon Details */}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      {/* Code */}
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1.5 bg-secondary rounded-lg font-mono font-semibold text-sm">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(coupon.code)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Conditions */}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {coupon.min_purchase && (
                          <span className="px-2 py-1 bg-secondary rounded-full">
                            Min. purchase ৳{coupon.min_purchase}
                          </span>
                        )}
                        {coupon.max_discount && coupon.type === 'percentage' && (
                          <span className="px-2 py-1 bg-secondary rounded-full">
                            Max. discount ৳{coupon.max_discount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expiry & Apply */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      {coupon.expires_at && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {getDaysRemaining(coupon.expires_at)}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => copyCode(coupon.code)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Gift className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Copy the coupon code and apply it at checkout to get your discount. 
            Some coupons may have minimum purchase requirements or maximum discount limits.
          </span>
        </p>
      </div>
    </div>
  );
}
