import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Zap, TrendingUp } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/product/${product.slug}`} 
        className="group flex gap-5 p-5 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
      >
        <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
              -{product.discount}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2.5 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/product/${product.slug}`} 
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="relative bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/40 transition-all duration-500"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(var(--primary-rgb), 0.1)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30">
          {/* Loading shimmer */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          )}
          
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          
          {/* Premium Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Subtle shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2.5">
            <AnimatePresence>
              {product.discount && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-rose-500/25"
                >
                  -{product.discount}% OFF
                </motion.span>
              )}
              {product.isFlashSale && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/25"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  Flash Sale
                </motion.span>
              )}
              {product.freeDelivery && (
                <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-1 shadow-md backdrop-blur-sm">
                  Free Delivery
                </Badge>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions - Premium styled */}
          <motion.div 
            className="absolute top-4 right-4 flex flex-col gap-2.5"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="h-10 w-10 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300 border border-white/20"
              onClick={handleWishlist}
            >
              <Heart className={`h-4.5 w-4.5 transition-all duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600 dark:text-gray-300'}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="h-10 w-10 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              <Eye className="h-4.5 w-4.5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </motion.div>

          {/* Add to Cart Button - Premium */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 gap-2.5 font-semibold shadow-2xl transition-all duration-300 border border-white/20"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        {/* Product Info - Premium styling */}
        <div className="p-5 space-y-3">
          {/* Brand with elegant line */}
          {product.brand && (
            <div className="flex items-center gap-2">
              <span className="w-6 h-[1px] bg-primary/50"></span>
              <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
                {product.brand.name}
              </p>
            </div>
          )}

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 text-[15px] leading-snug group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Rating & Stats */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 dark:from-amber-500/25 dark:to-orange-500/25 px-2.5 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{product.rating}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              {product.sold} sold
            </div>
          </div>

          {/* Price - Premium gradient */}
          <div className="flex items-baseline gap-2.5 pt-2 border-t border-border/50">
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground/70 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}