import { useState, useEffect } from 'react';
import { 
  Search, Loader2, Edit2, Trash2, Eye, Check, X, RefreshCw, 
  Package, Star, Zap, TrendingUp, AlertTriangle, MoreHorizontal,
  Image as ImageIcon, Tag, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/data/mockData';
import { ImageUpload } from '@/components/ImageUpload';

const productStatuses = ['draft', 'pending', 'approved', 'rejected'];

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  stock: number;
  sold: number;
  status: string;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end: string | null;
  free_delivery: boolean;
  rating: number | null;
  review_count: number | null;
  tags: string[] | null;
  low_stock_threshold: number | null;
  created_at: string;
  seller_id: string;
  category_id: string | null;
  brand_id: string | null;
  seller?: { shop_name: string; id: string };
  category?: { name: string };
  brand?: { name: string };
  images?: { id: string; image_url: string; sort_order: number }[];
};

export default function AdminProductsEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);

  const [editForm, setEditForm] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: '',
    brand_id: '',
    price: '',
    original_price: '',
    stock: '',
    low_stock_threshold: '',
    tags: '',
    status: '',
    is_featured: false,
    is_flash_sale: false,
    free_delivery: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:sellers(id, shop_name),
          category:categories(name),
          brand:brands(name),
          images:product_images(id, image_url, sort_order)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setCategories(data || []);
  };

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setBrands(data || []);
  };

  const openDetailsDialog = (product: Product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      short_description: product.short_description || '',
      description: product.description || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      stock: product.stock?.toString() || '0',
      low_stock_threshold: product.low_stock_threshold?.toString() || '10',
      tags: product.tags?.join(', ') || '',
      status: product.status,
      is_featured: product.is_featured || false,
      is_flash_sale: product.is_flash_sale || false,
      free_delivery: product.free_delivery || false,
    });
    const existingImages = product.images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map(img => img.image_url) || [];
    setProductImages(existingImages);
    setEditDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const saveProductEdit = async () => {
    if (!selectedProduct) return;

    try {
      const price = parseFloat(editForm.price);
      const originalPrice = editForm.original_price ? parseFloat(editForm.original_price) : null;
      const discountPercent = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      const productData = {
        name: editForm.name,
        slug: generateSlug(editForm.name) + '-' + Date.now().toString(36),
        short_description: editForm.short_description || null,
        description: editForm.description || null,
        category_id: editForm.category_id || null,
        brand_id: editForm.brand_id || null,
        price,
        original_price: originalPrice,
        discount_percent: discountPercent,
        stock: parseInt(editForm.stock) || 0,
        low_stock_threshold: parseInt(editForm.low_stock_threshold) || 10,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: editForm.status as any,
        is_featured: editForm.is_featured,
        is_flash_sale: editForm.is_flash_sale,
        free_delivery: editForm.free_delivery,
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', selectedProduct.id);

      if (error) throw error;

      // Handle product images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', selectedProduct.id);

      if (productImages.length > 0) {
        const imageRecords = productImages.map((url, index) => ({
          product_id: selectedProduct.id,
          image_url: url,
          sort_order: index,
        }));
        await supabase.from('product_images').insert(imageRecords);
      }

      // Log admin action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'edit_product',
        entity_type: 'product',
        entity_id: selectedProduct.id,
        details: productData,
      });

      // Log edit history
      await supabase.from('product_edit_history').insert({
        product_id: selectedProduct.id,
        admin_id: user?.id,
        changes: productData,
      });

      toast({ title: 'Product updated successfully' });
      setEditDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateProductStatus = async (productId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: status as 'draft' | 'pending' | 'approved' | 'rejected' })
        .eq('id', productId);

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: status === 'approved' ? 'approve_product' : 'reject_product',
        entity_type: 'product',
        entity_id: productId,
        details: { status },
      });

      toast({ title: `Product ${status}` });
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleProductFlag = async (productId: string, field: 'is_featured' | 'is_flash_sale' | 'free_delivery', value: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', productId);

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: `toggle_${field}`,
        entity_type: 'product',
        entity_id: productId,
        details: { [field]: value },
      });

      toast({ title: `Product ${field.replace('_', ' ')} updated` });
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'delete_product',
        entity_type: 'product',
        entity_id: productId,
      });

      toast({ title: 'Product deleted' });
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedProducts.length === 0) return;
    setBulkActionLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus as 'draft' | 'pending' | 'approved' | 'rejected' })
        .in('id', selectedProducts);

      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'bulk_update_product_status',
        entity_type: 'product',
        details: { product_ids: selectedProducts, new_status: newStatus },
      });

      toast({ title: `${selectedProducts.length} products updated to ${newStatus}` });
      setSelectedProducts([]);
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggle = async (field: 'is_featured' | 'is_flash_sale' | 'free_delivery', value: boolean) => {
    if (selectedProducts.length === 0) return;
    setBulkActionLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({ [field]: value })
        .in('id', selectedProducts);

      if (error) throw error;

      toast({ title: `${selectedProducts.length} products updated` });
      setSelectedProducts([]);
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller?.shop_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const stats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    featured: products.filter(p => p.is_featured).length,
    flashSale: products.filter(p => p.is_flash_sale).length,
    lowStock: products.filter(p => p.stock < (p.low_stock_threshold || 10)).length,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage all marketplace products</p>
        </div>
        <Button variant="outline" onClick={fetchProducts} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-xs text-muted-foreground">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.flashSale}</p>
                <p className="text-xs text-muted-foreground">Flash Sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {productStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-medium">{selectedProducts.length} products selected</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('approved')}
                  disabled={bulkActionLoading}
                  className="text-green-600"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('rejected')}
                  disabled={bulkActionLoading}
                  className="text-red-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkToggle('is_featured', true)}
                  disabled={bulkActionLoading}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Set Featured
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkToggle('is_flash_sale', true)}
                  disabled={bulkActionLoading}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Add to Flash Sale
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Flash Sale</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const mainImage = product.images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url;
              const isLowStock = product.stock < (product.low_stock_threshold || 10);

              return (
                <TableRow key={product.id} className={selectedProducts.includes(product.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                        {mainImage ? (
                          <img src={mainImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sold || 0} sold</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.seller?.shop_name || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{formatPrice(product.price)}</p>
                      {product.original_price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={isLowStock ? 'text-red-600 font-medium' : ''}>
                      {product.stock}
                      {isLowStock && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.is_featured}
                      onCheckedChange={(v) => toggleProductFlag(product.id, 'is_featured', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.is_flash_sale}
                      onCheckedChange={(v) => toggleProductFlag(product.id, 'is_flash_sale', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[product.status]}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailsDialog(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {product.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => updateProductStatus(product.id, 'approved')}
                              className="text-green-600"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateProductStatus(product.id, 'rejected')}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {product.status === 'approved' && (
                          <DropdownMenuItem 
                            onClick={() => updateProductStatus(product.id, 'rejected')}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        {product.status === 'rejected' && (
                          <DropdownMenuItem 
                            onClick={() => updateProductStatus(product.id, 'approved')}
                            className="text-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteProduct(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedProduct.name}</span>
                  <Badge className={statusColors[selectedProduct.status]}>
                    {selectedProduct.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Images */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedProduct.images.sort((a, b) => a.sort_order - b.sort_order).map((img) => (
                      <img 
                        key={img.id} 
                        src={img.image_url} 
                        alt="" 
                        className="w-24 h-24 rounded-lg object-cover shrink-0"
                      />
                    ))}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seller:</span>
                        <span>{selectedProduct.seller?.shop_name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{selectedProduct.category?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand:</span>
                        <span>{selectedProduct.brand?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <span>{selectedProduct.rating || 0} ({selectedProduct.review_count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Pricing & Stock</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">{formatPrice(selectedProduct.price)}</span>
                      </div>
                      {selectedProduct.original_price && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="line-through">{formatPrice(selectedProduct.original_price)}</span>
                        </div>
                      )}
                      {selectedProduct.discount_percent > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="text-green-600">{selectedProduct.discount_percent}% OFF</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={selectedProduct.stock < 10 ? 'text-red-600 font-medium' : ''}>
                          {selectedProduct.stock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sold:</span>
                        <span>{selectedProduct.sold || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold">Product Flags</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedProduct.is_featured}
                        onCheckedChange={(v) => {
                          toggleProductFlag(selectedProduct.id, 'is_featured', v);
                          setSelectedProduct({ ...selectedProduct, is_featured: v });
                        }}
                      />
                      <Label>Featured Product</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedProduct.is_flash_sale}
                        onCheckedChange={(v) => {
                          toggleProductFlag(selectedProduct.id, 'is_flash_sale', v);
                          setSelectedProduct({ ...selectedProduct, is_flash_sale: v });
                        }}
                      />
                      <Label>Flash Sale</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedProduct.free_delivery}
                        onCheckedChange={(v) => {
                          toggleProductFlag(selectedProduct.id, 'free_delivery', v);
                          setSelectedProduct({ ...selectedProduct, free_delivery: v });
                        }}
                      />
                      <Label>Free Delivery</Label>
                    </div>
                  </div>
                </div>

                {selectedProduct.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                    </div>
                  </>
                )}

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                <Button onClick={() => {
                  setDetailsDialogOpen(false);
                  openEditDialog(selectedProduct);
                }}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">Product Images</Label>
              <ImageUpload
                images={productImages}
                onImagesChange={setProductImages}
                maxImages={5}
                folder={`products/${selectedProduct?.id}`}
              />
            </div>

            <div>
              <Label>Product Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Short Description</Label>
              <Input
                value={editForm.short_description}
                onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={editForm.category_id} onValueChange={(v) => setEditForm({ ...editForm, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand</Label>
                <Select value={editForm.brand_id} onValueChange={(v) => setEditForm({ ...editForm, brand_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Price (BDT) *</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Original Price</Label>
                <Input
                  type="number"
                  value={editForm.original_price}
                  onChange={(e) => setEditForm({ ...editForm, original_price: e.target.value })}
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                />
              </div>
              <div>
                <Label>Low Stock Alert</Label>
                <Input
                  type="number"
                  value={editForm.low_stock_threshold}
                  onChange={(e) => setEditForm({ ...editForm, low_stock_threshold: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags (comma separated)</Label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="electronics, gadgets, phone"
              />
            </div>

            <Separator />

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_featured}
                  onCheckedChange={(v) => setEditForm({ ...editForm, is_featured: v })}
                />
                <Label>Featured Product</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_flash_sale}
                  onCheckedChange={(v) => setEditForm({ ...editForm, is_flash_sale: v })}
                />
                <Label>Flash Sale</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.free_delivery}
                  onCheckedChange={(v) => setEditForm({ ...editForm, free_delivery: v })}
                />
                <Label>Free Delivery</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProductEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
