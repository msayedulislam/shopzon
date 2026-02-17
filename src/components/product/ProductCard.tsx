import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal' | 'square';
  compact?: boolean;
}

export function ProductCard({ product, variant = 'default', compact = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      if (isWishlisted) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: product.id });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/product/${product.slug}`} 
        className="group flex gap-3 p-3 bg-card rounded-lg border border-border/30 hover:border-primary/30 hover:shadow-md transition-all duration-300"
      >
        <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-md bg-secondary/30">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discount && (
            <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
              -{product.discount}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <h3 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors break-words">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 flex-wrap">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{product.rating}</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Square/Compact variant - Govaly style
  if (compact || variant === 'compact' || variant === 'square') {
    return (
      <Link 
        to={`/product/${product.slug}`} 
        className="group block h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className="relative h-full bg-card rounded-lg overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-300"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {/* Square Image Container */}
          <div className="relative aspect-square overflow-hidden bg-secondary/20">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.03 : 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Discount Badge */}
            {product.discount && (
              <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                -{product.discount}%
              </span>
            )}

            {/* Flash Sale Badge */}
            {product.isFlashSale && (
              <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                <Zap className="h-2.5 w-2.5 fill-current" />
              </span>
            )}
            
            {/* Quick Actions on Hover */}
            <motion.div 
              className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md"
                onClick={handleWishlist}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 text-gray-600" />
              </motion.button>
            </motion.div>
          </div>

          {/* Product Info - Compact */}
          <div className="p-2.5">
            <h3 className="font-medium text-foreground text-xs line-clamp-2 leading-snug min-h-[32px] group-hover:text-primary transition-colors break-words">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] text-muted-foreground">{product.rating}</span>
              <span className="text-[10px] text-muted-foreground">• {product.sold || 0} sold</span>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
              <span className="text-sm font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant - Clean card design
  return (
    <Link 
      to={`/product/${product.slug}`} 
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="relative bg-card rounded-xl overflow-hidden border border-border/30 transition-all duration-300"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/20">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.discount && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                -{product.discount}%
              </span>
            )}
            {product.isFlashSale && (
              <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                <Zap className="h-3 w-3 fill-current" />
                Flash
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="absolute top-2 right-2 flex flex-col gap-1.5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center shadow-md"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center shadow-md"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </motion.button>
          </motion.div>

          {/* Add to Cart Button */}
          <motion.div 
            className="absolute bottom-2 left-2 right-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full h-9 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 text-xs font-bold gap-1.5 shadow-lg"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Brand */}
          {product.brand && (
            <p className="text-[10px] text-primary uppercase tracking-wider font-medium mb-1 truncate">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-snug min-h-[40px] group-hover:text-primary transition-colors break-words">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            <span className="text-xs text-muted-foreground">• {product.sold} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-border/50 flex-wrap">
            <span className="text-base font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
