import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { products as mockProducts } from '@/data/mockData';
import { useProducts, toDisplayProduct } from '@/hooks/useProducts';

export function AllProductsSection() {
  const { data: dbProducts, isLoading } = useProducts({ limit: 20 });
  
  const allProducts = dbProducts && dbProducts.length > 0
    ? dbProducts.map(toDisplayProduct)
    : mockProducts;

  return (
    <section className="py-6 bg-white dark:bg-card">
      <div className="container">
        {/* Section Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Just For You</h2>
          
          <Link 
            to="/products" 
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid - 5 columns */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {allProducts.slice(0, 20).map((product, index) => (
              <motion.div
                key={`all-${product.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <ProductCard product={product} variant="square" />
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {allProducts.length > 20 && (
          <div className="mt-4 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium text-foreground transition-colors"
            >
              View All Products
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
