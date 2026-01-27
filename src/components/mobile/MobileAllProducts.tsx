import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { MobileProductCard } from './MobileProductCard';
import { useProducts, toDisplayProduct } from '@/hooks/useProducts';
import { products as mockProducts } from '@/data/mockData';
import { motion } from 'framer-motion';

export function MobileAllProducts() {
  const { data: dbProducts, isLoading } = useProducts({ limit: 50 });
  
  const allProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : mockProducts;

  return (
    <section className="py-3 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 mb-2.5">
        <h2 className="text-sm font-bold text-foreground">Just For You</h2>
        <Link 
          to="/products" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Products Grid - 3 columns Govaly style */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-2">
          <div className="grid grid-cols-3 gap-1.5">
            {allProducts.slice(0, 12).map((product, index) => (
              <MobileProductCard key={product.id} product={product} index={index} variant="square" />
            ))}
          </div>
          
          {/* Load More Button */}
          {allProducts.length > 12 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <Link
                to="/products"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-secondary/50 hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-colors"
              >
                View All Products
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
