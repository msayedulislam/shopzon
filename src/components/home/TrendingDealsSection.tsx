import { motion } from 'framer-motion';
import { Percent, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { products as mockProducts } from '@/data/mockData';
import { useDiscountProducts, toDisplayProduct } from '@/hooks/useProducts';

export function TrendingDealsSection() {
  const { data: dbProducts, isLoading } = useDiscountProducts(8);
  
  // Get products with highest discounts
  const trendingDeals = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct).filter(p => p.discount && p.discount > 0)
    : [...mockProducts]
        .filter(p => p.discount && p.discount > 0)
        .sort((a, b) => (b.discount || 0) - (a.discount || 0))
        .slice(0, 8);

  if (trendingDeals.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-10 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-background to-background" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-rose-500/10 blur-[120px]" />
      
      <div className="container relative z-10 px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 md:mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-medium mb-3">
              <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Hot Deals</span>
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Trending <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">Deals</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 sm:mt-2">Grab the best discounts before they're gone</p>
          </div>
          
          <Link 
            to="/products?deals=true" 
            className="group inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm sm:text-base hover:gap-3 transition-all duration-300"
          >
            View All Deals
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {trendingDeals.map((product, index) => (
              <motion.div
                key={`deal-${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="aspect-square"
              >
                <ProductCard product={product} compact />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
