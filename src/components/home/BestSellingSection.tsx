import { motion } from 'framer-motion';
import { ChevronRight, Loader2, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { useBestSelling, toDisplayProduct } from '@/hooks/useProducts';
import { getBestSellingProducts } from '@/data/mockData';

export function BestSellingSection() {
  const { data: dbProducts, isLoading } = useBestSelling(10);
  
  const bestSellers = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : getBestSellingProducts().slice(0, 10);

  if (bestSellers.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-6 bg-white dark:bg-card">
      <div className="container">
        {/* Section Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-foreground">Best Sellers</h2>
          </div>
          
          <Link 
            to="/products?sort=best-selling"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {bestSellers.slice(0, 10).map((product, index) => (
              <motion.div
                key={`best-${product.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <ProductCard product={product} variant="square" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
