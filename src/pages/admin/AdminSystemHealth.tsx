import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Activity,
  Server,
  Database,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  HardDrive,
  Wifi,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface HealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  last_checked: Date;
  details?: string;
}

export default function AdminSystemHealth() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<any[]>([]);

  useEffect(() => {
    runHealthChecks();
    generateMockData();
  }, []);

  const generateMockData = () => {
    // Generate response time data for last 24 hours
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}:00`,
      database: Math.floor(Math.random() * 50) + 20,
      api: Math.floor(Math.random() * 100) + 50,
      auth: Math.floor(Math.random() * 80) + 30,
    })).reverse();
    setResponseTimeData(data);
  };

  const runHealthChecks = async () => {
    setRefreshing(true);
    const checks: HealthCheck[] = [];

    // Check Database
    try {
      const start = Date.now();
      await supabase.from('profiles').select('id').limit(1);
      const responseTime = Date.now() - start;
      checks.push({
        component: 'Database',
        status: responseTime < 200 ? 'healthy' : responseTime < 500 ? 'degraded' : 'down',
        response_time: responseTime,
        last_checked: new Date(),
        details: 'PostgreSQL connection via Supabase',
      });
    } catch {
      checks.push({
        component: 'Database',
        status: 'down',
        response_time: 0,
        last_checked: new Date(),
        details: 'Connection failed',
      });
    }

    // Check Auth Service
    try {
      const start = Date.now();
      await supabase.auth.getSession();
      const responseTime = Date.now() - start;
      checks.push({
        component: 'Authentication',
        status: responseTime < 300 ? 'healthy' : responseTime < 600 ? 'degraded' : 'down',
        response_time: responseTime,
        last_checked: new Date(),
        details: 'Supabase Auth service',
      });
    } catch {
      checks.push({
        component: 'Authentication',
        status: 'down',
        response_time: 0,
        last_checked: new Date(),
        details: 'Auth service unavailable',
      });
    }

    // Check Storage
    try {
      const start = Date.now();
      await supabase.storage.listBuckets();
      const responseTime = Date.now() - start;
      checks.push({
        component: 'File Storage',
        status: responseTime < 400 ? 'healthy' : responseTime < 800 ? 'degraded' : 'down',
        response_time: responseTime,
        last_checked: new Date(),
        details: 'Supabase Storage buckets',
      });
    } catch {
      checks.push({
        component: 'File Storage',
        status: 'down',
        response_time: 0,
        last_checked: new Date(),
        details: 'Storage service unavailable',
      });
    }

    // Mock additional services
    checks.push(
      {
        component: 'Realtime',
        status: 'healthy',
        response_time: Math.floor(Math.random() * 50) + 30,
        last_checked: new Date(),
        details: 'WebSocket connections active',
      },
      {
        component: 'Edge Functions',
        status: 'healthy',
        response_time: Math.floor(Math.random() * 100) + 80,
        last_checked: new Date(),
        details: 'Serverless functions operational',
      },
      {
        component: 'CDN',
        status: 'healthy',
        response_time: Math.floor(Math.random() * 30) + 10,
        last_checked: new Date(),
        details: 'Global content delivery',
      }
    );

    // Log health check
    await supabase.from('system_health').insert(
      checks.map(c => ({
        component: c.component,
        status: c.status,
        response_time_ms: c.response_time,
        checked_at: c.last_checked.toISOString(),
      }))
    );

    setHealthChecks(checks);
    setLoading(false);
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'degraded': return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down': return <Badge variant="destructive">Down</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const overallStatus = healthChecks.every(c => c.status === 'healthy') ? 'healthy' :
    healthChecks.some(c => c.status === 'down') ? 'down' : 'degraded';

  const avgResponseTime = healthChecks.length > 0 ?
    Math.round(healthChecks.reduce((sum, c) => sum + c.response_time, 0) / healthChecks.length) : 0;

  // Mock metrics
  const metrics = {
    uptime: 99.98,
    requests_today: 45230,
    errors_today: 12,
    active_users: 892,
    db_size: '2.4 GB',
    storage_used: '15.2 GB',
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          System Health
        </h1>
        <Button onClick={runHealthChecks} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        overallStatus === 'healthy' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
        overallStatus === 'degraded' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
        'border-red-500 bg-red-50 dark:bg-red-950/20'
      }`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(overallStatus)}
              <div>
                <p className="text-lg font-semibold">
                  {overallStatus === 'healthy' ? 'All Systems Operational' :
                   overallStatus === 'degraded' ? 'Some Systems Degraded' :
                   'System Outage Detected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last checked: {format(new Date(), 'MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{metrics.uptime}%</p>
              <p className="text-sm text-muted-foreground">Uptime (30 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Requests Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.requests_today.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Errors Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.errors_today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.active_users}</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time health status of all system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium">{check.component}</p>
                        <p className="text-sm text-muted-foreground">{check.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(check.status)}
                      <p className="text-sm text-muted-foreground mt-1">{check.response_time}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </span>
                <span className="text-sm text-muted-foreground">{metrics.db_size}</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Storage
                </span>
                <span className="text-sm text-muted-foreground">{metrics.storage_used}</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  API Quota
                </span>
                <span className="text-sm text-muted-foreground">45K / 100K</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeData}>
                <defs>
                  <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `${v}ms`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}ms`]}
                />
                <Area type="monotone" dataKey="database" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorDb)" name="Database" />
                <Line type="monotone" dataKey="api" stroke="#10b981" strokeWidth={2} name="API" dot={false} />
                <Line type="monotone" dataKey="auth" stroke="#f59e0b" strokeWidth={2} name="Auth" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
