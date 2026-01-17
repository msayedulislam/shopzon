import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { formatPrice } from '@/data/mockData';
import { ImageUpload } from '@/components/ImageUpload';

export default function SellerProducts() {
  const { seller } = useOutletContext<{ seller: any }>();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    stock: '',
    tags: '',
  });

  useEffect(() => {
    if (seller) {
      fetchProducts();
      fetchCategories();
    }
  }, [seller]);

  const fetchProducts = async () => {
    if (!seller) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          images:product_images(id, image_url, sort_order)
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openDialog = async (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        short_description: product.short_description || '',
        description: product.description || '',
        category_id: product.category_id || '',
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        stock: product.stock.toString(),
        tags: product.tags?.join(', ') || '',
      });
      // Load existing images
      const existingImages = product.images
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => img.image_url) || [];
      setProductImages(existingImages);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        short_description: '',
        description: '',
        category_id: '',
        price: '',
        original_price: '',
        stock: '',
        tags: '',
      });
      setProductImages([]);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;

    setFormLoading(true);

    try {
      const price = parseFloat(formData.price);
      const originalPrice = formData.original_price ? parseFloat(formData.original_price) : null;
      const discountPercent = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      const productData = {
        seller_id: seller.id,
        name: formData.name,
        slug: generateSlug(formData.name) + '-' + Date.now().toString(36),
        short_description: formData.short_description,
        description: formData.description,
        category_id: formData.category_id || null,
        price,
        original_price: originalPrice,
        discount_percent: discountPercent,
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: 'pending' as const,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Handle product images
      if (productId) {
        // Delete existing images
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);

        // Insert new images
        if (productImages.length > 0) {
          const imageRecords = productImages.map((url, index) => ({
            product_id: productId,
            image_url: url,
            sort_order: index,
          }));

          await supabase.from('product_images').insert(imageRecords);
        }
      }

      toast({ 
        title: editingProduct ? 'Product Updated' : 'Product Added',
        description: editingProduct ? undefined : 'Waiting for admin approval.',
      });

      setDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      // Cascade delete handles images and variations automatically
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: 'Product Deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
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
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => openDialog()}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Image Upload Section */}
              <div>
                <Label className="mb-2 block">Product Images</Label>
                <ImageUpload
                  images={productImages}
                  onImagesChange={setProductImages}
                  maxImages={5}
                  folder={`sellers/${seller?.id}`}
                />
              </div>

              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Short Description</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  placeholder="Brief product summary"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed product description"
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price (BDT) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Original Price</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                    placeholder="For discount"
                  />
                </div>
                <div>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="electronics, gadgets, phone (comma separated)"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl">
          <p className="text-6xl mb-4">📦</p>
          <h3 className="text-xl font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground">Add your first product to start selling!</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const mainImage = product.images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url;
                  return (
                    <tr key={product.id} className="hover:bg-secondary/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                            {mainImage ? (
                              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                📷
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.sold} sold
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.category?.name || '-'}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={product.stock < 10 ? 'text-warning font-medium' : ''}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[product.status]}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
