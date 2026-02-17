import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { motion } from 'framer-motion';

interface MobileProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function MobileProductCard({ product, index = 0, variant = 'default' }: MobileProductCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link to={`/product/${product.slug}`} className="flex gap-2.5 p-2 bg-white rounded-lg border border-border/40 active:bg-secondary/30">
        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-secondary/20">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-sm font-black text-primary">{formatPrice(product.price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="block bg-white border border-border/40 rounded-lg overflow-hidden active:opacity-90 transition-opacity"
      >
        <div className="aspect-square relative flex items-center justify-center bg-[#f9f9f9]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
          {product.discount && product.discount > 0 && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-black bg-primary text-white rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>

        <div className="p-1.5 space-y-0.5 bg-white">
          <h3 className="text-[10px] font-black text-foreground line-clamp-1 leading-tight uppercase tracking-tighter">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[12px] font-black text-primary tracking-tighter">
              {formatPrice(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[9px] text-muted-foreground line-through decoration-muted-foreground/30 font-bold">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <div className="bg-emerald-50 px-1 py-0.5 rounded">
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Free Delivery</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
