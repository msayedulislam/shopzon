import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { motion } from 'framer-motion';

interface MobileProductCardProps {
  product: Product;
  index?: number;
}

export function MobileProductCard({ product, index = 0 }: MobileProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link 
        to={`/product/${product.slug}`}
        className="block bg-white dark:bg-card rounded-xl overflow-hidden"
      >
        <div className="aspect-square bg-secondary/30 p-2">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div className="p-2">
          <h3 className="text-xs font-medium text-foreground line-clamp-1 mb-1">
            {product.name.split(' ').slice(0, 2).join(' ')}
          </h3>
          <p className="text-sm font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
