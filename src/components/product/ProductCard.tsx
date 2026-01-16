import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Sparkles, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        className="group flex gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      >
        <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-xl">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
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
        className="relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: isHovered 
            ? '0 20px 40px -12px rgba(var(--primary-rgb), 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount && (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg"
              >
                -{product.discount}%
              </motion.span>
            )}
            {product.isFlashSale && (
              <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                <Zap className="h-3 w-3 fill-current" />
                Flash
              </span>
            )}
            {product.freeDelivery && (
              <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-[10px] font-medium px-2 py-0.5 shadow-md">
                Free Delivery
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="absolute top-3 right-3 flex flex-col gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 transition-all ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600 dark:text-gray-300'}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
            >
              <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </motion.div>

          {/* Add to Cart Button */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleAddToCart}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] text-primary/80 uppercase tracking-widest font-semibold mb-1.5">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2.5 text-sm leading-tight group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Rating & Sold */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{product.rating}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {product.sold} sold
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}