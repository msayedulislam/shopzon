import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

export default function SellerEarnings() {
  const { seller } = useOutletContext<{ seller: any }>();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalCommission: 0,
    pendingAmount: 0,
    withdrawnAmount: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orderEarnings, setOrderEarnings] = useState<any[]>([]);

  useEffect(() => {
    if (seller) {
      fetchData();
    }
  }, [seller, period]);

  const fetchData = async () => {
    if (!seller) return;
    setLoading(true);

    try {
      // Get order items for earnings
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders (
            id,
            order_number,
            status,
            created_at
          )
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      // Get transactions
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      let totalEarnings = 0;
      let totalCommission = 0;
      let thisMonthEarnings = 0;
      let lastMonthEarnings = 0;

      (orderItems || []).forEach((item) => {
        const sellerAmount = item.seller_amount || (item.price * item.quantity * 0.9);
        const commission = item.commission_amount || (item.price * item.quantity * 0.1);
        
        if (item.order?.status === 'delivered') {
          totalEarnings += sellerAmount;
          totalCommission += commission;

          const orderDate = new Date(item.order.created_at);
          if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) {
            thisMonthEarnings += sellerAmount;
          } else if (orderDate.getMonth() === (thisMonth - 1) && orderDate.getFullYear() === thisYear) {
            lastMonthEarnings += sellerAmount;
          }
        }
      });

      // Calculate withdrawn and pending
      const withdrawnAmount = (txns || [])
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingAmount = (seller.balance || 0);

      setStats({
        totalEarnings,
        totalCommission,
        pendingAmount,
        withdrawnAmount,
        thisMonthEarnings,
        lastMonthEarnings,
      });

      setTransactions(txns || []);
      setOrderEarnings(orderItems?.filter(item => item.order?.status === 'delivered') || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const earningsChange = stats.lastMonthEarnings > 0 
    ? ((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatPrice(stats.totalEarnings)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold mt-1">
                  {formatPrice(stats.thisMonthEarnings)}
                </p>
                {Number(earningsChange) !== 0 && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${Number(earningsChange) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(earningsChange) > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(Number(earningsChange))}%
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatPrice(stats.pendingAmount)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commission</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatPrice(stats.totalCommission)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {seller.commission_rate || 10}% rate
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary-foreground/80">Available for Withdrawal</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(seller.balance || 0)}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">
                Commission rate: {seller.commission_rate || 10}% • Level: {seller.level || 'bronze'}
              </p>
            </div>
            <Button variant="secondary" className="gap-2" disabled>
              <Wallet className="h-4 w-4" />
              Request Withdrawal
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {orderEarnings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No earnings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderEarnings.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.order?.order_number} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +{formatPrice(item.seller_amount || item.price * item.quantity * 0.9)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {txn.type === 'credit' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.description || txn.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatPrice(txn.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/50 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">Gross Sales</p>
              <p className="text-xl font-bold mt-1">
                {formatPrice(stats.totalEarnings + stats.totalCommission)}
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">Platform Commission</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                -{formatPrice(stats.totalCommission)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200">
              <p className="text-sm text-green-700">Net Earnings</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatPrice(stats.totalEarnings)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}