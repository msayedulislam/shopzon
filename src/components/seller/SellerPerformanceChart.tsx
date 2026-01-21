import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { TrendingUp, TrendingDown, Minus, Users, ShoppingCart, Package, Loader2 } from 'lucide-react';

interface SellerPerformanceChartProps {
  sellerId: string;
}

interface DailyData {
  date: string;
  orders: number;
  revenue: number;
  products: number;
}

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#6366f1',
  out_for_delivery: '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  returned: '#f97316',
};

export function SellerPerformanceChart({ sellerId }: SellerPerformanceChartProps) {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<DailyData[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    prevRevenue: 0,
    totalOrders: 0,
    prevOrders: 0,
    avgOrderValue: 0,
    prevAvgOrderValue: 0,
    uniqueCustomers: 0,
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [sellerId]);

  const fetchPerformanceData = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get order items for this seller
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders (
            id,
            order_number,
            status,
            created_at,
            user_id
          )
        `)
        .eq('seller_id', sellerId);

      if (!orderItems) {
        setLoading(false);
        return;
      }

      // Process data for charts
      const dailyMap = new Map<string, { orders: Set<string>; revenue: number; products: number }>();
      const statusCount: Record<string, number> = {};
      const customerSet = new Set<string>();

      let currentPeriodRevenue = 0;
      let prevPeriodRevenue = 0;
      let currentPeriodOrders = new Set<string>();
      let prevPeriodOrders = new Set<string>();

      orderItems.forEach((item) => {
        if (!item.order) return;

        const orderDate = new Date(item.order.created_at);
        const dateKey = orderDate.toISOString().split('T')[0];
        const sellerAmount = item.seller_amount || (item.price * item.quantity * 0.9);

        // Daily data (last 30 days)
        if (orderDate >= thirtyDaysAgo) {
          if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { orders: new Set(), revenue: 0, products: 0 });
          }
          const day = dailyMap.get(dateKey)!;
          day.orders.add(item.order.id);
          day.revenue += sellerAmount;
          day.products += item.quantity;

          currentPeriodRevenue += sellerAmount;
          currentPeriodOrders.add(item.order.id);
        } else if (orderDate >= sixtyDaysAgo) {
          prevPeriodRevenue += sellerAmount;
          prevPeriodOrders.add(item.order.id);
        }

        // Order status distribution
        const status = item.order.status || 'pending';
        statusCount[status] = (statusCount[status] || 0) + 1;

        // Unique customers
        if (item.order.user_id) {
          customerSet.add(item.order.user_id);
        }
      });

      // Generate last 30 days data
      const chartData: DailyData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const dayData = dailyMap.get(dateKey);
        
        chartData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: dayData?.orders.size || 0,
          revenue: dayData?.revenue || 0,
          products: dayData?.products || 0,
        });
      }

      // Order status data for pie chart
      const statusData: OrderStatusData[] = Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value,
        color: STATUS_COLORS[name] || '#9ca3af',
      }));

      setSalesData(chartData);
      setOrderStatusData(statusData);
      setStats({
        totalRevenue: currentPeriodRevenue,
        prevRevenue: prevPeriodRevenue,
        totalOrders: currentPeriodOrders.size,
        prevOrders: prevPeriodOrders.size,
        avgOrderValue: currentPeriodOrders.size > 0 ? currentPeriodRevenue / currentPeriodOrders.size : 0,
        prevAvgOrderValue: prevPeriodOrders.size > 0 ? prevPeriodRevenue / prevPeriodOrders.size : 0,
        uniqueCustomers: customerSet.size,
      });

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const TrendIndicator = ({ current, previous }: { current: number; previous: number }) => {
    const change = getPercentChange(current, previous);
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          +{change.toFixed(1)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <TrendingDown className="h-4 w-4 mr-1" />
          {change.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Minus className="h-4 w-4 mr-1" />
        0%
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" id="analytics">
      {/* Performance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Revenue (30d)</span>
              <TrendIndicator current={stats.totalRevenue} previous={stats.prevRevenue} />
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Orders (30d)</span>
              <TrendIndicator current={stats.totalOrders} previous={stats.prevOrders} />
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Order Value</span>
              <TrendIndicator current={stats.avgOrderValue} previous={stats.prevAvgOrderValue} />
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Unique Customers</span>
            </div>
            <p className="text-2xl font-bold">{stats.uniqueCustomers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sales Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="status">Order Status</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="orders" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="status" className="h-[300px]">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No order data available</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
