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
import { MobileHeader } from './MobileHeader';
import { ShoppingCart, Award, Truck, Shield, RotateCcw } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-background pb-36">
      <MobileHeader title="Product Details" showBack />

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
              className={`w-2 h-2 rounded-full transition-all ${selectedImage === index % product.images.length
                ? 'w-5 bg-foreground'
                : 'bg-foreground/30'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 py-6 bg-white dark:bg-card rounded-t-[32px] -mt-8 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {/* Brand & Badges */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-full uppercase tracking-widest">
            {product.brand?.name || 'GENUINE'}
          </span>
          <div className="flex gap-2">
            {product.discount && (
              <span className="bg-destructive text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                -{product.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Product Name */}
        <h1 className="text-lg font-black text-foreground leading-tight mb-4">
          {product.name}
        </h1>

        {/* Price & Rating Row */}
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-black text-primary tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/30 font-bold">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-[11px] font-bold text-muted-foreground ml-1">({product.reviewCount} Reviews)</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleWishlistToggle}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${isWishlisted ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground'
                }`}
            >
              <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">
              {product.sold}+ Sold
            </span>
          </div>
        </div>

        {/* Tabs - Govaly Style */}
        <div className="flex p-1 bg-secondary/30 rounded-2xl mb-6">
          {(['product', 'details', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab
                ? 'bg-white dark:bg-card text-primary shadow-sm'
                : 'text-muted-foreground'
                }`}
            >
              {tab === 'product' ? 'About' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4 mb-8">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Brand', value: product.brand?.name || 'Genuine' },
                { label: 'Category', value: product.category.name },
                { label: 'Stock', value: `${product.stock} Available`, color: 'text-emerald-600' },
                { label: 'Warranty', value: '1 Year Manufacturer' }
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-3 px-4 bg-secondary/10 rounded-xl border border-border/5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{row.label}</span>
                  <span className={`text-xs font-black ${row.color || 'text-foreground'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'product' && (
            <div className="bg-secondary/10 p-4 rounded-2xl border border-border/5">
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="bg-secondary/10 p-8 rounded-2xl border border-border/5 text-center">
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm font-black mb-1">{product.rating} / 5.0</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Based on {product.reviewCount} customer reviews
              </p>
            </div>
          )}
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Truck, title: "Free Shop", color: "bg-blue-500" },
            { icon: Shield, title: "Warranty", color: "bg-emerald-500" },
            { icon: RotateCcw, title: "7 Days", color: "bg-primary" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-card rounded-2xl border border-border/5 shadow-sm">
              <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight text-center">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar - Massive & Bold */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-t border-border/10 px-4 py-4 safe-area-bottom z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-4 rounded-2xl border-2 border-primary text-primary font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add To Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            Buy Now
          </button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
