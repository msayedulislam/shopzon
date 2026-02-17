import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';

interface WalletData {
  id: string;
  balance: number;
  total_credited: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reference_type: string | null;
  description: string | null;
  balance_after: number;
  created_at: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (walletData) {
        setWallet(walletData);

        // Fetch transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false });

        setTransactions(txData || []);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, referenceType: string | null) => {
    if (referenceType === 'refund') return <RotateCcw className="h-4 w-4" />;
    if (referenceType === 'order') return <ShoppingBag className="h-4 w-4" />;
    if (type === 'credit') return <ArrowDownLeft className="h-4 w-4" />;
    return <ArrowUpRight className="h-4 w-4" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' || type === 'refund' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">My Govaly Wallet</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Manage your premium balance and rewards
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter italic text-sm">
              <CreditCard className="h-4 w-4" strokeWidth={3} />
              ACCOUNT ACTIVE
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Wallet Balance Card - Enhanced Govaly Red */}
          <div className="relative overflow-hidden bg-gradient-premium p-10 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20">
                  <Wallet className="h-5 w-5" strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Available Balance</span>
                </div>
                <TrendingUp className="h-8 w-8 text-white/40" />
              </div>

              <div className="text-5xl font-black uppercase tracking-tighter italic">
                {formatPrice(wallet?.balance || 0)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">
                    <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={3} />
                    Total Credited
                  </div>
                  <p className="text-lg font-black tracking-tighter italic">{formatPrice(wallet?.total_credited || 0)}</p>
                </div>
                <div className="bg-white/10 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} />
                    Total Spent
                  </div>
                  <p className="text-lg font-black tracking-tighter italic">{formatPrice(wallet?.total_spent || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History - High Density List */}
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border/10">
              <h2 className="text-sm font-black uppercase tracking-widest italic">Transaction History</h2>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-secondary px-3 py-1">Recent Activity</Badge>
            </div>

            {transactions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No transaction data available</p>
              </div>
            ) : (
              <div className="divide-y divide-border/5">
                {transactions.map((tx) => (
                  <div key={tx.id} className="px-8 py-5 hover:bg-secondary/20 transition-all group">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-current/10 shadow-inner ${tx.type === 'credit' || tx.type === 'refund' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                          {getTransactionIcon(tx.type, tx.reference_type)}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tighter italic truncate group-hover:text-primary transition-colors">
                            {tx.description || tx.type}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            <span>{format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}</span>
                            {tx.reference_type && (
                              <Badge variant="outline" className="text-[7px] font-black px-1.5 h-4 border-muted-foreground/20 text-muted-foreground">
                                {tx.reference_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-black uppercase tracking-tighter italic ${getTransactionColor(tx.type)}`}>
                          {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}{formatPrice(Math.abs(tx.amount))}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
                          Balance: {formatPrice(tx.balance_after)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card p-8 rounded-[2.5rem] border border-border/5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest italic mb-6">How it works</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <CreditCard className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Instant Checkout</p>
                  <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase">Apply your balance instantly during the payment process.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600">
                  <RotateCcw className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Refund Credits</p>
                  <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase">Opt for wallet credits during returns for 5% bonus rewards.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
            <h3 className="text-[11px] font-black uppercase tracking-widest italic text-primary mb-4">Govaly Points</h3>
            <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase tracking-tight">
              Every transaction through Govaly Wallet earns you 2X Loyalty Points compared to standard payment methods.
            </p>
            <Button variant="outline" className="mt-6 w-full rounded-2xl border-primary/20 text-primary font-black uppercase tracking-widest text-[9px] h-10 shadow-sm shadow-primary/5">
              Explore Rewards
            </Button>
          </div>
        </div>
      </div>
      );
}
