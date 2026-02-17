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
  // Use full name and let CSS line-clamp handle truncation
  // const shortName = product.name;

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
                {product.name}
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

  // Default variant - Modern compact card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="block bg-white dark:bg-card border border-border/50 rounded-lg overflow-hidden group"
      >
        <div className="aspect-square relative bg-secondary/10">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.discount && product.discount > 0 && (
            <span className="absolute top-0 left-0 px-2 py-0.5 text-[10px] font-bold bg-primary text-white rounded-br-lg">
              -{product.discount}%
            </span>
          )}
        </div>

        <div className="p-2 space-y-1">
          <h3 className="text-[12px] font-medium text-foreground line-clamp-2 min-h-[32px] leading-tight">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-muted-foreground">{product.rating || '4.5'}</span>
            <span className="text-[10px] text-muted-foreground">• {product.sold || 0} sold</span>
          </div>

          <div className="flex items-center gap-1.5">
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
      </Link>
    </motion.div>
  );
}
