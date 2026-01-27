import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Crown,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface CustomerData {
  user_id: string;
  email: string;
  full_name: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  first_order: string | null;
  last_order: string | null;
}

export default function AdminCustomerInsights() {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');

  // Fetch customer data with order stats
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customer-insights'],
    queryFn: async () => {
      // Get all users with their order data
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          user_id,
          total,
          created_at
        `)
        .eq('status', 'delivered');

      if (error) throw error;

      // Group by user
      const userStats = new Map<string, {
        total_orders: number;
        total_spent: number;
        first_order: string | null;
        last_order: string | null;
      }>();

      (orders || []).forEach(order => {
        if (!order.user_id) return;
        
        const existing = userStats.get(order.user_id) || {
          total_orders: 0,
          total_spent: 0,
          first_order: null,
          last_order: null,
        };

        existing.total_orders += 1;
        existing.total_spent += order.total;
        
        if (!existing.first_order || order.created_at < existing.first_order) {
          existing.first_order = order.created_at;
        }
        if (!existing.last_order || order.created_at > existing.last_order) {
          existing.last_order = order.created_at;
        }
        
        userStats.set(order.user_id, existing);
      });

      // Get profiles for these users
      const userIds = Array.from(userStats.keys());
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      // Combine data
      const customerData: CustomerData[] = [];
      
      userStats.forEach((stats, userId) => {
        const profile = profiles?.find(p => p.user_id === userId);
        customerData.push({
          user_id: userId,
          email: profile?.email || 'Unknown',
          full_name: profile?.full_name || 'Unknown Customer',
          total_orders: stats.total_orders,
          total_spent: stats.total_spent,
          avg_order_value: stats.total_spent / stats.total_orders,
          first_order: stats.first_order,
          last_order: stats.last_order,
        });
      });

      return customerData.sort((a, b) => b.total_spent - a.total_spent);
    },
  });

  // Calculate segments
  const getSegment = (customer: CustomerData) => {
    if (customer.total_spent >= 50000) return 'VIP';
    if (customer.total_spent >= 20000) return 'Gold';
    if (customer.total_orders >= 5) return 'Loyal';
    if (customer.total_orders === 1) return 'New';
    return 'Regular';
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesSegment = segment === 'all' || getSegment(c) === segment;
    
    return matchesSearch && matchesSegment;
  });

  // Stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const vipCustomers = customers.filter(c => getSegment(c) === 'VIP').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Insights</h1>
        <p className="text-muted-foreground">Analyze customer behavior and value</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Lifetime Value</p>
                <p className="text-2xl font-bold">৳{Math.round(avgLifetimeValue).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold">{vipCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Customer Analytics</CardTitle>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Loyal">Loyal</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No customers found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Avg. Order</TableHead>
                  <TableHead>First Order</TableHead>
                  <TableHead>Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const customerSegment = getSegment(customer);
                  
                  return (
                    <TableRow key={customer.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.full_name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          customerSegment === 'VIP' ? 'default' :
                          customerSegment === 'Gold' ? 'secondary' : 'outline'
                        }>
                          {customerSegment === 'VIP' && <Crown className="h-3 w-3 mr-1" />}
                          {customerSegment}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.total_orders}</TableCell>
                      <TableCell className="font-medium">
                        ৳{customer.total_spent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ৳{Math.round(customer.avg_order_value).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {customer.first_order 
                          ? format(new Date(customer.first_order), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {customer.last_order 
                          ? format(new Date(customer.last_order), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
