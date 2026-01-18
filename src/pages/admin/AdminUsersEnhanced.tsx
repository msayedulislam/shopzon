import { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Shield, 
  User, 
  UserPlus, 
  Ban, 
  Check, 
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Wallet,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

export default function AdminUsersEnhanced() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userWallet, setUserWallet] = useState<any>(null);

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

      // Fetch roles, orders count, and wallet for each user
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
    
    // Fetch user orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    setUserOrders(orders || []);

    // Fetch wallet details
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
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase());

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
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
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
            placeholder="Search by name, email, or phone..."
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
                    <p className="font-medium">{user.full_name || 'No name'}</p>
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => fetchUserDetails(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
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
