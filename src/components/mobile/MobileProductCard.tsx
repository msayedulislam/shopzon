import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

interface MobileProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'compact' | 'horizontal' | 'square';
}

export function MobileProductCard({ product, index = 0, variant = 'default' }: MobileProductCardProps) {
  const shortName = product.name.split(' ').slice(0, 4).join(' ');
  
  // Horizontal variant for search results
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link to={`/product/${product.slug}`} className="flex gap-2.5 p-2 bg-white dark:bg-card rounded-lg border border-border/40">
          <div className="w-16 h-16 rounded-md bg-secondary/30 overflow-hidden flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="text-xs font-medium text-foreground line-clamp-2 mb-0.5">{product.name}</h3>
            <div className="flex items-center gap-1 mb-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-muted-foreground">{product.rating}</span>
            </div>
            <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Square variant - Govaly style compact cards
  if (variant === 'square' || variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.25 }}
      >
        <Link 
          to={`/product/${product.slug}`}
          className="block"
        >
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-card rounded-lg overflow-hidden border border-border/30"
          >
            {/* Square Image Container */}
            <div className="aspect-square relative bg-secondary/20">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Discount Badge - Small pill */}
              {product.discount && product.discount > 0 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-primary text-white rounded">
                  -{product.discount}%
                </span>
              )}
            </div>
            
            {/* Product Info - Compact */}
            <div className="p-2">
              <h3 className="text-[11px] font-medium text-foreground line-clamp-2 min-h-[28px] leading-tight">
                {shortName}
              </h3>
              
              {/* Price Row */}
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-sm font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-[9px] text-muted-foreground line-through">
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
  
  // Default variant - Standard card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Link 
        to={`/product/${product.slug}`}
        className="block"
      >
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-card rounded-lg overflow-hidden border border-border/30"
        >
          {/* Image Container */}
          <div className="aspect-square relative bg-secondary/20">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Discount Badge */}
            {product.discount && product.discount > 0 && (
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-primary text-white rounded">
                -{product.discount}%
              </span>
            )}

            {/* Wishlist Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 dark:bg-card/90 flex items-center justify-center shadow-sm"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Heart className="h-3 w-3 text-muted-foreground" />
            </motion.button>
          </div>
          
          {/* Product Info */}
          <div className="p-2">
            <h3 className="text-[11px] font-medium text-foreground line-clamp-2 min-h-[28px] leading-tight">
              {shortName}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[9px] text-muted-foreground">{product.rating || '4.5'}</span>
              <span className="text-[9px] text-muted-foreground">• {product.sold || 0} sold</span>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-sm font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-[9px] text-muted-foreground line-through">
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
