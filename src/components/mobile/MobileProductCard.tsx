import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { motion } from 'framer-motion';

interface MobileProductCardProps {
  product: Product;
  index?: number;
}

export function MobileProductCard({ product, index = 0 }: MobileProductCardProps) {
  // Get shortened product name (first 2 words)
  const shortName = product.name.split(' ').slice(0, 2).join(' ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link 
        to={`/product/${product.slug}`}
        className="block group"
      >
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-secondary/40 dark:bg-secondary/20 rounded-xl overflow-hidden"
        >
          {/* Image Container */}
          <div className="aspect-square p-2 relative">
            <div className="w-full h-full rounded-lg overflow-hidden bg-white dark:bg-card">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            
            {/* Discount Badge */}
            {product.discount && product.discount > 0 && (
              <span className="absolute top-3 left-3 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-white rounded">
                -{product.discount}%
              </span>
            )}
          </div>
          
          {/* Product Info */}
          <div className="px-2 pb-2.5">
            <h3 className="text-xs font-medium text-foreground line-clamp-1 mb-0.5">
              {shortName}
            </h3>
            <p className="text-sm font-bold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
