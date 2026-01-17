import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  Check,
  X,
  Search,
  Loader2,
  TrendingUp,
  Users,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6366f1'];

export default function AdminFraudDetection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await supabase
        .from('fraud_alerts')
        .select(`*, orders (order_number, total, shipping_name, shipping_phone)`)
        .order('created_at', { ascending: false });

      const alertsData = data || [];
      setAlerts(alertsData);

      setStats({
        total: alertsData.length,
        pending: alertsData.filter(a => a.status === 'pending').length,
        high: alertsData.filter(a => a.severity === 'high').length,
        medium: alertsData.filter(a => a.severity === 'medium').length,
        low: alertsData.filter(a => a.severity === 'low').length,
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAlert = async (action: 'dismiss' | 'block' | 'investigate') => {
    if (!selectedAlert) return;

    try {
      await supabase
        .from('fraud_alerts')
        .update({
          status: action === 'dismiss' ? 'dismissed' : action === 'block' ? 'blocked' : 'investigating',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          action_taken: action,
          notes: reviewNotes,
        })
        .eq('id', selectedAlert.id);

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: `fraud_alert_${action}`,
        entity_type: 'fraud_alert',
        entity_id: selectedAlert.id,
        details: { notes: reviewNotes },
      });

      toast({ title: `Alert ${action}ed successfully` });
      setSelectedAlert(null);
      setReviewNotes('');
      fetchAlerts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'multiple_failed_payments': return <CreditCard className="h-4 w-4" />;
      case 'unusual_order_pattern': return <TrendingUp className="h-4 w-4" />;
      case 'address_mismatch': return <MapPin className="h-4 w-4" />;
      case 'suspicious_user': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const severityData = [
    { name: 'High', value: stats.high, color: '#ef4444' },
    { name: 'Medium', value: stats.medium, color: '#f59e0b' },
    { name: 'Low', value: stats.low, color: '#10b981' },
  ].filter(d => d.value > 0);

  const filteredAlerts = alerts.filter(alert =>
    alert.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.orders?.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <ShieldAlert className="h-6 w-6 text-primary" />
          Fraud Detection
        </h1>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">High Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medium/Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medium + stats.low}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {severityData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Types */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alert Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Multiple Failed Payments</p>
                    <p className="text-sm text-muted-foreground">Repeated payment failures from same source</p>
                  </div>
                </div>
                <Badge variant="destructive">{alerts.filter(a => a.alert_type === 'multiple_failed_payments').length}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Unusual Order Pattern</p>
                    <p className="text-sm text-muted-foreground">High value orders from new accounts</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">{alerts.filter(a => a.alert_type === 'unusual_order_pattern').length}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Address Mismatch</p>
                    <p className="text-sm text-muted-foreground">Billing and shipping address inconsistency</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{alerts.filter(a => a.alert_type === 'address_mismatch').length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fraud Alerts</CardTitle>
              <CardDescription>Review and take action on suspicious activities</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No fraud alerts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <span className="capitalize">{alert.alert_type.replace(/_/g, ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${alert.score >= 70 ? 'bg-red-500' : alert.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${alert.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{alert.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.orders?.order_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.status === 'pending' ? 'outline' :
                        alert.status === 'dismissed' ? 'secondary' :
                        alert.status === 'blocked' ? 'destructive' : 'default'
                      }>
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      {alert.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Fraud Alert</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity} severity
                  </Badge>
                  <span className="text-2xl font-bold">{selectedAlert.score}</span>
                </div>
                <p className="font-medium capitalize">{selectedAlert.alert_type.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Indicators</p>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.indicators, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedAlert.orders && (
                <div>
                  <p className="text-sm font-medium mb-2">Order Details</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p><span className="text-muted-foreground">Order:</span> {selectedAlert.orders.order_number}</p>
                    <p><span className="text-muted-foreground">Amount:</span> {formatPrice(selectedAlert.orders.total)}</p>
                    <p><span className="text-muted-foreground">Customer:</span> {selectedAlert.orders.shipping_name}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea 
                  placeholder="Add notes about this review..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleReviewAlert('dismiss')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleReviewAlert('investigate')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Investigate
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReviewAlert('block')}
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Block
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
