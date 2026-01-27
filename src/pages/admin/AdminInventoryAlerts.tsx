import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Package, Bell, RefreshCw, Search, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminInventoryAlerts() {
  const [search, setSearch] = useState('');

  // Fetch low stock products
  const { data: lowStockProducts = [], isLoading, refetch } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          stock,
          low_stock_threshold,
          price,
          status,
          sellers (shop_name),
          product_images (image_url)
        `)
        .lte('stock', 20) // Products with stock <= 20
        .eq('status', 'approved')
        .order('stock', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch out of stock products
  const { data: outOfStockProducts = [] } = useQuery({
    queryKey: ['out-of-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('stock', 0)
        .eq('status', 'approved');

      if (error) throw error;
      return data || [];
    },
  });

  const filteredProducts = lowStockProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNotifySeller = async (productId: string, sellerName: string) => {
    // In a real app, this would send a notification to the seller
    toast.success(`Notification sent to ${sellerName} about low stock`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Alerts</h1>
          <p className="text-muted-foreground">Monitor stock levels and get alerts</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">
                  {lowStockProducts.filter(p => p.stock > 0 && p.stock <= 10).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Bell className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning Level</p>
                <p className="text-2xl font-bold">
                  {lowStockProducts.filter(p => p.stock > 10 && p.stock <= 20).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monitored</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Alerts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No low stock products found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 10;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.product_images?.[0]?.image_url && (
                            <img
                              src={product.product_images[0].image_url}
                              alt=""
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.sellers?.shop_name || '-'}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          isOutOfStock ? 'text-destructive' : 
                          isLowStock ? 'text-orange-500' : 'text-yellow-500'
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{product.low_stock_threshold || 10}</TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-orange-500">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-yellow-500">Warning</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotifySeller(product.id, product.sellers?.shop_name || '')}
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          Notify Seller
                        </Button>
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
