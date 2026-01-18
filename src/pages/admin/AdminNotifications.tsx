import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Bell,
  Send,
  Users,
  Store,
  Filter,
  Search,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Megaphone,
  Mail,
  Smartphone,
  Globe,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  channels: string[];
}

interface SentNotification {
  id: string;
  title: string;
  message: string;
  target: string;
  channels: string[];
  sentAt: string;
  recipientCount: number;
  status: 'sent' | 'pending' | 'failed';
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Order Confirmation',
    subject: 'Your order has been confirmed!',
    body: 'Thank you for your order #{order_id}. We are processing it now.',
    type: 'transactional',
    channels: ['email', 'push'],
  },
  {
    id: '2',
    name: 'Flash Sale Alert',
    subject: '⚡ Flash Sale Starting Now!',
    body: 'Don\'t miss our biggest sale of the season. Up to 70% off!',
    type: 'promotional',
    channels: ['email', 'push', 'sms'],
  },
  {
    id: '3',
    name: 'Seller Approval',
    subject: 'Your seller account has been approved!',
    body: 'Congratulations! You can now start selling on our platform.',
    type: 'transactional',
    channels: ['email'],
  },
  {
    id: '4',
    name: 'Low Stock Alert',
    subject: 'Low stock warning',
    body: 'Your product {product_name} is running low on stock.',
    type: 'system',
    channels: ['email', 'push'],
  },
];

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  
  // Compose state
  const [composeData, setComposeData] = useState({
    title: '',
    message: '',
    target: 'all_users',
    channels: { email: true, push: true, sms: false },
    scheduleFor: '',
  });

  // Sent notifications (mock data)
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([
    {
      id: '1',
      title: 'Weekend Sale Announcement',
      message: 'Get 30% off on all electronics this weekend!',
      target: 'all_users',
      channels: ['email', 'push'],
      sentAt: new Date().toISOString(),
      recipientCount: 15420,
      status: 'sent',
    },
    {
      id: '2',
      title: 'New Feature: Wallet',
      message: 'We\'ve added a new wallet feature to your account.',
      target: 'all_users',
      channels: ['email'],
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      recipientCount: 15420,
      status: 'sent',
    },
    {
      id: '3',
      title: 'Seller Performance Update',
      message: 'Check your updated performance metrics.',
      target: 'sellers',
      channels: ['email', 'push'],
      sentAt: new Date(Date.now() - 172800000).toISOString(),
      recipientCount: 342,
      status: 'sent',
    },
  ]);

  const handleSendNotification = async () => {
    if (!composeData.title.trim() || !composeData.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    setLoading(true);
    try {
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 1500));

      const channels = Object.entries(composeData.channels)
        .filter(([_, enabled]) => enabled)
        .map(([channel]) => channel);

      const newNotification: SentNotification = {
        id: Date.now().toString(),
        title: composeData.title,
        message: composeData.message,
        target: composeData.target,
        channels,
        sentAt: new Date().toISOString(),
        recipientCount: composeData.target === 'all_users' ? 15420 : 
                        composeData.target === 'sellers' ? 342 : 100,
        status: 'sent',
      };

      setSentNotifications(prev => [newNotification, ...prev]);
      
      // Log the action
      await supabase.from('admin_audit_logs').insert({
        action: 'send_notification',
        entity_type: 'notification',
        details: {
          title: composeData.title,
          target: composeData.target,
          channels,
        },
      });

      toast.success('Notification sent successfully!');
      setComposeData({
        title: '',
        message: '',
        target: 'all_users',
        channels: { email: true, push: true, sms: false },
        scheduleFor: '',
      });
      setShowComposeDialog(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: NotificationTemplate) => {
    setComposeData({
      ...composeData,
      title: template.subject,
      message: template.body,
      channels: {
        email: template.channels.includes('email'),
        push: template.channels.includes('push'),
        sms: template.channels.includes('sms'),
      },
    });
    setShowComposeDialog(true);
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all_users': return 'All Users';
      case 'sellers': return 'Sellers Only';
      case 'customers': return 'Customers Only';
      case 'admins': return 'Admins Only';
      default: return target;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'push': return <Smartphone className="h-3 w-3" />;
      case 'sms': return <Megaphone className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Center
          </h1>
          <p className="text-muted-foreground mt-1">Send and manage platform notifications</p>
        </div>
        
        <Button onClick={() => setShowComposeDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Compose Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent Today</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">15.4K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="compose">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="compose" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {notificationTemplates.map((template) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.subject}</CardDescription>
                    </div>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.body}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {template.channels.map((channel) => (
                        <Badge key={channel} variant="outline" className="gap-1 text-xs">
                          {getChannelIcon(channel)}
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            {sentNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge 
                          variant={notification.status === 'sent' ? 'default' : 'secondary'}
                          className={notification.status === 'sent' ? 'bg-green-500' : ''}
                        >
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {notification.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="gap-1 text-xs">
                            {getChannelIcon(channel)}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="secondary">
                        {getTargetLabel(notification.target)}
                      </Badge>
                      <span className="text-muted-foreground">
                        {notification.recipientCount.toLocaleString()} recipients
                      </span>
                      <span className="text-muted-foreground">
                        {format(new Date(notification.sentAt), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled notifications</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowComposeDialog(true)}
              >
                Schedule a Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose Notification
            </DialogTitle>
            <DialogDescription>
              Send a notification to your users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Notification title..."
                value={composeData.title}
                onChange={(e) => setComposeData({ ...composeData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Notification message..."
                value={composeData.message}
                onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={composeData.target} 
                  onValueChange={(value) => setComposeData({ ...composeData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                    <SelectItem value="sellers">Sellers Only</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Schedule (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={composeData.scheduleFor}
                  onChange={(e) => setComposeData({ ...composeData, scheduleFor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email"
                    checked={composeData.channels.email}
                    onCheckedChange={(checked) => 
                      setComposeData({ 
                        ...composeData, 
                        channels: { ...composeData.channels, email: !!checked }
                      })
                    }
                  />
                  <Label htmlFor="email" className="flex items-center gap-1 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="push"
                    checked={composeData.channels.push}
                    onCheckedChange={(checked) => 
                      setComposeData({ 
                        ...composeData, 
                        channels: { ...composeData.channels, push: !!checked }
                      })
                    }
                  />
                  <Label htmlFor="push" className="flex items-center gap-1 cursor-pointer">
                    <Smartphone className="h-4 w-4" />
                    Push
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sms"
                    checked={composeData.channels.sms}
                    onCheckedChange={(checked) => 
                      setComposeData({ 
                        ...composeData, 
                        channels: { ...composeData.channels, sms: !!checked }
                      })
                    }
                  />
                  <Label htmlFor="sms" className="flex items-center gap-1 cursor-pointer">
                    <Megaphone className="h-4 w-4" />
                    SMS
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {composeData.scheduleFor ? 'Schedule' : 'Send Now'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
