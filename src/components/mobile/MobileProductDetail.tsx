import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Minus, Plus, ArrowLeft, Search, Bell, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, formatPrice } from '@/data/mockData';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const product = products.find((p) => p.slug === slug) || products[0];
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'product' | 'details' | 'reviews'>('details');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();
      setIsWishlisted(!!data);
    };
    checkWishlist();
  }, [user, product.id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background pb-36">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">New Product</h1>
          <div className="flex items-center gap-1">
            <button className="p-2">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Product Image Carousel */}
      <div className="relative bg-secondary/30">
        <div className="aspect-square">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImage}
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>
        </div>
        
        {/* Image Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index % product.images.length)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedImage === index % product.images.length
                  ? 'w-5 bg-foreground'
                  : 'bg-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 bg-white dark:bg-card">
        {/* Price & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <button onClick={handleWishlistToggle} className="flex items-center gap-1 text-muted-foreground">
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm">{product.sold}+</span>
            </button>
          </div>
        </div>

        {/* Product Name */}
        <h1 className="text-base font-medium text-foreground mb-4">
          {product.name}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['product', 'details', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-secondary/60 text-muted-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'details' && (
            <>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Brand</span>
                <span className="text-sm font-medium">{product.brand?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm font-medium">{product.category.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Stock</span>
                <span className="text-sm font-medium text-emerald-600">{product.stock} Available</span>
              </div>
            </>
          )}
          {activeTab === 'product' && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}
          {activeTab === 'reviews' && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {product.reviewCount} reviews • {product.rating} average rating
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-card border-t border-border/50 px-4 py-3 safe-area-bottom z-40">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 rounded-full border-2 border-primary text-primary font-semibold text-sm transition-colors hover:bg-primary/10"
          >
            Add To Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3 rounded-full bg-primary text-white font-semibold text-sm transition-colors hover:bg-primary/90"
          >
            Buy Now
          </button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
