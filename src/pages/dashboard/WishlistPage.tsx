import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems(data || []);
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
    // Convert to cart format
    const product = {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      images: ['/placeholder.svg'],
      // Add other required fields with defaults
      description: '',
      shortDescription: '',
      category: { id: '', name: '', slug: '', icon: '', productCount: 0 },
      rating: 0,
      reviewCount: 0,
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-sm text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-4">
          Save items you love by clicking the heart icon on products.
        </p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      <div className="grid gap-4">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border rounded-xl"
          >
            <div className="w-20 h-20 rounded-lg bg-secondary flex-shrink-0">
              <img
                src="/placeholder.svg"
                alt={item.product?.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${item.product?.slug}`}
                className="font-semibold hover:text-primary line-clamp-1"
              >
                {item.product?.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold">
                  {formatPrice(item.product?.price || 0)}
                </span>
                {item.product?.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(item.product.original_price)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {item.product?.stock > 0 ? (
                  <span className="text-green-600">In Stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeFromWishlist(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <Button
                size="sm"
                className="gap-2"
                disabled={item.product?.stock === 0}
                onClick={() => addToCart(item)}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
