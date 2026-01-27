import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

interface MobileProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function MobileProductCard({ product, index = 0, variant = 'default' }: MobileProductCardProps) {
  const shortName = product.name.split(' ').slice(0, 3).join(' ');
  
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link to={`/product/${product.slug}`} className="flex gap-3 p-3 bg-white dark:bg-card rounded-2xl border border-border/30 shadow-sm">
          <div className="w-20 h-20 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">{product.name}</h3>
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">{product.rating}</span>
            </div>
            <p className="text-base font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link 
        to={`/product/${product.slug}`}
        className="block group"
      >
        <motion.div 
          whileTap={{ scale: 0.97 }}
          className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/30 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Image Container */}
          <div className="aspect-square p-2 relative bg-secondary/30">
            <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-card">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            
            {/* Discount Badge */}
            {product.discount && product.discount > 0 && (
              <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-primary to-rose-500 text-white rounded-full shadow-sm">
                -{product.discount}%
              </span>
            )}

            {/* Wishlist Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                // Handle wishlist
              }}
            >
              <Heart className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
          </div>
          
          {/* Product Info */}
          <div className="px-3 py-2.5">
            <h3 className="text-xs font-medium text-foreground line-clamp-2 min-h-[32px] mb-1">
              {shortName}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-1.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-muted-foreground">{product.rating || '4.5'}</span>
              <span className="text-[10px] text-muted-foreground">• {product.sold || 0} sold</span>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-[10px] text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
