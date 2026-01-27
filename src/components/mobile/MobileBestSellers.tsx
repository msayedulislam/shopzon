import { Link } from 'react-router-dom';
import { ChevronRight, Flame } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useBestSelling, toDisplayProduct } from '@/hooks/useProducts';
import { getBestSellingProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function MobileBestSellers() {
  const { data: dbProducts, isLoading } = useBestSelling(6);
  
  const bestProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getBestSellingProducts().slice(0, 6);

  if (bestProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
            <Flame className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-base font-bold text-foreground">Best Sellers</h2>
        </div>
        <Link 
          to="/products?sort=bestselling" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          See All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Products Horizontal Scroll */}
      {isLoading ? (
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-36 shrink-0">
              <div className="aspect-[3/4] bg-secondary/40 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
          {bestProducts.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="w-40 shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MobileProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
