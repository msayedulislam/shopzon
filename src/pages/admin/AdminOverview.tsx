import { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Users, Store, Package, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type DateRange = { from: Date; to: Date };

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingSellers: 0,
    pendingProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [dailyOrdersData, setDailyOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [datePreset, setDatePreset] = useState('7days');

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  useEffect(() => {
    fetchRevenueData();
    fetchOrderStatusData();
  }, [dateRange]);

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    let from: Date;

    switch (preset) {
      case '7days':
        from = subDays(now, 7);
        break;
      case '30days':
        from = subDays(now, 30);
        break;
      case 'week':
        from = startOfWeek(now);
        break;
      case 'month':
        from = startOfMonth(now);
        break;
      case 'year':
        from = startOfYear(now);
        break;
      default:
        from = subDays(now, 7);
    }

    setDateRange({ from, to: now });
  };

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: sellersCount },
        { count: productsCount },
        { count: ordersCount },
        { count: pendingSellersCount },
        { count: pendingProductsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sellers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const { data: orders } = await supabase.from('orders').select('total, created_at');
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayOrders = orders?.filter(o => new Date(o.created_at) >= today) || [];
      const yesterdayOrders = orders?.filter(o => {
        const date = new Date(o.created_at);
        return date >= yesterday && date < today;
      }) || [];

      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalUsers: usersCount || 0,
        totalSellers: sellersCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingSellers: pendingSellersCount || 0,
        pendingProducts: pendingProductsCount || 0,
        todayOrders: todayOrders.length,
        todayRevenue,
        yesterdayRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: true });

      if (!orders || orders.length === 0) {
        const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        const sampleData = Array.from({ length: Math.min(daysDiff, 14) }, (_, i) => {
          const date = new Date(dateRange.from);
          date.setDate(date.getDate() + i);
          return {
            date: format(date, 'MMM d'),
            revenue: Math.floor(Math.random() * 50000) + 10000,
            orders: Math.floor(Math.random() * 20) + 5,
          };
        });
        setRevenueData(sampleData);
        setDailyOrdersData(sampleData);
        return;
      }

      const grouped = orders.reduce((acc: any, order) => {
        const date = format(new Date(order.created_at), 'MMM d');
        if (!acc[date]) {
          acc[date] = { revenue: 0, orders: 0 };
        }
        acc[date].revenue += order.total || 0;
        acc[date].orders += 1;
        return acc;
      }, {});

      const chartData = Object.entries(grouped).map(([date, data]: [string, any]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));

      setRevenueData(chartData);
      setDailyOrdersData(chartData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchOrderStatusData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (!orders || orders.length === 0) {
        setOrderStatusData([
          { name: 'Pending', value: 12 },
          { name: 'Processing', value: 8 },
          { name: 'Shipped', value: 15 },
          { name: 'Delivered', value: 45 },
          { name: 'Cancelled', value: 5 },
        ]);
        return;
      }

      const statusCounts = orders.reduce((acc: any, order) => {
        const status = order.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value as number,
      }));

      setOrderStatusData(chartData);
    } catch (error) {
      console.error('Error fetching order status data:', error);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const revenueChange = stats.yesterdayRevenue > 0 
    ? ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue * 100).toFixed(1)
    : stats.todayRevenue > 0 ? '100' : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={datePreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {datePreset === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(stats.totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              {Number(revenueChange) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${Number(revenueChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {revenueChange}% from yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.todayOrders} orders today
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sellers
            </CardTitle>
            <Store className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSellers}</div>
            {stats.pendingSellers > 0 && (
              <p className="text-xs text-orange-500 mt-1">{stats.pendingSellers} pending approval</p>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            {stats.pendingProducts > 0 && (
              <p className="text-xs text-orange-500 mt-1">{stats.pendingProducts} pending review</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              Daily Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Today's Revenue</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatPrice(stats.todayRevenue)}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Today's Orders</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">{stats.todayOrders}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{stats.totalUsers}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Store className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pending Reviews</span>
                </div>
                <p className="text-2xl font-bold text-purple-500">{stats.pendingSellers + stats.pendingProducts}</p>
              </div>
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
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 font-medium">{order.order_number}</td>
                      <td className="py-3 text-muted-foreground">{order.shipping_name}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status] || 'bg-gray-100'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">{formatPrice(order.total)}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
