import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GovalyHeader } from '@/components/layout/GovalyHeader';
import { Footer } from '@/components/layout/Footer';
import { GovalyProductCard } from '@/components/product/GovalyProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toDisplayProduct } from '@/hooks/useProducts';
import { SellerReviews } from '@/components/seller/SellerReviews';
import { Star, MapPin, Calendar, Package, ShieldCheck, Store, Grid3X3, List, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Product } from '@/types';

interface Seller {
  id: string;
  shop_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  rating: number | null;
  total_sales: number | null;
  status: string | null;
  level: string | null;
  address: string | null;
  created_at: string | null;
}

export default function SellerStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!slug) return;

      setLoading(true);

      // Fetch seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (sellerError || !sellerData) {
        setLoading(false);
        return;
      }

      setSeller(sellerData);

      // Fetch seller's products with images
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          brand:brands(id, name, slug, logo_url),
          images:product_images(id, image_url, sort_order)
        `)
        .eq('seller_id', sellerData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (productsData) {
        const displayProducts = productsData.map(p => toDisplayProduct({
          ...p,
          seller: sellerData
        }));
        setProducts(displayProducts);
      }

      setLoading(false);
    };

    fetchSellerData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.sold - a.sold;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <GovalyHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <GovalyHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-6">The seller store you're looking for doesn't exist or is no longer active.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GovalyHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Store Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card border border-border overflow-hidden flex-shrink-0">
              {seller.logo_url ? (
                <img src={seller.logo_url} alt={seller.shop_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Store className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{seller.shop_name}</h1>
                {seller.level && (
                  <Badge variant="secondary" className="capitalize">
                    {seller.level}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>

              {seller.description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{seller.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {seller.rating !== null && seller.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{seller.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">Rating</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{products.length} Products</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {seller.created_at ? format(new Date(seller.created_at), 'MMM yyyy') : 'Recently'}</span>
                </div>
                {seller.address && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Products and Reviews */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {/* Sort and View Controls */}
            <div className="mb-6 flex justify-end items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-lg border border-border bg-card text-sm"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "flex flex-col gap-4"
              }>
                {sortedProducts.map((product, index) => (
                  <GovalyProductCard
                    key={`seller-product-${product.id}-${index}`}
                    product={product}
                    variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
                <p className="text-muted-foreground">This seller hasn't added any products yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <SellerReviews sellerId={seller.id} sellerName={seller.shop_name} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
