import { useState, useEffect } from 'react';
import {
  Shield,
  Crown,
  Users,
  HeadphonesIcon,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Settings,
  Lock,
  Unlock,
  Copy,
  MoreVertical,
  Loader2,
  Save,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Star,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
}

interface RolePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: Record<string, boolean>;
  isSystem: boolean;
  usersCount: number;
  createdAt: string;
}

const allPermissions: Permission[] = [
  // General
  { key: 'view_dashboard', label: 'View Dashboard', description: 'Access to admin dashboard overview', category: 'General' },
  { key: 'view_analytics', label: 'View Analytics', description: 'Access to analytics and reports', category: 'General' },
  
  // Orders
  { key: 'view_orders', label: 'View Orders', description: 'View order details', category: 'Orders' },
  { key: 'manage_orders', label: 'Manage Orders', description: 'Edit and process orders', category: 'Orders' },
  { key: 'cancel_orders', label: 'Cancel Orders', description: 'Cancel pending orders', category: 'Orders' },
  { key: 'manage_refunds', label: 'Manage Refunds', description: 'Process refund requests', category: 'Orders' },
  
  // Products
  { key: 'view_products', label: 'View Products', description: 'View product listings', category: 'Products' },
  { key: 'manage_products', label: 'Manage Products', description: 'Add, edit, delete products', category: 'Products' },
  { key: 'approve_products', label: 'Approve Products', description: 'Approve or reject pending products', category: 'Products' },
  
  // Sellers
  { key: 'view_sellers', label: 'View Sellers', description: 'View seller profiles', category: 'Sellers' },
  { key: 'manage_sellers', label: 'Manage Sellers', description: 'Approve, suspend, manage sellers', category: 'Sellers' },
  { key: 'seller_governance', label: 'Seller Governance', description: 'Access seller governance tools', category: 'Sellers' },
  
  // Users
  { key: 'view_users', label: 'View Users', description: 'View customer accounts', category: 'Users' },
  { key: 'manage_users', label: 'Manage Users', description: 'Edit and manage customer accounts', category: 'Users' },
  { key: 'manage_roles', label: 'Manage Roles', description: 'Assign and revoke user roles', category: 'Users' },
  
  // Catalog
  { key: 'manage_categories', label: 'Manage Categories', description: 'Add, edit, delete categories', category: 'Catalog' },
  { key: 'manage_brands', label: 'Manage Brands', description: 'Add, edit, delete brands', category: 'Catalog' },
  
  // Marketing
  { key: 'view_marketing', label: 'View Marketing', description: 'View campaigns and promotions', category: 'Marketing' },
  { key: 'manage_coupons', label: 'Manage Coupons', description: 'Create and manage coupons', category: 'Marketing' },
  { key: 'manage_campaigns', label: 'Manage Campaigns', description: 'Create and manage campaigns', category: 'Marketing' },
  { key: 'manage_banners', label: 'Manage Banners', description: 'Add, edit banners and promotions', category: 'Marketing' },
  
  // Finance
  { key: 'view_finance', label: 'View Finance', description: 'Access financial reports', category: 'Finance' },
  { key: 'manage_payouts', label: 'Manage Payouts', description: 'Approve seller payouts', category: 'Finance' },
  { key: 'manage_wallets', label: 'Manage Wallets', description: 'Access customer wallet management', category: 'Finance' },
  
  // Security
  { key: 'view_fraud', label: 'View Fraud Alerts', description: 'Access fraud detection system', category: 'Security' },
  { key: 'manage_fraud', label: 'Manage Fraud', description: 'Take action on fraud alerts', category: 'Security' },
  { key: 'view_logs', label: 'View Audit Logs', description: 'Access system audit logs', category: 'Security' },
  
  // Content
  { key: 'manage_pages', label: 'Manage Pages', description: 'Edit static pages and content', category: 'Content' },
  { key: 'manage_blog', label: 'Manage Blog', description: 'Create and edit blog posts', category: 'Content' },
  
  // Support
  { key: 'view_inquiries', label: 'View Inquiries', description: 'View contact inquiries', category: 'Support' },
  { key: 'manage_inquiries', label: 'Manage Inquiries', description: 'Respond to contact inquiries', category: 'Support' },
  
  // System
  { key: 'system_settings', label: 'System Settings', description: 'Access system configuration', category: 'System' },
  { key: 'manage_admins', label: 'Manage Admins', description: 'Add and manage admin users', category: 'System' },
  { key: 'manage_backups', label: 'Manage Backups', description: 'Create and restore backups', category: 'System' },
];

const permissionCategories = [...new Set(allPermissions.map(p => p.category))];

