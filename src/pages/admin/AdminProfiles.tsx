import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  Shield,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Settings,
  MoreVertical,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Star,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
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
} from 'recharts';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  roles: string[];
  permissions: Record<string, boolean>;
  lastActive: string | null;
  actionsCount: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
}

const allPermissions: Permission[] = [
  { key: 'view_dashboard', label: 'View Dashboard', description: 'Access to admin dashboard overview', category: 'General' },
  { key: 'manage_orders', label: 'Manage Orders', description: 'View, edit, and process orders', category: 'Orders' },
  { key: 'manage_refunds', label: 'Manage Refunds', description: 'Process refund requests', category: 'Orders' },
  { key: 'manage_products', label: 'Manage Products', description: 'Add, edit, delete products', category: 'Products' },
  { key: 'approve_products', label: 'Approve Products', description: 'Approve or reject pending products', category: 'Products' },
  { key: 'manage_sellers', label: 'Manage Sellers', description: 'Approve, suspend, manage sellers', category: 'Sellers' },
  { key: 'seller_governance', label: 'Seller Governance', description: 'Access seller governance tools', category: 'Sellers' },
  { key: 'manage_users', label: 'Manage Users', description: 'View and manage customer accounts', category: 'Users' },
  { key: 'manage_roles', label: 'Manage Roles', description: 'Assign and revoke user roles', category: 'Users' },
  { key: 'manage_categories', label: 'Manage Categories', description: 'Add, edit, delete categories', category: 'Catalog' },
  { key: 'manage_brands', label: 'Manage Brands', description: 'Add, edit, delete brands', category: 'Catalog' },
  { key: 'manage_coupons', label: 'Manage Coupons', description: 'Create and manage coupons', category: 'Marketing' },
  { key: 'manage_campaigns', label: 'Manage Campaigns', description: 'Create and manage campaigns', category: 'Marketing' },
  { key: 'manage_banners', label: 'Manage Banners', description: 'Add, edit banners and promotions', category: 'Marketing' },
  { key: 'view_finance', label: 'View Finance', description: 'Access financial reports', category: 'Finance' },
  { key: 'manage_payouts', label: 'Manage Payouts', description: 'Approve seller payouts', category: 'Finance' },
  { key: 'manage_wallets', label: 'Manage Wallets', description: 'Access customer wallet management', category: 'Finance' },
  { key: 'view_fraud', label: 'View Fraud Alerts', description: 'Access fraud detection system', category: 'Security' },
  { key: 'manage_fraud', label: 'Manage Fraud', description: 'Take action on fraud alerts', category: 'Security' },
  { key: 'view_logs', label: 'View Audit Logs', description: 'Access system audit logs', category: 'Security' },
  { key: 'manage_pages', label: 'Manage Pages', description: 'Edit static pages and content', category: 'Content' },
  { key: 'manage_blog', label: 'Manage Blog', description: 'Create and edit blog posts', category: 'Content' },
  { key: 'manage_inquiries', label: 'Manage Inquiries', description: 'Respond to contact inquiries', category: 'Support' },
  { key: 'system_settings', label: 'System Settings', description: 'Access system configuration', category: 'System' },
  { key: 'manage_admins', label: 'Manage Admins', description: 'Add and manage admin users', category: 'System' },
];

const permissionCategories = [...new Set(allPermissions.map(p => p.category))];

