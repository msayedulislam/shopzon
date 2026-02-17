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
    <div className="space-y-8">
      {/* Header - Premium Govaly Design */}
      <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Dashboard</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">My Premium Wishlist</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70">
              Your curated collection of Govaly heritage
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/5">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Heart className="h-6 w-6 fill-white" strokeWidth={2.5} />
            </div>
            <div className="pr-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Saved Items</p>
              <p className="text-xl font-black uppercase tracking-tighter italic">{wishlistItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-[2rem] bg-secondary/50 flex items-center justify-center mx-auto mb-6 border border-border/10">
            <Heart className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter italic mb-3">Your Archive is Empty</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8 max-w-sm mx-auto leading-relaxed">
            Curate your personal collection of Govaly excellence by exploring our seasonal heritage products.
          </p>
          <Link to="/products">
            <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Discover Excellence
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-card rounded-[2.5rem] border border-border/5 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Product Image Section */}
                <div className="relative w-full md:w-56 h-56 bg-secondary overflow-hidden shrink-0">
                  <img
                    src={item.product?.image || '/placeholder.svg'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1 shadow-lg">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {item.product?.rating?.toFixed(1) || 'NEW'}
                    </div>
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <Link
                        to={`/product/${item.product?.slug}`}
                        className="text-xl font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.product?.name}
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-all active:scale-90"
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Archive ID: {item.product?.id?.slice(0, 8)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black uppercase tracking-tighter italic text-black dark:text-white">
                          {formatPrice(item.product?.price || 0)}
                        </span>
                        {item.product?.original_price && (
                          <span className="text-xs text-muted-foreground line-through font-bold">
                            {formatPrice(item.product.original_price)}
                          </span>
                        )}
                      </div>
                      {item.product?.discount_percent > 0 && (
                        <Badge variant="destructive" className="bg-primary hover:bg-primary rounded-full border-0 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
                          -{item.product.discount_percent}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4">
                      {item.product?.stock > 0 ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[9px] bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                          <Package className="h-3 w-3" strokeWidth={3} />
                          Limited HERITAGE AVAILABLE
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[9px] bg-primary/10 w-fit px-3 py-1 rounded-full">
                          <Package className="h-3 w-3" strokeWidth={3} />
                          OUT OF COLLECTION
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Actions */}
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border/5">
                    <Button
                      className="h-12 flex-1 md:flex-none md:px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px]"
                      disabled={item.product?.stock === 0}
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-3" strokeWidth={3} />
                      Claim Ownership
                    </Button>
                    <Link to={`/product/${item.product?.slug}`} className="hidden md:block">
                      <Button variant="outline" className="h-12 px-8 rounded-2xl border-border/5 font-black uppercase tracking-widest text-[10px] hover:bg-secondary">
                        Examine Artifact
                      </Button>
                    </Link>
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
