import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  } | null;
  productImage: string | null;
}

export function MobileWishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();

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
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

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
  });

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
      rating: 0,
      reviewCount: 0,
      stock: item.product.stock || 0,
      sold: 0,
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

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
          <div className="flex items-center gap-3 h-14 px-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">Wishlist</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-semibold mb-2">Please login</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Login to view and manage your wishlist
          </p>
          <Link to="/login" className="px-8 py-2.5 bg-primary text-white rounded-full font-medium">
            Login
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold">Wishlist</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {wishlistItems.length} items
          </span>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Save items you love by tapping the heart icon
            </p>
            <Link to="/products" className="px-8 py-2.5 bg-primary text-white rounded-full font-medium inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-card rounded-2xl p-3 border border-border/50 flex gap-3"
                >
                  {/* Product Image */}
                  <Link 
                    to={`/product/${item.product?.slug}`}
                    className="w-24 h-24 rounded-xl bg-secondary overflow-hidden shrink-0"
                  >
                    <img
                      src={item.productImage || '/placeholder.svg'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/product/${item.product?.slug}`}
                      className="font-medium text-sm line-clamp-2 hover:text-primary"
                    >
                      {item.product?.name}
                    </Link>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-primary">
                        {formatPrice(item.product?.price || 0)}
                      </span>
                      {item.product?.original_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.product.original_price)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs mt-1">
                      {(item.product?.stock ?? 0) > 0 ? (
                        <span className="text-emerald-600">In Stock</span>
                      ) : (
                        <span className="text-destructive">Out of Stock</span>
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={(item.product?.stock ?? 0) === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-full text-xs font-medium disabled:opacity-50"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist.mutate(item.id)}
                        className="p-2 rounded-full bg-secondary text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}
