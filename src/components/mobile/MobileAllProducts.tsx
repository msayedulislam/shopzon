import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, LayoutGrid } from 'lucide-react';
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
    <section className="py-4 bg-white dark:bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <LayoutGrid className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-base font-bold text-foreground">All Products</h2>
        </div>
        <Link 
          to="/products" 
          className="flex items-center gap-0.5 text-xs text-primary font-medium"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {allProducts.slice(0, 10).map((product, index) => (
              <MobileProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          
          {/* Load More Button */}
          {allProducts.length > 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-secondary/70 hover:bg-secondary rounded-2xl text-sm font-semibold text-foreground transition-colors"
              >
                Browse All Products
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