const defaultPresets: RolePreset[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full access to all system features and settings. Can manage other admins and system configuration.',
    icon: 'crown',
    color: 'bg-yellow-500',
    permissions: allPermissions.reduce((acc, p) => ({ ...acc, [p.key]: true }), {}),
    isSystem: true,
    usersCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Can manage products, orders, sellers, and content. Limited access to financial and system settings.',
    icon: 'shield',
    color: 'bg-blue-500',
    permissions: {
      view_dashboard: true,
      view_analytics: true,
      view_orders: true,
      manage_orders: true,
      cancel_orders: true,
      view_products: true,
      manage_products: true,
      approve_products: true,
      view_sellers: true,
      manage_sellers: true,
      view_users: true,
      manage_users: true,
      manage_categories: true,
      manage_brands: true,
      view_marketing: true,
      manage_coupons: true,
      manage_banners: true,
      view_fraud: true,
      view_logs: true,
      manage_pages: true,
      manage_blog: true,
      view_inquiries: true,
      manage_inquiries: true,
    },
    isSystem: true,
    usersCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Customer support role with access to orders, users, and inquiries. Read-only access to products and sellers.',
    icon: 'headphones',
    color: 'bg-green-500',
    permissions: {
      view_dashboard: true,
      view_orders: true,
      manage_orders: true,
      manage_refunds: true,
      view_products: true,
      view_sellers: true,
      view_users: true,
      manage_users: true,
      view_inquiries: true,
      manage_inquiries: true,
    },
    isSystem: true,
    usersCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'content_manager',
    name: 'Content Manager',
    description: 'Manages website content including pages, blog posts, banners, and marketing campaigns.',
    icon: 'edit',
    color: 'bg-purple-500',
    permissions: {
      view_dashboard: true,
      view_products: true,
      view_marketing: true,
      manage_banners: true,
      manage_campaigns: true,
      manage_pages: true,
      manage_blog: true,
    },
    isSystem: false,
    usersCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'finance_manager',
    name: 'Finance Manager',
    description: 'Access to financial reports, payouts, and wallet management. Read-only access to orders.',
    icon: 'wallet',
    color: 'bg-emerald-500',
    permissions: {
      view_dashboard: true,
      view_analytics: true,
      view_orders: true,
      view_finance: true,
      manage_payouts: true,
      manage_wallets: true,
      view_logs: true,
    },
    isSystem: false,
    usersCount: 1,
    createdAt: new Date().toISOString(),
  },
];

const iconOptions = [
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'headphones', label: 'Headphones', icon: HeadphonesIcon },
  { value: 'edit', label: 'Edit', icon: Edit },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'settings', label: 'Settings', icon: Settings },
];

const colorOptions = [
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-emerald-500', label: 'Emerald' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-pink-500', label: 'Pink' },
];

