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
    <div className="space-y-8">
      {/* Header - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Privilege Archive</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Exclusive heritage rewards and seasonal protocols
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/5">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Ticket className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="pr-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Active Coupons</p>
              <p className="text-xl font-black uppercase tracking-tighter italic">{coupons.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Grid - High Density Legacy Style */}
      {coupons.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-20 text-center shadow-sm">
          <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 border border-border/10">
            <Gift className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4">No Active Privileges</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto leading-relaxed">
            Exclusive reward protocols are currently being calibrated. Check back soon for premium heritage offers.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white dark:bg-card rounded-[2.5rem] border-2 border-dashed border-primary/20 overflow-hidden hover:border-primary/40 transition-all group relative"
            >
              <div className="flex flex-col md:flex-row">
                {/* Visual Value Section */}
                <div className="bg-gradient-premium px-10 py-12 flex flex-col items-center justify-center md:w-56 shrink-0 relative overflow-hidden text-white">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                  <Percent className="h-8 w-8 text-white/40 mb-3" strokeWidth={3} />
                  <p className="text-3xl font-black uppercase tracking-tighter italic text-center">
                    {formatDiscount(coupon)}
                  </p>
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-card rounded-full" />
                </div>

                {/* Details Protocol Section */}
                <div className="flex-1 p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-secondary/40 px-6 py-3 rounded-2xl border border-border/5 flex items-center gap-4 shadow-inner group-hover:bg-secondary/60 transition-colors">
                          <code className="text-base font-black uppercase tracking-[0.2em] text-primary">{coupon.code}</code>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-muted-foreground hover:text-primary transition-all active:scale-95"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-5 w-5 text-emerald-500" strokeWidth={3} />
                            ) : (
                              <Copy className="h-5 w-5" strokeWidth={2.5} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        {coupon.min_purchase && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Purchase: <span className="text-black dark:text-white">৳{coupon.min_purchase}</span></p>
                          </div>
                        )}
                        {coupon.max_discount && coupon.type === 'percentage' && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capped at: <span className="text-black dark:text-white">৳{coupon.max_discount}</span></p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:flex-col md:items-end md:justify-center">
                      {coupon.expires_at && (
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[9px] bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-2">
                          <Clock className="h-3.5 w-3.5" strokeWidth={3} />
                          {getDaysRemaining(coupon.expires_at)}
                        </div>
                      )}
                      <Button
                        onClick={() => copyCode(coupon.code)}
                        className="h-12 px-8 rounded-2xl bg-secondary hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-black/5"
                      >
                        Execute Protocol
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-card rounded-full hidden md:block" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Check Section */}
      <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary border border-primary/10">
            <Gift className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-1 italic">Fair Play Protocol</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed max-w-xl">
              Coupons are applicable to standard orders and may not be combined with Flash Sale artifacts unless specified in the heritage description.
            </p>
          </div>
        </div>
        <Button variant="outline" className="rounded-2xl border-primary/20 text-primary font-black uppercase tracking-widest text-[9px] h-11 px-8">
          View Full Terms
        </Button>
      </div>
    </div>
  );
}