export default function AdminProfiles() {
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Record<string, boolean>>({});
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [activityData, setActivityData] = useState<any[]>([]);
  const [adminActivityLogs, setAdminActivityLogs] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    superAdmins: 0,
    recentActions: 0,
  });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      // Get all users with admin role
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (!adminRoles || adminRoles.length === 0) {
        setAdminUsers([]);
        setLoading(false);
        return;
      }

      const adminUserIds = adminRoles.map(r => r.user_id);

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', adminUserIds);

      // Get permissions for these users
      const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('*')
        .in('user_id', adminUserIds);

      // Get action counts
      const { data: actionCounts } = await supabase
        .from('admin_audit_logs')
        .select('admin_id')
        .in('admin_id', adminUserIds);

      // Get recent actions (last 24 hours)
      const yesterday = subDays(new Date(), 1).toISOString();
      const { data: recentActions } = await supabase
        .from('admin_audit_logs')
        .select('admin_id, created_at')
        .in('admin_id', adminUserIds)
        .gte('created_at', yesterday)
        .order('created_at', { ascending: false });

      const actionCountMap = (actionCounts || []).reduce((acc: any, log) => {
        acc[log.admin_id] = (acc[log.admin_id] || 0) + 1;
        return acc;
      }, {});

      const lastActiveMap = (recentActions || []).reduce((acc: any, log) => {
        if (!acc[log.admin_id]) {
          acc[log.admin_id] = log.created_at;
        }
        return acc;
      }, {});

      const permissionsMap = (permissions || []).reduce((acc: any, p) => {
        acc[p.user_id] = p.permissions as Record<string, boolean>;
        return acc;
      }, {});

      const adminList: AdminUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        created_at: profile.created_at || '',
        roles: ['admin'],
        permissions: permissionsMap[profile.user_id] || {},
        lastActive: lastActiveMap[profile.user_id] || null,
        actionsCount: actionCountMap[profile.user_id] || 0,
        status: 'active',
      }));

      setAdminUsers(adminList);

      setStats({
        totalAdmins: adminList.length,
        activeAdmins: adminList.filter(a => a.lastActive).length,
        superAdmins: adminList.filter(a => a.permissions.manage_admins).length,
        recentActions: recentActions?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditingPermissions(admin.permissions || {});
    setShowPermissionsDialog(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;

    try {
      // Upsert permissions
      const { error } = await supabase
        .from('admin_permissions')
        .upsert({
          user_id: selectedAdmin.user_id,
          permissions: editingPermissions,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Log the action
      await supabase.from('admin_audit_logs').insert({
        action: 'update_permissions',
        entity_type: 'admin',
        entity_id: selectedAdmin.user_id,
        details: { permissions: editingPermissions },
      });

      toast.success('Permissions updated successfully');
      setShowPermissionsDialog(false);
      fetchAdminUsers();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    }
  };

  const handleViewActivity = async (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowActivityDialog(true);

    try {
      // Fetch activity for this admin
      const { data: logs } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('admin_id', admin.user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      setAdminActivityLogs(logs || []);

      // Generate activity chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'MMM d');
      });

      const activityByDay = (logs || []).reduce((acc: any, log) => {
        const day = format(new Date(log.created_at), 'MMM d');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      setActivityData(last7Days.map(day => ({
        day,
        actions: activityByDay[day] || 0,
      })));

    } catch (error) {
      console.error('Error fetching admin activity:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // Find user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', newAdminEmail.trim())
        .single();

      if (!profile) {
        toast.error('User not found with this email');
        return;
      }

      // Check if already admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast.error('This user is already an admin');
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.user_id,
          role: 'admin',
        });

      if (error) throw error;

      // Log action
      await supabase.from('admin_audit_logs').insert({
        action: 'add_admin',
        entity_type: 'admin',
        entity_id: profile.user_id,
        details: { email: newAdminEmail },
      });

      toast.success('Admin added successfully');
      setShowAddAdminDialog(false);
      setNewAdminEmail('');
      fetchAdminUsers();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', admin.user_id)
        .eq('role', 'admin');

      if (error) throw error;

      // Also remove permissions
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', admin.user_id);

      // Log action
      await supabase.from('admin_audit_logs').insert({
        action: 'remove_admin',
        entity_type: 'admin',
        entity_id: admin.user_id,
        details: { email: admin.email },
      });

      toast.success('Admin privileges removed');
      fetchAdminUsers();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  const togglePermission = (key: string) => {
    setEditingPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCategoryPermissions = (category: string, enable: boolean) => {
    const categoryPermissions = allPermissions.filter(p => p.category === category);
    const updates = categoryPermissions.reduce((acc, p) => {
      acc[p.key] = enable;
      return acc;
    }, {} as Record<string, boolean>);
    
    setEditingPermissions(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('approve')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (actionLower.includes('reject') || actionLower.includes('suspend') || actionLower.includes('delete')) 
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (actionLower.includes('update') || actionLower.includes('edit')) 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (actionLower.includes('create') || actionLower.includes('add')) 
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const filteredAdmins = adminUsers.filter(admin =>
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Profiles
          </h1>
          <p className="text-muted-foreground mt-1">Manage administrator accounts and permissions</p>
        </div>
        
        <Button onClick={() => setShowAddAdminDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Admins</p>
                <p className="text-2xl font-bold">{stats.totalAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{stats.activeAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Crown className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold">{stats.superAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actions (24h)</p>
                <p className="text-2xl font-bold">{stats.recentActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={fetchAdminUsers} size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Admin List */}
      <div className="grid gap-4">
        {filteredAdmins.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No admin users found
            </CardContent>
          </Card>
        ) : (
          filteredAdmins.map((admin) => (
            <Card key={admin.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={admin.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {admin.full_name?.charAt(0) || admin.email?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{admin.full_name || 'Admin User'}</h3>
                        {admin.permissions.manage_admins && (
                          <Badge variant="secondary" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Super Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {admin.email}
                        </span>
                        {admin.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {admin.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{admin.actionsCount}</p>
                      <p className="text-xs text-muted-foreground">Total Actions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {Object.values(admin.permissions).filter(Boolean).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Permissions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {admin.lastActive 
                          ? format(new Date(admin.lastActive), 'MMM d, HH:mm')
                          : 'Never'}
                      </p>
                      <p className="text-xs text-muted-foreground">Last Active</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewActivity(admin)}
                      className="gap-1"
                    >
                      <Activity className="h-4 w-4" />
                      Activity
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPermissions(admin)}
                      className="gap-1"
                    >
                      <Lock className="h-4 w-4" />
                      Permissions
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewActivity(admin)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPermissions(admin)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRemoveAdmin(admin)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Permission badges */}
                {Object.entries(admin.permissions).filter(([_, v]) => v).length > 0 && (
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {Object.entries(admin.permissions)
                      .filter(([_, enabled]) => enabled)
                      .slice(0, 8)
                      .map(([key]) => {
                        const permission = allPermissions.find(p => p.key === key);
                        return permission ? (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {permission.label}
                          </Badge>
                        ) : null;
                      })}
                    {Object.values(admin.permissions).filter(Boolean).length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.values(admin.permissions).filter(Boolean).length - 8} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Edit Permissions - {selectedAdmin?.full_name || selectedAdmin?.email}
            </DialogTitle>
            <DialogDescription>
              Configure what this admin can access and manage
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {permissionCategories.map((category) => {
                const categoryPerms = allPermissions.filter(p => p.category === category);
                const enabledCount = categoryPerms.filter(p => editingPermissions[p.key]).length;
                const allEnabled = enabledCount === categoryPerms.length;
                
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        {category}
                        <Badge variant="secondary" className="text-xs">
                          {enabledCount}/{categoryPerms.length}
                        </Badge>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryPermissions(category, !allEnabled)}
                      >
                        {allEnabled ? 'Disable All' : 'Enable All'}
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {categoryPerms.map((permission) => (
                        <div
                          key={permission.key}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            editingPermissions[permission.key] 
                              ? 'bg-primary/5 border-primary/20' 
                              : 'hover:bg-secondary/50'
                          }`}
                        >
                          <Checkbox
                            id={permission.key}
                            checked={editingPermissions[permission.key] || false}
                            onCheckedChange={() => togglePermission(permission.key)}
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={permission.key} 
                              className="cursor-pointer font-medium"
                            >
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity - {selectedAdmin?.full_name || selectedAdmin?.email}
            </DialogTitle>
            <DialogDescription>
              Recent actions and activity summary
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="chart" className="flex-1 overflow-hidden">
            <TabsList>
              <TabsTrigger value="chart">Activity Chart</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="day" 
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
                        <Bar dataKey="actions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs" className="mt-4 overflow-hidden">
              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {adminActivityLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No activity logs found</p>
                  ) : (
                    adminActivityLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-secondary/30"
                      >
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm capitalize flex-1">
                          {log.entity_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Admin
            </DialogTitle>
            <DialogDescription>
              Enter the email of an existing user to grant admin privileges
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The user must already have an account on the platform
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin}>
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
