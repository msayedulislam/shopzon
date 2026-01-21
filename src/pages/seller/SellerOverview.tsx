import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Plus,
  Star,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { SellerOnboardingChecklist } from '@/components/seller/SellerOnboardingChecklist';
import { SellerQuickActions } from '@/components/seller/SellerQuickActions';
import { SellerPerformanceChart } from '@/components/seller/SellerPerformanceChart';

export default function SellerOverview() {
  const { seller } = useOutletContext<{ seller: any }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (seller) {
      fetchData();
    }
  }, [seller]);

  const fetchData = async () => {
    if (!seller) return;

    try {
      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, status, stock, sold, price')
        .eq('seller_id', seller.id);

      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.status === 'approved').length || 0;
      const pendingProducts = products?.filter(p => p.status === 'pending').length || 0;
      const lowStockProducts = products?.filter(p => p.stock < 10).length || 0;

      // Top selling products
      const sortedProducts = [...(products || [])].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
      setTopProducts(sortedProducts);

      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders (
            id,
            order_number,
            status,
            created_at,
            shipping_name
          )
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      const pendingOrderIds = new Set<string>();

      (orderItems || []).forEach((item) => {
        const sellerAmount = item.seller_amount || (item.price * item.quantity * 0.9);
        
        if (item.order?.status === 'delivered') {
          totalEarnings += sellerAmount;
          
          const orderDate = new Date(item.order.created_at);
          if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) {
            thisMonthEarnings += sellerAmount;
          }
        }

        if (['pending', 'confirmed'].includes(item.order?.status)) {
          pendingOrderIds.add(item.order.id);
        }
      });

      // Group orders
      const uniqueOrders = new Set((orderItems || []).map(i => i.order?.id)).size;

      setStats({
        totalProducts,
        activeProducts,
        pendingProducts,
        totalOrders: uniqueOrders,
        pendingOrders: pendingOrderIds.size,
        totalEarnings,
        thisMonthEarnings,
        lowStockProducts,
      });

      // Recent orders (unique)
      const ordersMap = new Map();
      (orderItems || []).forEach(item => {
        if (item.order && !ordersMap.has(item.order.id)) {
          ordersMap.set(item.order.id, {
            ...item.order,
            items: [item],
            totalAmount: item.seller_amount || item.price * item.quantity,
          });
        } else if (item.order) {
          const existing = ordersMap.get(item.order.id);
          existing.items.push(item);
          existing.totalAmount += item.seller_amount || item.price * item.quantity;
        }
      });
      setRecentOrders(Array.from(ordersMap.values()).slice(0, 5));

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
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
      {/* Onboarding Checklist */}
      {seller && <SellerOnboardingChecklist seller={seller} />}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {seller?.shop_name}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your store today.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/seller/dashboard/products">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatPrice(stats.totalEarnings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This month: {formatPrice(stats.thisMonthEarnings)}
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
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                {stats.pendingOrders > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {stats.pendingOrders} pending
                  </p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeProducts} active, {stats.pendingProducts} pending
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.lowStockProducts > 0 ? 'border-orange-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alert</p>
                <p className={`text-2xl font-bold mt-1 ${stats.lowStockProducts > 0 ? 'text-orange-600' : ''}`}>
                  {stats.lowStockProducts}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  products need restock
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stats.lowStockProducts > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                <AlertTriangle className={`h-6 w-6 ${stats.lowStockProducts > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <SellerQuickActions />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/seller/dashboard/orders" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground">Orders will appear here when customers purchase your products.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.shipping_name} • {order.items?.length} item(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                        {order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/seller/dashboard/products" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No products yet</p>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link to="/seller/dashboard/products">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(product.price)} • {product.sold || 0} sold
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${product.status === 'approved' ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}`}>
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shop Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Shop Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{seller?.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <p className="text-sm text-muted-foreground">Shop Rating</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <p className="text-2xl font-bold text-blue-600">{seller?.total_sales || 0}</p>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
              <p className="text-2xl font-bold capitalize text-purple-600">{seller?.level || 'bronze'}</p>
              <p className="text-sm text-muted-foreground">Seller Level</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <p className="text-2xl font-bold text-green-600">{seller?.commission_rate || 10}%</p>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics Dashboard */}
      {seller && <SellerPerformanceChart sellerId={seller.id} />}
    </div>
  );
}