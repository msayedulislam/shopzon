import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

export default function SellerOverview() {
  const { seller } = useOutletContext<{ seller: any }>();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (seller) {
      fetchStats();
      fetchRecentOrders();
    }
  }, [seller]);

  const fetchStats = async () => {
    if (!seller) return;

    try {
      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id);

      // Get low stock products
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', seller.id)
        .lt('stock', 10);

      // Get order stats
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('price, quantity, seller_amount')
        .eq('seller_id', seller.id);

      const totalOrders = orderItems?.length || 0;
      const totalEarnings = orderItems?.reduce((sum, item) => sum + (item.seller_amount || 0), 0) || 0;

      setStats({
        totalProducts: productCount || 0,
        totalOrders,
        totalEarnings,
        pendingOrders: 0,
        lowStockProducts: lowStockCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentOrders = async () => {
    if (!seller) return;

    try {
      const { data } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders (
            order_number,
            status,
            created_at
          )
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {seller?.shop_name}!</h1>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(stats.totalEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.lowStockProducts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No orders yet. Start by adding products!
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.order?.order_number} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatPrice(item.seller_amount || item.price * item.quantity)}
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
    </div>
  );
}
