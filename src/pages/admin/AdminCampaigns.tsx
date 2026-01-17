import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Megaphone,
  Plus,
  Zap,
  Tag,
  Users,
  TrendingUp,
  Calendar,
  Loader2,
  Play,
  Pause,
  Edit,
  Trash2,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  spent: number;
  impressions: number;
  conversions: number;
  discount_config: any;
  target_audience: any;
  created_at: string;
}

export default function AdminCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'flash_sale',
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: 0,
    discount_type: 'percentage',
    discount_value: 10,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) {
        // Create demo campaigns
        const demoCampaigns = [
          {
            name: 'Eid Flash Sale',
            type: 'flash_sale',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            budget: 50000,
            spent: 12500,
            impressions: 45000,
            conversions: 890,
            discount_config: { type: 'percentage', value: 20 },
          },
          {
            name: 'New User Welcome',
            type: 'coupon',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            budget: 100000,
            spent: 35000,
            impressions: 120000,
            conversions: 2100,
            discount_config: { type: 'fixed', value: 200 },
            target_audience: { type: 'new_users' },
          },
          {
            name: 'Electronics Week',
            type: 'category_sale',
            status: 'scheduled',
            start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            budget: 75000,
            spent: 0,
            impressions: 0,
            conversions: 0,
            discount_config: { type: 'percentage', value: 15 },
          },
        ];

        for (const campaign of demoCampaigns) {
          await supabase.from('campaigns').insert({ ...campaign, created_by: user?.id });
        }

        const { data: newData } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        setCampaigns(newData || []);
      } else {
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await supabase.from('campaigns').insert({
        name: formData.name,
        type: formData.type,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget || null,
        discount_config: { type: formData.discount_type, value: formData.discount_value },
        created_by: user?.id,
      });

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'create_campaign',
        entity_type: 'campaign',
        details: formData,
      });

      toast({ title: 'Campaign created successfully' });
      setDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleCampaign = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);
      toast({ title: `Campaign ${newStatus}` });
      fetchCampaigns();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await supabase.from('campaigns').delete().eq('id', id);
      toast({ title: 'Campaign deleted' });
      fetchCampaigns();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'flash_sale',
      status: 'draft',
      start_date: '',
      end_date: '',
      budget: 0,
      discount_type: 'percentage',
      discount_value: 10,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flash_sale': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'coupon': return <Tag className="h-4 w-4 text-blue-500" />;
      case 'category_sale': return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default: return <Megaphone className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused': return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'ended': return <Badge className="bg-gray-100 text-gray-800">Ended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);

  // Mock performance data
  const performanceData = Array.from({ length: 14 }, (_, i) => ({
    date: format(new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000), 'MMM d'),
    impressions: Math.floor(Math.random() * 10000) + 5000,
    conversions: Math.floor(Math.random() * 200) + 50,
  }));

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
          <Megaphone className="h-6 w-6 text-primary" />
          Marketing Campaigns
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Sale 2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flash_sale">Flash Sale</SelectItem>
                      <SelectItem value="coupon">Coupon Campaign</SelectItem>
                      <SelectItem value="category_sale">Category Sale</SelectItem>
                      <SelectItem value="seller_promo">Seller Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Budget (৳)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCampaign} disabled={!formData.name}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalBudget)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatPrice(totalSpent)}</div>
            <Progress value={(totalSpent / totalBudget) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalConversions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} name="Impressions" />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage and monitor your marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Budget/Spent</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(campaign.type)}
                      <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-sm">
                    {campaign.start_date && (
                      <div>
                        <p>{format(new Date(campaign.start_date), 'MMM d')}</p>
                        <p className="text-muted-foreground">
                          to {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d') : 'ongoing'}
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{formatPrice(campaign.spent || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        of {formatPrice(campaign.budget || 0)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{(campaign.impressions || 0).toLocaleString()} impressions</p>
                      <p className="text-muted-foreground">{campaign.conversions || 0} conversions</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {campaign.status !== 'ended' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleToggleCampaign(campaign)}
                        >
                          {campaign.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
