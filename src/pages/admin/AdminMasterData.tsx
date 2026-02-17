import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  AlertTriangle,
  Trash2,
  Database,
  Package,
  ShoppingCart,
  Users,
  Store,
  Tag,
  Layers,
  Ticket,
  FileText,
  Image,
  MessageSquare,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataCategory {
  id: string;
  name: string;
  table: string;
  icon: React.ElementType;
  count: number;
  description: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
}

const AdminMasterData = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; category?: DataCategory }>({ open: false });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operationLog, setOperationLog] = useState<string[]>([]);

  useEffect(() => {
    fetchDataCounts();
  }, []);

  const fetchDataCounts = async () => {
    setLoading(true);
    try {
      const [
        ordersRes,
        productsRes,
        usersRes,
        sellersRes,
        categoriesRes,
        brandsRes,
        couponsRes,
        bannersRes,
        reviewsRes,
        inquiriesRes,
        blogRes,
        wishlistsRes,
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('sellers').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('brands').select('id', { count: 'exact', head: true }),
        supabase.from('coupons').select('id', { count: 'exact', head: true }),
        supabase.from('banners').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('contact_inquiries').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('wishlists').select('id', { count: 'exact', head: true }),
      ]);

      setCategories([
        {
          id: 'orders',
          name: 'Orders',
          table: 'orders',
          icon: ShoppingCart,
          count: ordersRes.count || 0,
          description: 'All customer orders and related items, notes, courier data',
          dangerLevel: 'critical',
          dependencies: ['order_items', 'order_notes', 'order_courier', 'order_edit_history', 'transactions', 'refunds', 'fraud_alerts', 'return_requests', 'seller_reviews']
        },
        {
          id: 'products',
          name: 'Products',
          table: 'products',
          icon: Package,
          count: productsRes.count || 0,
          description: 'All products, images, variations, and reviews',
          dangerLevel: 'critical',
          dependencies: ['product_images', 'product_variations', 'reviews', 'wishlists', 'product_edit_history', 'price_alerts', 'inventory_alerts']
        },
        {
          id: 'profiles',
          name: 'User Profiles',
          table: 'profiles',
          icon: Users,
          count: usersRes.count || 0,
          description: 'User profile data (not auth accounts)',
          dangerLevel: 'high',
          dependencies: ['addresses', 'wallets', 'wallet_transactions']
        },
        {
          id: 'sellers',
          name: 'Sellers',
          table: 'sellers',
          icon: Store,
          count: sellersRes.count || 0,
          description: 'Seller accounts and governance data',
          dangerLevel: 'critical',
          dependencies: ['seller_governance', 'seller_payouts', 'seller_reviews', 'seller_action_logs']
        },
        {
          id: 'categories',
          name: 'Categories',
          table: 'categories',
          icon: Layers,
          count: categoriesRes.count || 0,
          description: 'Product categories hierarchy',
          dangerLevel: 'medium'
        },
        {
          id: 'brands',
          name: 'Brands',
          table: 'brands',
          icon: Tag,
          count: brandsRes.count || 0,
          description: 'Product brands',
          dangerLevel: 'low'
        },
        {
          id: 'coupons',
          name: 'Coupons',
          table: 'coupons',
          icon: Ticket,
          count: couponsRes.count || 0,
          description: 'Discount coupons',
          dangerLevel: 'low'
        },
        {
          id: 'banners',
          name: 'Banners',
          table: 'banners',
          icon: Image,
          count: bannersRes.count || 0,
          description: 'Promotional banners',
          dangerLevel: 'low'
        },
        {
          id: 'reviews',
          name: 'Reviews',
          table: 'reviews',
          icon: MessageSquare,
          count: reviewsRes.count || 0,
          description: 'Product reviews',
          dangerLevel: 'medium'
        },
        {
          id: 'inquiries',
          name: 'Inquiries',
          table: 'contact_inquiries',
          icon: MessageSquare,
          count: inquiriesRes.count || 0,
          description: 'Contact form submissions',
          dangerLevel: 'low'
        },
        {
          id: 'blog',
          name: 'Blog Posts',
          table: 'blog_posts',
          icon: FileText,
          count: blogRes.count || 0,
          description: 'Blog articles',
          dangerLevel: 'low'
        },
        {
          id: 'wishlists',
          name: 'Wishlists',
          table: 'wishlists',
          icon: Package,
          count: wishlistsRes.count || 0,
          description: 'User wishlist items',
          dangerLevel: 'low'
        },
      ]);
    } catch (error) {
      console.error('Error fetching data counts:', error);
      toast.error('Failed to fetch data statistics');
    } finally {
      setLoading(false);
    }
  };

  const getDangerBadge = (level: DataCategory['dangerLevel']) => {
    const styles = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return <Badge className={styles[level]}>{level.toUpperCase()}</Badge>;
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const logAudit = async (action: string, details: Record<string, unknown>) => {
    try {
      await supabase.from('admin_audit_logs').insert([{
        action,
        entity_type: 'master_data',
        details: details as unknown as import('@/integrations/supabase/types').Json
      }]);
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  };

  const deleteCategory = async (category: DataCategory) => {
    setDeleting(true);
    setProgress(0);
    setOperationLog([]);

    try {
      // Delete dependencies first
      if (category.dependencies) {
        for (let i = 0; i < category.dependencies.length; i++) {
          const dep = category.dependencies[i];
          setOperationLog(prev => [...prev, `Deleting items from ${dep}...`]);
          const { error: depError } = await supabase.from(dep as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');

          if (depError) {
            setOperationLog(prev => [...prev, `❌ Error deleting ${dep}: ${depError.message}`]);
            throw depError;
          }
          setOperationLog(prev => [...prev, `✅ Finished deleting ${dep}`]);
          setProgress(((i + 1) / (category.dependencies.length + 1)) * 100);
        }
      }

      // Delete main table
      setOperationLog(prev => [...prev, `Deleting ${category.table}...`]);
      const { error } = await supabase.from(category.table as 'orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setProgress(100);
      setOperationLog(prev => [...prev, `✓ Successfully deleted all ${category.name}`]);

      await logAudit('bulk_delete', {
        category: category.name,
        table: category.table,
        dependencies: category.dependencies
      });

      toast.success(`Deleted all ${category.name}`);
      fetchDataCounts();
    } catch (error) {
      console.error('Delete error:', error);
      setOperationLog(prev => [...prev, `✗ Error: ${error}`]);
      toast.error(`Failed to delete ${category.name}`);
    } finally {
      setDeleting(false);
      setConfirmDialog({ open: false });
      setConfirmText('');
    }
  };

  const bulkDelete = async () => {
    setDeleting(true);
    setProgress(0);
    setOperationLog([]);

    const selectedCategories = categories.filter(c => selectedItems.includes(c.id));
    const totalSteps = selectedCategories.reduce((acc, c) => acc + (c.dependencies?.length || 0) + 1, 0);
    let currentStep = 0;

    try {
      for (const category of selectedCategories) {
        // Delete dependencies first
        if (category.dependencies) {
          for (const dep of category.dependencies) {
            setOperationLog(prev => [...prev, `Deleting items from ${dep}...`]);
            const { error: depError } = await supabase.from(dep as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');

            if (depError) {
              setOperationLog(prev => [...prev, `❌ Error deleting ${dep}: ${depError.message}`]);
              throw depError;
            }
            setOperationLog(prev => [...prev, `✅ Finished deleting ${dep}`]);
            currentStep++;
            setProgress((currentStep / totalSteps) * 100);
          }
        }

        // Delete main table
        setOperationLog(prev => [...prev, `Deleting main table ${category.table}...`]);
        const { error: mainError } = await supabase.from(category.table as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');

        if (mainError) {
          setOperationLog(prev => [...prev, `❌ Error deleting ${category.table}: ${mainError.message}`]);
          throw mainError;
        }
        setOperationLog(prev => [...prev, `✅ Finished deleting ${category.table}`]);
        currentStep++;
        setProgress((currentStep / totalSteps) * 100);
      }

      setOperationLog(prev => [...prev, '✓ Bulk delete completed successfully']);

      await logAudit('bulk_delete_multiple', {
        categories: selectedCategories.map(c => c.name)
      });

      toast.success('Bulk delete completed');
      setSelectedItems([]);
      fetchDataCounts();
    } catch (error) {
      console.error('Bulk delete error:', error);
      setOperationLog(prev => [...prev, `✗ Error: ${error}`]);
      toast.error('Bulk delete failed');
    } finally {
      setDeleting(false);
      setBulkDeleteDialog(false);
      setConfirmText('');
    }
  };

  const resetAllData = async () => {
    setDeleting(true);
    setProgress(0);
    setOperationLog([]);

    const tablesToReset = [
      'order_items', 'order_notes', 'order_courier', 'order_edit_history', 'orders',
      'product_images', 'product_variations', 'product_edit_history',
      'reviews', 'wishlists', 'products',
      'seller_governance', 'seller_payouts', 'seller_reviews', 'seller_action_logs',
      'addresses', 'wallet_transactions',
      'refunds', 'transactions', 'fraud_alerts', 'courier_performance',
      'search_history', 'ai_suggestions',
      'coupons', 'banners', 'blog_posts', 'contact_inquiries', 'campaigns'
    ];

    try {
      for (let i = 0; i < tablesToReset.length; i++) {
        const table = tablesToReset[i];
        setOperationLog(prev => [...prev, `Resetting ${table}...`]);
        const { error } = await supabase.from(table as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          setOperationLog(prev => [...prev, `❌ Error resetting ${table}: ${error.message}`]);
          throw error;
        }
        setOperationLog(prev => [...prev, `✅ Finished resetting ${table}`]);
        setProgress(((i + 1) / tablesToReset.length) * 100);
      }

      setOperationLog(prev => [...prev, '✓ Full data reset completed']);

      await logAudit('full_data_reset', {
        tables: tablesToReset
      });

      toast.success('Full data reset completed');
      fetchDataCounts();
    } catch (error) {
      console.error('Reset error:', error);
      setOperationLog(prev => [...prev, `✗ Error: ${error}`]);
      toast.error('Data reset failed');
    } finally {
      setDeleting(false);
      setResetDialog(false);
      setConfirmText('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-destructive" />
            Master Data Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Bulk delete operations and data reset controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDataCounts} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => setResetDialog(true)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Reset All Data
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">⚠️ Danger Zone</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Operations in this panel are <strong>irreversible</strong>. All deleted data cannot be recovered.
                Make sure to create a backup before performing any delete operations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="individual">Individual Categories</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-2xl font-bold">{category.count.toLocaleString()}</p>
                        </div>
                      </div>
                      {getDangerBadge(category.dangerLevel)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    {category.dependencies && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Also deletes: {category.dependencies.join(', ')}
                      </p>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full gap-2"
                      disabled={category.count === 0}
                      onClick={() => setConfirmDialog({ open: true, category })}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete All {category.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Delete Selection</CardTitle>
              <CardDescription>Select multiple categories to delete at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedItems.includes(category.id)
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border hover:bg-muted/50'
                        }`}
                      onClick={() => toggleSelection(category.id)}
                    >
                      <Checkbox
                        checked={selectedItems.includes(category.id)}
                        onCheckedChange={() => toggleSelection(category.id)}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.count} records</p>
                      </div>
                      {getDangerBadge(category.dangerLevel)}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">
                    {selectedItems.length} categories selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: {categories.filter(c => selectedItems.includes(c.id)).reduce((acc, c) => acc + c.count, 0).toLocaleString()} records
                  </p>
                </div>
                <Button
                  variant="destructive"
                  disabled={selectedItems.length === 0}
                  onClick={() => setBulkDeleteDialog(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Single Category Delete Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !deleting && setConfirmDialog({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete All {confirmDialog.category?.name}?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete {confirmDialog.category?.count.toLocaleString()} records
              {confirmDialog.category?.dependencies && ` and related data from ${confirmDialog.category.dependencies.join(', ')}`}.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleting ? (
            <div className="space-y-4">
              <Progress value={progress} />
              <div className="max-h-40 overflow-auto text-xs font-mono bg-muted p-3 rounded-lg space-y-1">
                {operationLog.map((log, i) => (
                  <p key={i} className={log.startsWith('✓') ? 'text-green-600' : log.startsWith('✗') ? 'text-red-600' : ''}>{log}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Type "DELETE {confirmDialog.category?.name.toUpperCase()}" to confirm</Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`DELETE ${confirmDialog.category?.name.toUpperCase()}`}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false })} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || confirmText !== `DELETE ${confirmDialog.category?.name.toUpperCase()}`}
              onClick={() => confirmDialog.category && deleteCategory(confirmDialog.category)}
            >
              {deleting ? 'Deleting...' : 'Delete All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialog} onOpenChange={(open) => !deleting && setBulkDeleteDialog(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Bulk Delete Confirmation
            </DialogTitle>
            <DialogDescription>
              You are about to delete {selectedItems.length} categories with a total of{' '}
              {categories.filter(c => selectedItems.includes(c.id)).reduce((acc, c) => acc + c.count, 0).toLocaleString()} records.
            </DialogDescription>
          </DialogHeader>

          {deleting ? (
            <div className="space-y-4">
              <Progress value={progress} />
              <div className="max-h-40 overflow-auto text-xs font-mono bg-muted p-3 rounded-lg space-y-1">
                {operationLog.map((log, i) => (
                  <p key={i} className={log.startsWith('✓') ? 'text-green-600' : log.startsWith('✗') ? 'text-red-600' : ''}>{log}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {categories.filter(c => selectedItems.includes(c.id)).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{c.count} records</span>
                  </div>
                ))}
              </div>
              <div>
                <Label>Type "BULK DELETE" to confirm</Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="BULK DELETE"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || confirmText !== 'BULK DELETE'}
              onClick={bulkDelete}
            >
              {deleting ? 'Deleting...' : 'Delete All Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset All Data Dialog */}
      <AlertDialog open={resetDialog} onOpenChange={(open) => !deleting && setResetDialog(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ FULL DATA RESET
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This is an extremely dangerous operation that will delete ALL operational data from the platform:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All orders and order history</li>
                <li>All products and variations</li>
                <li>All reviews and wishlists</li>
                <li>All seller data and payouts</li>
                <li>All transactions and refunds</li>
                <li>All coupons, banners, and campaigns</li>
              </ul>
              <p className="font-semibold text-destructive">
                User accounts, categories, and brands will be preserved.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleting ? (
            <div className="space-y-4 py-4">
              <Progress value={progress} />
              <div className="max-h-40 overflow-auto text-xs font-mono bg-muted p-3 rounded-lg space-y-1">
                {operationLog.map((log, i) => (
                  <p key={i} className={log.startsWith('✓') ? 'text-green-600' : log.startsWith('✗') ? 'text-red-600' : ''}>{log}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4">
              <Label>Type "RESET ALL DATA" to confirm</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET ALL DATA"
                className="mt-2"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting || confirmText !== 'RESET ALL DATA'}
              onClick={(e) => {
                e.preventDefault();
                resetAllData();
              }}
            >
              {deleting ? 'Resetting...' : 'Reset All Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMasterData;
