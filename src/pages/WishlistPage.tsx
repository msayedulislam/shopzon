import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, Package, ArrowRight } from 'lucide-react';
import { GovalyHeader } from '@/components/layout/GovalyHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileWishlistPage } from '@/components/mobile/MobileWishlistPage';

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    discount_percent: number | null;
    stock: number | null;
    rating: number | null;
    sold: number | null;
  } | null;
  productImage: string | null;
}

export default function WishlistPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  // Fetch wishlist with product details and images
  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          product:products (
            id,
            name,
            slug,
            price,
            original_price,
            discount_percent,
            stock,
            rating,
            sold
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch product images for each item
      const itemsWithImages = await Promise.all(
        (data || []).map(async (item) => {
          let productImage = null;
          if (item.product_id) {
            const { data: imageData } = await supabase
              .from('product_images')
              .select('image_url')
              .eq('product_id', item.product_id)
              .order('sort_order', { ascending: true })
              .limit(1)
              .maybeSingle();
            productImage = imageData?.image_url || null;
          }
          return { ...item, productImage } as WishlistItem;
        })
      );

      return itemsWithImages;
    },
    enabled: !!user
  });

  // Remove from wishlist mutation
  const removeFromWishlist = useMutation({
    mutationFn: async (wishlistId: string) => {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove item');
    }
  });

  // Add to cart
  const handleAddToCart = (item: WishlistItem) => {
    if (!item.product) return;

    const product = {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      images: [item.productImage || '/placeholder.svg'],
      description: '',
      shortDescription: '',
      category: { id: '', name: '', slug: '', icon: '', productCount: 0 },
      rating: item.product.rating || 0,
      reviewCount: 0,
      stock: item.product.stock || 0,
      sold: item.product.sold || 0,
      tags: [],
      isFeatured: false,
      isFlashSale: false,
      freeDelivery: false,
      seller: { id: '', name: '', slug: '', rating: 0, productCount: 0, joinedAt: new Date(), verified: false, level: 'bronze' as const },
      createdAt: new Date(),
    };

    addItem(product);
    toast.success('Added to cart');
  };

  // Add all to cart
  const handleAddAllToCart = () => {
    let addedCount = 0;
    wishlistItems.forEach((item) => {
      if (item.product && (item.product.stock ?? 0) > 0) {
        handleAddToCart(item);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
    }
  };

  if (isMobile) {
    return <MobileWishlistPage />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GovalyHeader />
        <main className="flex-1 container py-12">
          <div className="max-w-md mx-auto text-center py-16">
            <Heart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
            <p className="text-muted-foreground mb-6">
              Please login to view and manage your wishlist.
            </p>
            <Link to="/login">
              <Button size="lg" className="font-semibold">
                Login to Continue
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GovalyHeader />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/30 py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
                <p className="text-muted-foreground">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              {wishlistItems.length > 0 && (
                <Button
                  onClick={handleAddAllToCart}
                  className="gap-2 font-semibold"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add All to Cart
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center py-16"
            >
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save items you love by clicking the heart icon on products.
              </p>
              <Link to="/products">
                <Button size="lg" className="gap-2 font-semibold">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all group"
                  >
                    {/* Product Image */}
                    <Link to={`/product/${item.product?.slug}`} className="block relative aspect-square overflow-hidden">
                      <img
                        src={item.productImage || '/placeholder.svg'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.product?.discount_percent && item.product.discount_percent > 0 && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold">
                          -{item.product.discount_percent}%
                        </Badge>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWishlist.mutate(item.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </button>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <Link
                        to={`/product/${item.product?.slug}`}
                        className="font-semibold line-clamp-2 hover:text-primary transition-colors"
                      >
                        {item.product?.name}
                      </Link>

                      {/* Rating & Sold */}
                      {item.product?.rating && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            {item.product.rating}
                          </span>
                          {item.product.sold && item.product.sold > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {item.product.sold} sold
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(item.product?.price || 0)}
                        </span>
                        {item.product?.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.product.original_price)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <p className="text-sm">
                        {(item.product?.stock ?? 0) > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="text-destructive font-medium">
                            ✕ Out of Stock
                          </span>
                        )}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromWishlist.mutate(item.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          className="flex-1 gap-2 font-semibold"
                          disabled={(item.product?.stock ?? 0) === 0}
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
