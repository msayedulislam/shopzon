import { useState, useEffect } from 'react';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Store,
  FileText,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  admin_id: string | null;
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'neutral';
  change: number;
}

export default function AdminActivityDashboard() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalActions: 0,
    todayActions: 0,
    activeAdmins: 0,
    pendingTasks: 0,
    approvals: 0,
    rejections: 0,
    updates: 0,
    deletions: 0,
  });

  // Chart data
  const [activityByHour, setActivityByHour] = useState<any[]>([]);
  const [activityByType, setActivityByType] = useState<any[]>([]);
  const [actionDistribution, setActionDistribution] = useState<any[]>([]);
  const [entityMetrics, setEntityMetrics] = useState<any[]>([]);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchActivities(),
      fetchStats(),
      fetchChartData(),
      fetchPerformanceMetrics(),
    ]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const getTimeRangeDate = () => {
    switch (timeRange) {
      case '1h': return subHours(new Date(), 1);
      case '6h': return subHours(new Date(), 6);
      case '24h': return subDays(new Date(), 1);
      case '7d': return subDays(new Date(), 7);
      case '30d': return subDays(new Date(), 30);
      default: return subDays(new Date(), 1);
    }
  };

  const fetchActivities = async () => {
    try {
      const fromDate = getTimeRangeDate();
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const fromDate = getTimeRangeDate();
      const today = startOfDay(new Date());

      const [allLogs, todayLogs, pendingSellers, pendingProducts] = await Promise.all([
        supabase
          .from('admin_audit_logs')
          .select('action, admin_id')
          .gte('created_at', fromDate.toISOString()),
        supabase
          .from('admin_audit_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('sellers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      const logs = allLogs.data || [];
      const uniqueAdmins = new Set(logs.map(l => l.admin_id).filter(Boolean));

      const actionCounts = logs.reduce((acc: any, log) => {
        const action = log.action.toLowerCase();
        if (action.includes('approve')) acc.approvals++;
        else if (action.includes('reject')) acc.rejections++;
        else if (action.includes('update') || action.includes('edit')) acc.updates++;
        else if (action.includes('delete')) acc.deletions++;
        return acc;
      }, { approvals: 0, rejections: 0, updates: 0, deletions: 0 });

      setStats({
        totalActions: logs.length,
        todayActions: todayLogs.count || 0,
        activeAdmins: uniqueAdmins.size,
        pendingTasks: (pendingSellers.count || 0) + (pendingProducts.count || 0),
        ...actionCounts,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const fromDate = getTimeRangeDate();
      const { data: logs } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true });

      if (!logs || logs.length === 0) {
        // Generate sample data for visualization
        generateSampleData();
        return;
      }

      // Activity by hour/day
      const hourlyData = logs.reduce((acc: any, log) => {
        const key = timeRange === '7d' || timeRange === '30d' 
          ? format(new Date(log.created_at), 'MMM d')
          : format(new Date(log.created_at), 'HH:00');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setActivityByHour(Object.entries(hourlyData).map(([time, count]) => ({
        time,
        actions: count,
      })));

      // Activity by entity type
      const entityData = logs.reduce((acc: any, log) => {
        acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
        return acc;
      }, {});

      setActivityByType(Object.entries(entityData).map(([entity, count]) => ({
        entity: entity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
      })));

      // Action distribution
      const actionData = logs.reduce((acc: any, log) => {
        const action = log.action.split('_')[0];
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      }, {});

      setActionDistribution(Object.entries(actionData).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })));

      // Entity metrics for radial chart
      const entityMetricsData = Object.entries(entityData)
        .slice(0, 5)
        .map(([entity, count], index) => ({
          name: entity.replace(/_/g, ' '),
          value: count as number,
          fill: COLORS[index % COLORS.length],
        }));
      setEntityMetrics(entityMetricsData);

    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const generateSampleData = () => {
    // Sample hourly data
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      actions: Math.floor(Math.random() * 15) + 2,
    }));
    setActivityByHour(hourlyData);

    // Sample entity data
    setActivityByType([
      { entity: 'Orders', count: 45 },
      { entity: 'Products', count: 32 },
      { entity: 'Sellers', count: 28 },
      { entity: 'Users', count: 20 },
      { entity: 'Refunds', count: 12 },
    ]);

    // Sample action distribution
    setActionDistribution([
      { name: 'Approve', value: 35 },
      { name: 'Update', value: 28 },
      { name: 'Create', value: 20 },
      { name: 'Reject', value: 10 },
      { name: 'Delete', value: 7 },
    ]);

    // Sample entity metrics
    setEntityMetrics([
      { name: 'Orders', value: 45, fill: COLORS[0] },
      { name: 'Products', value: 32, fill: COLORS[1] },
      { name: 'Sellers', value: 28, fill: COLORS[2] },
      { name: 'Users', value: 20, fill: COLORS[3] },
      { name: 'Refunds', value: 12, fill: COLORS[4] },
    ]);
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const [orders, products, sellers, refunds] = await Promise.all([
        supabase.from('orders').select('status, created_at'),
        supabase.from('products').select('status'),
        supabase.from('sellers').select('status'),
        supabase.from('refunds').select('status'),
      ]);

      const totalOrders = orders.data?.length || 1;
      const deliveredOrders = orders.data?.filter(o => o.status === 'delivered').length || 0;
      const orderFulfillmentRate = Math.round((deliveredOrders / totalOrders) * 100);

      const totalProducts = products.data?.length || 1;
      const approvedProducts = products.data?.filter(p => p.status === 'approved').length || 0;
      const productApprovalRate = Math.round((approvedProducts / totalProducts) * 100);

      const totalSellers = sellers.data?.length || 1;
      const activeSellers = sellers.data?.filter(s => s.status === 'active').length || 0;
      const sellerActivationRate = Math.round((activeSellers / totalSellers) * 100);

      const totalRefunds = refunds.data?.length || 1;
      const processedRefunds = refunds.data?.filter(r => r.status === 'completed' || r.status === 'approved').length || 0;
      const refundResolutionRate = Math.round((processedRefunds / totalRefunds) * 100);

      setPerformanceMetrics([
        {
          label: 'Order Fulfillment',
          value: orderFulfillmentRate,
          target: 95,
          trend: orderFulfillmentRate >= 90 ? 'up' : 'down',
          change: 2.5,
        },
        {
          label: 'Product Approval',
          value: productApprovalRate,
          target: 90,
          trend: productApprovalRate >= 85 ? 'up' : 'down',
          change: 5.2,
        },
        {
          label: 'Seller Activation',
          value: sellerActivationRate,
          target: 85,
          trend: sellerActivationRate >= 80 ? 'up' : 'neutral',
          change: 1.8,
        },
        {
          label: 'Refund Resolution',
          value: refundResolutionRate,
          target: 100,
          trend: refundResolutionRate >= 90 ? 'up' : 'down',
          change: -1.2,
        },
      ]);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('approve')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (actionLower.includes('reject')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit className="h-4 w-4 text-blue-500" />;
    if (actionLower.includes('delete')) return <Trash2 className="h-4 w-4 text-red-500" />;
    if (actionLower.includes('create')) return <UserPlus className="h-4 w-4 text-purple-500" />;
    if (actionLower.includes('view')) return <Eye className="h-4 w-4 text-gray-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getEntityIcon = (entity: string) => {
    switch (entity.toLowerCase()) {
      case 'order': case 'orders': return <ShoppingBag className="h-4 w-4" />;
      case 'product': case 'products': return <Package className="h-4 w-4" />;
      case 'seller': case 'sellers': return <Store className="h-4 w-4" />;
      case 'user': case 'users': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('approve')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (actionLower.includes('reject') || actionLower.includes('suspend')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (actionLower.includes('delete')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (actionLower.includes('create')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterEntity === 'all' || activity.entity_type === filterEntity;
    return matchesSearch && matchesFilter;
  });

  const entityTypes = [...new Set(activities.map(a => a.entity_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Activity Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Monitor admin actions and system performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{stats.totalActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats.todayActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Admins</p>
                <p className="text-2xl font-bold">{stats.activeAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approvals</p>
                <p className="text-xl font-bold text-green-600">{stats.approvals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejections</p>
                <p className="text-xl font-bold text-red-600">{stats.rejections}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Updates</p>
                <p className="text-xl font-bold text-blue-600">{stats.updates}</p>
              </div>
              <Edit className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deletions</p>
                <p className="text-xl font-bold">{stats.deletions}</p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Admin actions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityByHour}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actions"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActivity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity by Entity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Activity by Entity
            </CardTitle>
            <CardDescription>Actions grouped by entity type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis 
                    dataKey="entity" 
                    type="category" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Action Distribution
            </CardTitle>
            <CardDescription>Breakdown of action types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {actionDistribution.map((_, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{metric.value}%</span>
                    <div className={`flex items-center text-xs ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : 
                       metric.trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={metric.value} className="h-2" />
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-muted-foreground/50"
                    style={{ left: `${metric.target}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest admin actions and changes</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activities found
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-secondary">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getActionBadgeColor(activity.action)}>
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getEntityIcon(activity.entity_type)}
                          <span className="text-sm capitalize">
                            {activity.entity_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {typeof activity.details === 'object' 
                            ? JSON.stringify(activity.details).slice(0, 100) + '...'
                            : activity.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                      </p>
                      {activity.entity_id && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          #{activity.entity_id.slice(0, 8)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