export default function AdminRolePresets() {
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<RolePreset[]>(defaultPresets);
  const [selectedPreset, setSelectedPreset] = useState<RolePreset | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('shield');
  const [formColor, setFormColor] = useState('bg-blue-500');
  const [formPermissions, setFormPermissions] = useState<Record<string, boolean>>({});
  
  // Assign state
  const [assignEmail, setAssignEmail] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(i => i.value === iconName);
    return iconOption ? iconOption.icon : Shield;
  };

  const handleCreatePreset = () => {
    setFormName('');
    setFormDescription('');
    setFormIcon('shield');
    setFormColor('bg-blue-500');
    setFormPermissions({});
    setShowCreateDialog(true);
  };

  const handleEditPreset = (preset: RolePreset) => {
    setSelectedPreset(preset);
    setFormName(preset.name);
    setFormDescription(preset.description);
    setFormIcon(preset.icon);
    setFormColor(preset.color);
    setFormPermissions({ ...preset.permissions });
    setShowEditDialog(true);
  };

  const handleSavePreset = (isNew: boolean) => {
    if (!formName.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    const newPreset: RolePreset = {
      id: isNew ? `custom_${Date.now()}` : selectedPreset!.id,
      name: formName,
      description: formDescription,
      icon: formIcon,
      color: formColor,
      permissions: formPermissions,
      isSystem: false,
      usersCount: isNew ? 0 : selectedPreset!.usersCount,
      createdAt: isNew ? new Date().toISOString() : selectedPreset!.createdAt,
    };

    if (isNew) {
      setPresets([...presets, newPreset]);
      toast.success('Role preset created successfully');
    } else {
      setPresets(presets.map(p => p.id === newPreset.id ? newPreset : p));
      toast.success('Role preset updated successfully');
    }

    setShowCreateDialog(false);
    setShowEditDialog(false);
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;
    setPresets(presets.filter(p => p.id !== selectedPreset.id));
    setShowDeleteDialog(false);
    toast.success('Role preset deleted');
  };

  const handleDuplicatePreset = (preset: RolePreset) => {
    const newPreset: RolePreset = {
      ...preset,
      id: `custom_${Date.now()}`,
      name: `${preset.name} (Copy)`,
      isSystem: false,
      usersCount: 0,
      createdAt: new Date().toISOString(),
    };
    setPresets([...presets, newPreset]);
    toast.success('Role preset duplicated');
  };

  const handleAssignRole = async () => {
    if (!assignEmail.trim() || !selectedPreset) {
      toast.error('Please enter an email address');
      return;
    }

    setAssignLoading(true);

    try {
      // Find user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', assignEmail.trim())
        .single();

      if (!profile) {
        toast.error('User not found with this email');
        setAssignLoading(false);
        return;
      }

      // Check if already admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('role', 'admin')
        .single();

      if (!existingRole) {
        // Add admin role
        await supabase.from('user_roles').insert({
          user_id: profile.user_id,
          role: 'admin',
        });
      }

      // Set permissions based on preset
      await supabase.from('admin_permissions').upsert({
        user_id: profile.user_id,
        permissions: selectedPreset.permissions,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      // Update preset user count
      setPresets(presets.map(p => 
        p.id === selectedPreset.id 
          ? { ...p, usersCount: p.usersCount + 1 }
          : p
      ));

      toast.success(`User assigned to ${selectedPreset.name} role`);
      setShowAssignDialog(false);
      setAssignEmail('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAssignLoading(false);
    }
  };

  const togglePermission = (key: string) => {
    setFormPermissions(prev => ({
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
    
    setFormPermissions(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const getCategoryPermissionCount = (category: string) => {
    const categoryPermissions = allPermissions.filter(p => p.category === category);
    const enabledCount = categoryPermissions.filter(p => formPermissions[p.key]).length;
    return `${enabledCount}/${categoryPermissions.length}`;
  };

  const getTotalPermissionCount = (permissions: Record<string, boolean>) => {
    const enabled = Object.values(permissions).filter(Boolean).length;
    return `${enabled}/${allPermissions.length}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Role Presets
          </h1>
          <p className="text-muted-foreground mt-1">Manage predefined permission sets for admin users</p>
        </div>
        
        <Button onClick={handleCreatePreset} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{presets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{presets.filter(p => p.isSystem).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custom Roles</p>
                <p className="text-2xl font-bold">{presets.filter(p => !p.isSystem).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Users</p>
                <p className="text-2xl font-bold">{presets.reduce((sum, p) => sum + p.usersCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const IconComponent = getIconComponent(preset.icon);
          return (
            <Card key={preset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${preset.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {preset.name}
                        {preset.isSystem && (
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedPreset(preset);
                        setShowAssignDialog(true);
                      }}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign to User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditPreset(preset)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicatePreset(preset)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!preset.isSystem && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedPreset(preset);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{preset.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Permissions</span>
                  <span className="font-medium">{getTotalPermissionCount(preset.permissions)}</span>
                </div>
                
                <Progress 
                  value={(Object.values(preset.permissions).filter(Boolean).length / allPermissions.length) * 100} 
                  className="h-2"
                />

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{preset.usersCount} users</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedPreset(preset);
                    setShowAssignDialog(true);
                  }}>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showCreateDialog ? 'Create New Role' : 'Edit Role'}</DialogTitle>
            <DialogDescription>
              {showCreateDialog 
                ? 'Define a new role preset with custom permissions'
                : 'Modify the role settings and permissions'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  placeholder="e.g., Content Manager"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Icon</Label>
                  <div className="flex gap-1 flex-wrap">
                    {iconOptions.map((icon) => (
                      <Button
                        key={icon.value}
                        type="button"
                        variant={formIcon === icon.value ? 'default' : 'outline'}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setFormIcon(icon.value)}
                      >
                        <icon.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-1 flex-wrap">
                    {colorOptions.slice(0, 4).map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`h-9 w-9 rounded-lg ${color.value} ${formColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        onClick={() => setFormColor(color.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this role can do..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <ScrollArea className="h-[300px] border rounded-lg p-3">
                <Accordion type="multiple" className="w-full">
                  {permissionCategories.map((category) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{category}</span>
                          <Badge variant="secondary" className="ml-2">
                            {getCategoryPermissionCount(category)}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <div className="flex gap-2 mb-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCategoryPermissions(category, true)}
                            >
                              Enable All
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCategoryPermissions(category, false)}
                            >
                              Disable All
                            </Button>
                          </div>
                          {allPermissions
                            .filter(p => p.category === category)
                            .map((permission) => (
                              <div
                                key={permission.key}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                                onClick={() => togglePermission(permission.key)}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={formPermissions[permission.key] || false}
                                    onCheckedChange={() => togglePermission(permission.key)}
                                  />
                                  <div>
                                    <p className="text-sm font-medium">{permission.label}</p>
                                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
            }}>
              Cancel
            </Button>
            <Button onClick={() => handleSavePreset(showCreateDialog)}>
              <Save className="h-4 w-4 mr-2" />
              {showCreateDialog ? 'Create Role' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
            <DialogDescription>
              Assign the "{selectedPreset?.name}" role to a user by email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedPreset && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-secondary/30">
                {(() => {
                  const IconComponent = getIconComponent(selectedPreset.icon);
                  return (
                    <div className={`p-2 rounded-lg ${selectedPreset.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  );
                })()}
                <div>
                  <p className="font-medium">{selectedPreset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getTotalPermissionCount(selectedPreset.permissions)} permissions
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>User Email</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole} disabled={assignLoading}>
              {assignLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role Preset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedPreset?.name}" role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPreset && selectedPreset.usersCount > 0 && (
            <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
              <p className="text-sm">
                <strong>Warning:</strong> {selectedPreset.usersCount} users are currently assigned to this role. 
                Their permissions will need to be reassigned.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePreset}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
