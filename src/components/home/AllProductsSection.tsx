import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/mockData';

export function AllProductsSection() {
  return (
    <section className="py-10 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs sm:text-sm font-medium text-muted-foreground mb-3">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary animate-pulse" />
              <span>All Products</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Explore Our <span className="text-gradient">Collection</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 sm:mt-2">Browse through our complete product catalog</p>
          </div>
          
          <Link 
            to="/products" 
            className="group inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base hover:gap-3 transition-all duration-300"
          >
            View All Products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products Grid - Pixel Perfect Square Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="aspect-square"
            >
              <ProductCard product={product} compact />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
