import { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Shield, 
  User, 
  UserPlus, 
  Ban, 
  MoreHorizontal,
  Mail,
  Phone,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Wallet,
  ShoppingBag,
  Trash2,
  LogIn,
  AlertTriangle,
  Key,
  UserX,
  UserCheck,
  Copy,
  Plus,
  Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { formatPrice } from '@/data/mockData';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  roles: string[];
  ordersCount?: number;
  totalSpent?: number;
  walletBalance?: number;
  isSuspended?: boolean;
}

export default function AdminUsersEnhanced() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userWallet, setUserWallet] = useState<any>(null);
  
  // New states for enhanced controls
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showWalletAdjustDialog, setShowWalletAdjustDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToImpersonate, setUserToImpersonate] = useState<UserProfile | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<UserProfile | null>(null);
  const [userToAdjustWallet, setUserToAdjustWallet] = useState<UserProfile | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Form states
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer' as 'admin' | 'seller' | 'customer'
  });
  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [walletAdjustment, setWalletAdjustment] = useState({
    amount: '',
    type: 'credit' as 'credit' | 'debit',
    reason: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [rolesResult, ordersResult, walletResult] = await Promise.all([
            supabase.from('user_roles').select('role').eq('user_id', profile.user_id),
            supabase.from('orders').select('id, total').eq('user_id', profile.user_id),
            supabase.from('wallets').select('balance').eq('user_id', profile.user_id).single(),
          ]);

          const orders = ordersResult.data || [];
          return {
            ...profile,
            roles: rolesResult.data?.map((r) => r.role) || ['customer'],
            ordersCount: orders.length,
            totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            walletBalance: walletResult.data?.balance || 0,
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    setUserOrders(orders || []);

    const { data: wallet } = await supabase
      .from('wallets')
      .select('*, wallet_transactions(*)')
      .eq('user_id', user.user_id)
      .single();
    
    setUserWallet(wallet);
  };

  const addRole = async (userId: string, role: 'admin' | 'seller' | 'customer') => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
    if (error) {
      toast.error('Failed to add role');
    } else {
      toast.success(`${role} role added`);
      
      // Log action
      await supabase.from('admin_audit_logs').insert({
        action: 'add_role',
        entity_type: 'user',
        entity_id: userId,
        details: { role }
      });
      
      fetchUsers();
    }
  };

  const removeRole = async (userId: string, role: 'admin' | 'seller' | 'customer') => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      toast.error('Failed to remove role');
    } else {
      toast.success(`${role} role removed`);
      
      await supabase.from('admin_audit_logs').insert({
        action: 'remove_role',
        entity_type: 'user',
        entity_id: userId,
        details: { role }
      });
      
      fetchUsers();
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password) {
      toast.error('Email and password are required');
      return;
    }

    setProcessing(true);
    try {
      // Create user profile entry (in production, this would be done via edge function)
      const userId = crypto.randomUUID();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: newUserForm.email,
          full_name: newUserForm.full_name,
          phone: newUserForm.phone
        });

      if (profileError) throw profileError;

      // Add role
      await supabase.from('user_roles').insert({
        user_id: userId,
        role: newUserForm.role
      });

      // Create wallet
      await supabase.from('wallets').insert({
        user_id: userId,
        balance: 0,
        total_credited: 0,
        total_spent: 0
      });

      // Log action
      await supabase.from('admin_audit_logs').insert({
        action: 'create_user',
        entity_type: 'user',
        entity_id: userId,
        details: { email: newUserForm.email, role: newUserForm.role }
      });

      toast.success('User created successfully');
      setShowAddUserDialog(false);
      setNewUserForm({ email: '', password: '', full_name: '', phone: '', role: 'customer' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editUserForm.full_name,
          email: editUserForm.email,
          phone: editUserForm.phone
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        action: 'update_user',
        entity_type: 'user',
        entity_id: selectedUser.user_id,
        details: editUserForm
      });

      toast.success('User updated successfully');
      setShowEditUserDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setProcessing(true);
    try {
      // Delete all user data
      await Promise.all([
        supabase.from('user_roles').delete().eq('user_id', userToDelete.user_id),
        supabase.from('wallets').delete().eq('user_id', userToDelete.user_id),
        supabase.from('addresses').delete().eq('user_id', userToDelete.user_id),
        supabase.from('wishlists').delete().eq('user_id', userToDelete.user_id),
        supabase.from('profiles').delete().eq('user_id', userToDelete.user_id),
      ]);

      await supabase.from('admin_audit_logs').insert({
        action: 'delete_user',
        entity_type: 'user',
        entity_id: userToDelete.user_id,
        details: { email: userToDelete.email, full_name: userToDelete.full_name }
      });

      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setProcessing(false);
    }
  };

  const handleImpersonateUser = async () => {
    if (!userToImpersonate) return;

    // Log the impersonation action
    await supabase.from('admin_audit_logs').insert({
      action: 'impersonate_user',
      entity_type: 'user',
      entity_id: userToImpersonate.user_id,
      details: { email: userToImpersonate.email }
    });

    toast.success(`Impersonation mode for ${userToImpersonate.email || userToImpersonate.full_name}`, {
      description: 'You are now viewing the platform as this user. Click the banner to exit.',
      duration: 5000
    });

    // Store impersonation state in sessionStorage
    sessionStorage.setItem('impersonating', JSON.stringify({
      userId: userToImpersonate.user_id,
      email: userToImpersonate.email,
      name: userToImpersonate.full_name
    }));

    setShowImpersonateDialog(false);
    setUserToImpersonate(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword?.email) {
      toast.error('User has no email address');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userToResetPassword.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        action: 'reset_password',
        entity_type: 'user',
        entity_id: userToResetPassword.user_id,
        details: { email: userToResetPassword.email }
      });

      toast.success('Password reset email sent');
      setShowResetPasswordDialog(false);
      setUserToResetPassword(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to send reset email');
    } finally {
      setProcessing(false);
    }
  };

  const handleWalletAdjustment = async () => {
    if (!userToAdjustWallet || !walletAdjustment.amount) return;

    const amount = parseFloat(walletAdjustment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      // Get current wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userToAdjustWallet.user_id)
        .single();

      if (!wallet) {
        // Create wallet if it doesn't exist
        await supabase.from('wallets').insert({
          user_id: userToAdjustWallet.user_id,
          balance: walletAdjustment.type === 'credit' ? amount : 0,
          total_credited: walletAdjustment.type === 'credit' ? amount : 0,
          total_spent: walletAdjustment.type === 'debit' ? amount : 0
        });
      } else {
        const newBalance = walletAdjustment.type === 'credit' 
          ? wallet.balance + amount 
          : Math.max(0, wallet.balance - amount);

        await supabase
          .from('wallets')
          .update({
            balance: newBalance,
            total_credited: walletAdjustment.type === 'credit' 
              ? wallet.total_credited + amount 
              : wallet.total_credited,
            total_spent: walletAdjustment.type === 'debit' 
              ? wallet.total_spent + amount 
              : wallet.total_spent
          })
          .eq('user_id', userToAdjustWallet.user_id);

        // Add transaction record
        await supabase.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          user_id: userToAdjustWallet.user_id,
          type: walletAdjustment.type,
          amount: amount,
          balance_after: newBalance,
          description: walletAdjustment.reason || `Admin ${walletAdjustment.type}`
        });
      }

      await supabase.from('admin_audit_logs').insert({
        action: `wallet_${walletAdjustment.type}`,
        entity_type: 'wallet',
        entity_id: userToAdjustWallet.user_id,
        details: { amount, reason: walletAdjustment.reason }
      });

      toast.success(`Wallet ${walletAdjustment.type}ed ${formatPrice(amount)}`);
      setShowWalletAdjustDialog(false);
      setUserToAdjustWallet(null);
      setWalletAdjustment({ amount: '', type: 'credit', reason: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      toast.error('Failed to adjust wallet');
    } finally {
      setProcessing(false);
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setEditUserForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };

  const copyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast.success('User ID copied to clipboard');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || u.roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.roles.includes('admin')).length,
    sellers: users.filter((u) => u.roles.includes('seller')).length,
    customers: users.filter((u) => u.roles.includes('customer')).length,
  };

  const exportUsers = () => {
    const csvData = filteredUsers.map(u => ({
      id: u.user_id,
      name: u.full_name,
      email: u.email,
      phone: u.phone,
      roles: u.roles.join('; '),
      orders: u.ordersCount,
      spent: u.totalSpent,
      wallet: u.walletBalance,
      joined: u.created_at
    }));
    
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported');
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Full admin control over all user accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddUserDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
          <Button variant="outline" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportUsers} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sellers}</p>
                <p className="text-sm text-muted-foreground">Sellers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.customers}</p>
                <p className="text-sm text-muted-foreground">Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : user.roles?.includes('admin') ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{user.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {user.email || '-'}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles?.map((role: string) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className={
                          role === 'admin'
                            ? 'border-red-500 text-red-600 bg-red-500/10'
                            : role === 'seller'
                            ? 'border-blue-500 text-blue-600 bg-blue-500/10'
                            : 'border-green-500 text-green-600 bg-green-500/10'
                        }
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{user.ordersCount || 0}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{formatPrice(user.totalSpent || 0)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-primary font-medium">{formatPrice(user.walletBalance || 0)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {user.created_at && formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => fetchUserDetails(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyUserId(user.user_id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy User ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => { setUserToImpersonate(user); setShowImpersonateDialog(true); }}
                        className="text-blue-600"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login as User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { setUserToResetPassword(user); setShowResetPasswordDialog(true); }}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { setUserToAdjustWallet(user); setShowWalletAdjustDialog(true); }}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Adjust Wallet
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!user.roles.includes('seller') && (
                        <DropdownMenuItem onClick={() => addRole(user.user_id, 'seller')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Make Seller
                        </DropdownMenuItem>
                      )}
                      {user.roles.includes('seller') && (
                        <DropdownMenuItem onClick={() => removeRole(user.user_id, 'seller')}>
                          <Ban className="h-4 w-4 mr-2" />
                          Remove Seller Role
                        </DropdownMenuItem>
                      )}
                      {!user.roles.includes('admin') && (
                        <DropdownMenuItem onClick={() => addRole(user.user_id, 'admin')} className="text-red-600">
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      {user.roles.includes('admin') && (
                        <DropdownMenuItem onClick={() => removeRole(user.user_id, 'admin')}>
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Admin Role
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => { setUserToDelete(user); setShowDeleteDialog(true); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with specified role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+880..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUserForm.role} onValueChange={(v: any) => setNewUserForm({ ...newUserForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editUserForm.full_name}
                onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User Permanently
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {userToDelete?.full_name || userToDelete?.email}'s
              account and all associated data including orders, wallet, and addresses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Impersonate Confirmation */}
      <AlertDialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-blue-600" />
              Login as User
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged in as {userToImpersonate?.full_name || userToImpersonate?.email} and can view the 
              platform from their perspective. This action will be logged for security purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImpersonateUser} className="bg-blue-600 hover:bg-blue-700">
              Login as User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation */}
      <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset User Password
            </AlertDialogTitle>
            <AlertDialogDescription>
              A password reset email will be sent to {userToResetPassword?.email}. The user will be able to 
              set a new password using the link in the email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Reset Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={showWalletAdjustDialog} onOpenChange={setShowWalletAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Adjust Wallet Balance
            </DialogTitle>
            <DialogDescription>
              Current balance: {formatPrice(userToAdjustWallet?.walletBalance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={walletAdjustment.type} onValueChange={(v: any) => setWalletAdjustment({ ...walletAdjustment, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Add)</SelectItem>
                  <SelectItem value="debit">Debit (Subtract)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={walletAdjustment.amount}
                onChange={(e) => setWalletAdjustment({ ...walletAdjustment, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={walletAdjustment.reason}
                onChange={(e) => setWalletAdjustment({ ...walletAdjustment, reason: e.target.value })}
                placeholder="Reason for adjustment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletAdjustDialog(false)}>Cancel</Button>
            <Button onClick={handleWalletAdjustment} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Apply {walletAdjustment.type === 'credit' ? 'Credit' : 'Debit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser && !showEditUserDialog} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              {selectedUser?.full_name || 'User Details'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders ({userOrders.length})</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm">{selectedUser.user_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Roles</p>
                    <div className="flex gap-1">
                      {selectedUser.roles.map((role) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {selectedUser.created_at && format(new Date(selectedUser.created_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{selectedUser.ordersCount}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{formatPrice(selectedUser.totalSpent || 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{formatPrice(selectedUser.walletBalance || 0)}</p>
                      <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'PPP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.total)}</p>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wallet" className="mt-4">
                {userWallet ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-primary">{formatPrice(userWallet.balance)}</p>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{formatPrice(userWallet.total_credited)}</p>
                          <p className="text-sm text-muted-foreground">Total Credited</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-red-600">{formatPrice(userWallet.total_spent)}</p>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                        </CardContent>
                      </Card>
                    </div>

                    {userWallet.wallet_transactions?.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Recent Transactions</p>
                        {userWallet.wallet_transactions.slice(0, 5).map((tx: any) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{tx.description || tx.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(tx.created_at), 'PPP')}
                              </p>
                            </div>
                            <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'credit' ? '+' : '-'}{formatPrice(Math.abs(tx.amount))}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No wallet found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}