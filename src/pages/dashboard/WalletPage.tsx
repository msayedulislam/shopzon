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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet balance and view transactions</p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-foreground/80">
            <Wallet className="h-5 w-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-4">
            {formatPrice(wallet?.balance || 0)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-1">
                <TrendingUp className="h-4 w-4" />
                Total Credited
              </div>
              <p className="font-semibold">{formatPrice(wallet?.total_credited || 0)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-1">
                <CreditCard className="h-4 w-4" />
                Total Spent
              </div>
              <p className="font-semibold">{formatPrice(wallet?.total_spent || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">How to use your wallet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your wallet balance can be used during checkout. When placing an order, you'll have the option to apply your wallet balance to reduce the total amount. Refunds approved with "Credit to Wallet" will be added here automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Your wallet credits and spending will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'credit' || tx.type === 'refund' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {getTransactionIcon(tx.type, tx.reference_type)}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}</span>
                        {tx.reference_type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {tx.reference_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(tx.type)}`}>
                      {tx.amount > 0 ? '+' : ''}{formatPrice(Math.abs(tx.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {formatPrice(tx.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
