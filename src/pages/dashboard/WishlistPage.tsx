import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/mockData';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product:products (
            id,
            name,
            slug,
            price,
            original_price,
            discount_percent,
            stock,
            rating,
            review_count
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch product images separately
      const productIds = data?.map(item => item.product?.id).filter(Boolean) || [];
      
      if (productIds.length > 0) {
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('product_id, image_url, sort_order')
          .in('product_id', productIds)
          .order('sort_order');
        
        const imagesMap = (imagesData || []).reduce((acc, img) => {
          if (!acc[img.product_id]) {
            acc[img.product_id] = img.image_url;
          }
          return acc;
        }, {} as Record<string, string>);

        const itemsWithImages = data?.map(item => ({
          ...item,
          product: {
            ...item.product,
            image: imagesMap[item.product?.id] || null
          }
        })) || [];

        setWishlistItems(itemsWithImages);
      } else {
        setWishlistItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlistItems(wishlistItems.filter((item) => item.id !== wishlistId));
      toast({
        title: 'Removed from Wishlist',
        description: 'Product has been removed from your wishlist.',
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = (item: any) => {
    const product = {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      images: [item.product.image || '/placeholder.svg'],
      description: '',
      shortDescription: '',
      category: { id: '', name: '', slug: '', icon: '', productCount: 0 },
      rating: item.product.rating || 0,
      reviewCount: item.product.review_count || 0,
      stock: item.product.stock,
      sold: 0,
      tags: [],
      isFeatured: false,
      isFlashSale: false,
      freeDelivery: false,
      seller: { id: '', name: '', slug: '', rating: 0, productCount: 0, joinedAt: new Date(), verified: false, level: 'bronze' as const },
      createdAt: new Date(),
    };

    addItem(product);
    toast({
      title: 'Added to Cart',
      description: 'Product has been added to your cart.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">
              Products you've saved for later
            </p>
          </div>
          <Badge variant="secondary" className="w-fit text-base px-4 py-2 gap-2">
            <Heart className="h-4 w-4 fill-current" />
            {wishlistItems.length} Item{wishlistItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-pink-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Save items you love by clicking the heart icon on products. They'll appear here for easy access.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors group"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="w-full sm:w-40 h-40 bg-secondary flex-shrink-0">
                  <img
                    src={item.product?.image || '/placeholder.svg'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col">
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product?.slug}`}
                      className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.product?.name}
                    </Link>

                    {/* Rating */}
                    {item.product?.rating > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{item.product.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({item.product.review_count} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(item.product?.price || 0)}
                      </span>
                      {item.product?.original_price && (
                        <span className="text-muted-foreground line-through">
                          {formatPrice(item.product.original_price)}
                        </span>
                      )}
                      {item.product?.discount_percent > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          -{item.product.discount_percent}%
                        </Badge>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3">
                      {item.product?.stock > 0 ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                          <Package className="h-3 w-3 mr-1" />
                          In Stock ({item.product.stock} available)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                    <Button
                      className="gap-2 flex-1 sm:flex-none"
                      disabled={item.product?.stock === 0}
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
